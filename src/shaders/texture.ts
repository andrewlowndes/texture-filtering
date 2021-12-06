import type { Shader } from '../interfaces/Shader';
import { epsilon } from './maths/epsilon';
import { triangleCoverage } from './rasterise/triangleCoverage';
import { Triangle } from './structs/Triangle';

export const textureShader: Shader = {
    version: '300 es',
    vertex: {
        head: /* glsl */ `
            const vec2[3] coords = vec2[3](
                vec2(-1.0, 1.0),
                vec2(3.0, 1.0),
                vec2(-1.0, -3.0)
            );

            const vec2[3] uvs = vec2[3](
                vec2(0.0, 0.0),
                vec2(2.0, 0.0),
                vec2(0.0, 2.0)
            );

            out vec2 vUv;
        `,
        main: /* glsl */ `
            vUv = uvs[gl_VertexID];
            gl_Position = vec4(coords[gl_VertexID], 0.0, 1.0);
        `
    },
    fragment: {
        dependencies: [Triangle, triangleCoverage, epsilon],
        head: /* glsl */ `
            precision mediump float;

            uniform sampler2D uSampler;
            uniform int uDivisor;

            in vec2 vUv;
            out vec4 outColor;
        `,
        main: /* glsl */ `
            ivec2 texCoord = ivec2(floor(vUv * vec2(textureSize(uSampler, 0))));

            //visualise the data
            outColor = texelFetch(uSampler, texCoord, 0);
        `
    }
};
