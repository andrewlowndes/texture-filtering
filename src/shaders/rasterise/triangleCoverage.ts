import type { ShaderCode } from '../../interfaces/ShaderCode';
import type { ShaderParameter } from '../../interfaces/ShaderParameter';
import { callShaderSnippet } from '../../webgl/callShaderSnippet';
import { createShaderSnippetInstance } from '../../webgl/createShaderSnippetInstance';
import { snippetResult } from '../../webgl/snippetResult';
import { intersectTriangleSquare } from '../intersect/intersectTriangleSquare';
import { epsilon } from '../maths/epsilon';
import { vec2Determinant } from '../maths/vec2Determinant';
import { Aabb } from '../structs/Aabb';
import { Triangle } from '../structs/Triangle';
import { triangleArea } from '../triangle/triangleArea';
import { rasterise } from './rasterise';

const rasteriseResult: Array<ShaderParameter> = [
    { qualifier: 'inout', type: 'vec4', name: 'colour' },
    { qualifier: 'inout', type: 'int', name: 'numPixels' },
    { qualifier: 'in', type: 'sampler2D', name: 'texture' },
    { qualifier: 'in', type: 'Triangle', name: 'triangle' },
    { qualifier: 'in', type: 'Triangle', name: 'edges' }
];

const rasteriseCallbackParams: Array<ShaderParameter> = [
    { qualifier: 'in', type: 'uvec3', name: 'range' },
    { qualifier: 'in', type: 'bool', name: 'isInside' }
];

const rasteriseLines = createShaderSnippetInstance({
    snippet: rasterise,
    resultObjs: rasteriseResult,
    params: [
        createShaderSnippetInstance({
            resultObjs: rasteriseResult,
            snippet: {
                params: rasteriseCallbackParams,
                text: () => /* glsl */ `
                    for (uint x=range.x; x<=range.y; x++) {
                        ${snippetResult}colour += texelFetch(${snippetResult}texture, ivec2(x, range.z), 0);
                        ${snippetResult}numPixels += 1;
                    }
                `
            }
        })
    ]
});

const rasteriseTriangle = createShaderSnippetInstance({
    dependencies: [intersectTriangleSquare, vec2Determinant, Aabb],
    snippet: rasterise,
    resultObjs: rasteriseResult,
    params: [
        createShaderSnippetInstance({
            resultObjs: rasteriseResult,
            snippet: {
                params: rasteriseCallbackParams,
                text: () => /* glsl */ `
                    if (isInside) {
                        for (uint x=range.x; x<range.y; x++) {
                            ${snippetResult}colour += texelFetch(${snippetResult}texture, ivec2(x, range.z), 0);
                        }
                    } else {
                        //process each outer pixel separately so we have per-pixel shading
                        uint yMax = range.z + uint(1);

                        for (uint x=range.x; x<range.y; x++) {
                            Aabb bounds = Aabb(vec2(x, range.z), vec2(x + uint(1), yMax));

                            //as a test, determine the coverage of the triangle in outside cells and use as antialiasing
                            vec2[12] polygon = intersectTriangleSquare(${snippetResult}triangle, ${snippetResult}edges, bounds);
                            
                            float percentCoverage = clamp(abs((
                                vec2Determinant(polygon[0], polygon[1]) +
                                vec2Determinant(polygon[1], polygon[2]) +
                                vec2Determinant(polygon[2], polygon[3]) +
                                vec2Determinant(polygon[3], polygon[4]) +
                                vec2Determinant(polygon[4], polygon[5]) +
                                vec2Determinant(polygon[5], polygon[6]) +
                                vec2Determinant(polygon[6], polygon[7]) +
                                vec2Determinant(polygon[7], polygon[8]) +
                                vec2Determinant(polygon[8], polygon[9]) +
                                vec2Determinant(polygon[9], polygon[10]) +
                                vec2Determinant(polygon[10], polygon[11]) +
                                vec2Determinant(polygon[11], polygon[0])
                            ) / 2.0), 0.0, 1.0);

                            ${snippetResult}colour += texelFetch(${snippetResult}texture, ivec2(x, range.z), 0) * percentCoverage;
                        }
                    }
                `
            }
        })
    ]
});

export const triangleCoverage: ShaderCode = {
    dependencies: [Triangle, triangleArea, rasteriseLines, rasteriseTriangle, epsilon],
    text: /* glsl */ `
        vec4 triangleCoverage(Triangle triangle, sampler2D texture) {
            float area = triangleArea(triangle);

            Triangle edges = Triangle(triangle.p2 - triangle.p1, triangle.p3 - triangle.p2, triangle.p1 - triangle.p3);

            vec4 colour = vec4(0.0);
            int numPixels = 0;
            
            //if the triangle is degenerate and has no area then we just average the colours the lines cover
            if (area < 1.0) {
                ${callShaderSnippet(
                    rasteriseLines,
                    ['triangle'],
                    ['colour', 'numPixels', 'texture', 'triangle', 'edges']
                )}
                return colour / float(numPixels);
            }
            
            ${callShaderSnippet(
                rasteriseTriangle,
                ['triangle'],
                ['colour', 'numPixels', 'texture', 'triangle', 'edges']
            )}
            return colour / area;
        }
    `
};
