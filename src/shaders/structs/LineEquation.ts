import type { ShaderCode } from "../../interfaces/ShaderCode";

export const LineEquation: ShaderCode = {
    text: /* glsl */`
        struct LineEquation {
            float gradient;
            float intersect;
        };
    `
};
