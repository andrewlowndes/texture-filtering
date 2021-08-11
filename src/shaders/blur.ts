import type { Shader } from '../interfaces/Shader';
import { averageSummed } from './summing/averageSummed';

export const blur: Shader = {
    version: '300 es',
    vertex: {
        head: /* glsl */ `
            in vec2 a_position;
        `,
        main: /* glsl */ `
            gl_Position = vec4(a_position, 0.0, 1.0);
        `
    },
    fragment: {
        dependencies: [averageSummed],
        head: /* glsl */ `
            precision highp float;
            precision highp usampler2D;

            uniform float u_bluramount;
            uniform sampler2D u_texture;
            uniform usampler2D u_summedtexture;

            out vec4 outColor;
        `,
        main: /* glsl */ `
            ivec2 fragCoord = ivec2(gl_FragCoord.xy);
            vec2 tex_size = vec2(textureSize(u_summedtexture, 0));

            vec2 minCoord = clamp(vec2(fragCoord) - u_bluramount, vec2(0.0), tex_size);
            vec2 maxCoord = clamp(vec2(fragCoord) + u_bluramount, vec2(0.0), tex_size);

            vec4 pixelColour = averageSummed(u_summedtexture, u_texture, minCoord, maxCoord);

            outColor = pixelColour / 255.0;
        `
    }
};
