import type { ShaderCode } from "../../interfaces/ShaderCode";

export const inverseLerp: ShaderCode = {
    text: /* glsl */`
        float inverseLerp(float a, float diff, float val) {
            return clamp((val - a) / diff, 0.0, 1.0);
        }
    `
};
