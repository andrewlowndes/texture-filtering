import type { ShaderCode } from '../../interfaces/ShaderCode';

export const Line: ShaderCode = {
    text: /* glsl */ `
        struct Line {
            vec2 p1;
            vec2 p2;
        };
    `
};
