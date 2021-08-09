import type { ShaderCode } from "../../interfaces/ShaderCode";

export const negFract: ShaderCode = {
    text: /* glsl */`
        float negFract(float a) {
            return 1.0 - x + floor(x);
        }
    `
};
