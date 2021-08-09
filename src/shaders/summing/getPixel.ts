import type { ShaderCode } from "../../interfaces/ShaderCode";

export const getPixel: ShaderCode = {
    text: /* glsl */`
        vec4 getPixel(const in sampler2D texture, const in ivec2 pos) {
            return texelFetch(texture, pos, 0) * 255.0;
        }
    `
};
