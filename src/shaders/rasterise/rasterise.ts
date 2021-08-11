import type { ShaderSnippet, ShaderSnippetInstance } from '../../interfaces/ShaderSnippet';
import { callShaderSnippet } from '../../webgl/callShaderSnippet';
import { getLineRange } from '../line/getLineRange';
import { solveLineX } from '../line/solveLineX';
import { Line } from '../structs/Line';
import { LineRange } from '../structs/LineRange';
import { Triangle } from '../structs/Triangle';
import { triangleMax } from '../triangle/triangleMax';
import { triangleMin } from '../triangle/triangleMin';

//note: this is a conservative rasteriser
export const rasterise: ShaderSnippet = {
    dependencies: [triangleMin, triangleMax, Line, LineRange, getLineRange, Triangle, solveLineX],
    params: [{ qualifier: 'in', type: 'Triangle', name: 'triangle' }],
    text: (cb: ShaderSnippetInstance) => /* glsl */ `
        vec2 minPos = triangleMin(triangle);
        vec2 maxPos = triangleMax(triangle);

        Line[3] lines = Line[3](
            Line(triangle.p1, triangle.p2),
            Line(triangle.p2, triangle.p3),
            Line(triangle.p3, triangle.p1)
        );

        LineRange[3] lineRanges = LineRange[3](
            getLineRange(lines[0]),
            getLineRange(lines[1]), 
            getLineRange(lines[2])
        );
        
        int maxY = int(ceil(maxPos.y));
        int prevY = int(minPos.y);
        
        if (maxY - prevY < 1) {
            ${callShaderSnippet(cb, ['uvec3(minPos.x, maxPos.x, prevY)', 'false'])}
            return;
        }

        for (int y=prevY+1; y<=maxY; y++) {
            //we just need to get four numbers, the outer min and max and inner min and max values
            ivec4 range = ivec4(-1);

            for (int i=0; i<3; i++) {
                LineRange line = lineRanges[i];

                if (line.pEnd.y >= float(prevY) && line.pStart.y < float(y)) {
                    float fromX = solveLineX(line.equation, float(prevY));

                    if (fromX > -1.0) {
                        fromX = clamp(fromX, line.xRange.x, line.xRange.y);
                    } else {
                        fromX = line.pStart.x;
                    }

                    float toX = solveLineX(line.equation, float(y));

                    if (toX > -1.0) {
                        toX = clamp(toX, line.xRange.x, line.xRange.y);
                    } else {
                        toX = line.pEnd.x;
                    }

                    ivec2 xRange = ivec2(min(fromX, toX), max(fromX, toX));

                    if (range.x < 0) {
                        //first entry
                        range.xy = xRange;
                    } else if ((xRange.x <= range.y + 1 && xRange.x >= range.x - 1) || (xRange.y <= range.y + 1 && xRange.y >= range.x - 1)) {
                        //extends the first entry
                        range.xy = ivec2(min(range.x, xRange.x), max(range.y, xRange.y));
                    } else if (range.z < 0) {
                        //must be a new second range, determine if we need to swap or not to keep them ordered
                        if (xRange.x > range.y) {
                            range.zw = xRange;
                        } else {
                            range = ivec4(xRange, range.xy);
                        } 
                    } else {
                        //extends the second range
                        range.zw = ivec2(min(range.z, xRange.x), max(range.w, xRange.y));
                    }
                }
            }

            //we have an inside
            if (range.z > range.y) {
                ${callShaderSnippet(cb, ['uvec3(range.x, range.y, prevY)', 'false'])}
                ${callShaderSnippet(cb, ['uvec3(range.y + 1, range.z - 1, prevY)', 'true'])}
                ${callShaderSnippet(cb, ['uvec3(range.z, range.w, prevY)', 'false'])}
            } else {
                ${callShaderSnippet(cb, ['uvec3(range.x, max(range.y, range.w), prevY)', 'false'])}
            }

            prevY = y;
        }
    `
};
