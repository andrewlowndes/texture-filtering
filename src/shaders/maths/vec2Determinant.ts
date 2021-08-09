import type { ShaderCode } from "../../interfaces/ShaderCode";

export const vec2Determinant: ShaderCode = {
    text: /* glsl */`
        float vec2Determinant(vec2 p1, vec2 p2) {
            return (p1.x * p2.y) - (p1.y * p2.x);
        }
    `
};
