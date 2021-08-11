import type { ShaderCode } from '../../interfaces/ShaderCode';

export const getSummedArea: ShaderCode = {
    text: /* glsl */ `
        vec4 getSummedArea(const in usampler2D summedTexture, const in ivec2 minCoord, const in ivec2 maxCoord) {
            return vec4(texelFetch(summedTexture, maxCoord, 0) - 
                texelFetch(summedTexture, ivec2(minCoord.x, maxCoord.y), 0) + 
                texelFetch(summedTexture, minCoord, 0) -
                texelFetch(summedTexture, ivec2(maxCoord.x, minCoord.y), 0));
        }
    `
};
