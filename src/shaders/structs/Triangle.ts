import type { ShaderCode } from "../../interfaces/ShaderCode";

export const Triangle: ShaderCode = {
    text: /* glsl */`
        struct Triangle {
            vec2 p1;
            vec2 p2;
            vec2 p3;
        };
    `
};
