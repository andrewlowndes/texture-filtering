import type { ShaderCode } from "../../interfaces/ShaderCode";

export const LineRange: ShaderCode = {
    text: /* glsl */`
        struct LineRange {
            vec2 pStart;
            vec2 pEnd;
            vec2 xRange;
            LineEquation equation;
        };
    `
};
