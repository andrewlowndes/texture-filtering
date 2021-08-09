import { ShaderCode } from "../../interfaces/ShaderCode";

export const epsilon: ShaderCode = {
    text: /* glsl */`
        const float epsilon = 0.00001;
    `
};
