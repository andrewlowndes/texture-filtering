import type { Shader } from '../interfaces/Shader';
import { triangleCoverage } from './rasterise/triangleCoverage';
import { Triangle } from './structs/Triangle';

export const generator: Shader = {
    version: '300 es',
    vertex: {
        head: /* glsl */ `
            const vec2[3] coords = vec2[3](
                vec2(-1.0, 1.0),
                vec2(3.0, 1.0),
                vec2(-1.0, -3.0)
            );
        `,
        main: /* glsl */ `
            gl_Position = vec4(coords[gl_VertexID], 0.0, 1.0);
        `
    },
    fragment: {
        dependencies: [Triangle, triangleCoverage],
        head: /* glsl */ `
            precision mediump float;

            uniform vec2 uStep;
            uniform uint uResolution;
            uniform uint uSize;
            uniform sampler2D uSampler;

            out vec4 outColor;
        `,
        main: /* glsl */ `
            //start from the top left corner like the other solutions
            uvec2 pixelIndex = uvec2(gl_FragCoord.x, uSize - uint(gl_FragCoord.y));
            uint flatPixelIndex = pixelIndex.y * uSize + pixelIndex.x;

            //deconstruct the 2d coord into the 3 2d triangle coords
            uint inverseIndex = flatPixelIndex;
            uint p3y = inverseIndex % uResolution;
            inverseIndex /= uResolution;
            uint p3x = inverseIndex % uResolution;
            inverseIndex /= uResolution;
            uint p2y = inverseIndex % uResolution;
            inverseIndex /= uResolution;
            uint p2x = inverseIndex % uResolution;
            inverseIndex /= uResolution;
            uint p1y = inverseIndex % uResolution;
            inverseIndex /= uResolution;
            uint p1x = inverseIndex;

            Triangle triangle = Triangle(
                vec2(p1x, p1y) * uStep,
                vec2(p2x, p2y) * uStep,
                vec2(p3x, p3y) * uStep
            );

            outColor = triangleCoverage(triangle, uSampler);
        `
    }
};
