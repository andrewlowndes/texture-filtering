import type { ShaderCode } from '../../interfaces/ShaderCode';
import { getPixel } from './getPixel';
import { getSummedArea } from './getSummedArea';

export const averageSummed: ShaderCode = {
    dependencies: [getPixel, getSummedArea],
    text: /* glsl */ `
        //results in up to 24 texture lookups based on complexity of range, whatever size the image is
        vec4 averageSummed(const in usampler2D summedTexture, const in sampler2D texture, const in vec2 minCoord, const in vec2 maxCoord) {
            ivec2 startCell = ivec2(floor(minCoord));
            ivec2 endCell = ivec2(floor(maxCoord));

            //range contained in one pixel
            if (startCell == endCell) {
                return texelFetch(texture, ivec2(startCell), 0);
            }
            
            vec2 size = maxCoord - minCoord;
            float pixelArea = size.x * size.y;
            float colourNormaliser = 1.0 / pixelArea;
            
            ivec2 innerCell = ivec2(ceil(minCoord));
            ivec2 innerCell2 = ivec2(floor(maxCoord));

            vec2 minDiff = vec2(innerCell) - minCoord;
            vec2 maxDiff = maxCoord - vec2(innerCell2);

            vec4 colour = vec4(0.0);

            //TODO: optimise by removing branches
            
            //single horizontal strip
            if (startCell.x == endCell.x) {
                if (minDiff.y > 0.0) {
                    colour += getPixel(texture, startCell) * size.x * minDiff.y;
                }

                if (maxDiff.y > 0.0) {
                    colour += getPixel(texture, endCell) * size.x * maxDiff.y;
                }

                colour += getSummedArea(summedTexture, ivec2(startCell.x, innerCell.y)-1, ivec2(startCell.x, innerCell2.y-1)) * size.x;
                return floor(colour * colourNormaliser);
            }
            
            //single vertical strip
            if (startCell.y == endCell.y) {
                if (minDiff.x > 0.0) {
                    colour += getPixel(texture, startCell) * size.y * minDiff.x;
                }

                if (maxDiff.x > 0.0) {
                    colour += getPixel(texture, endCell) * size.y * maxDiff.x;
                }

                colour += getSummedArea(summedTexture, ivec2(innerCell.x, startCell.y)-1, ivec2(innerCell2.x-1, startCell.y)) * size.y;
                return floor(colour * colourNormaliser);
            }

            //corner cells
            if (minDiff.y > 0.0) {
                if (minDiff.x > 0.0) {
                    colour += getPixel(texture, startCell) * minDiff.x * minDiff.y;
                }

                if (maxDiff.x > 0.0) {
                    colour += getPixel(texture, ivec2(endCell.x, startCell.y)) * maxDiff.x * minDiff.y;
                }
            }

            if (maxDiff.y > 0.0) {
                if (minDiff.x > 0.0) {
                    colour += getPixel(texture, ivec2(startCell.x, endCell.y)) * minDiff.x * maxDiff.y;
                }

                if (maxDiff.x > 0.0) {
                    colour += getPixel(texture, endCell) * maxDiff.x * maxDiff.y;
                }
            }

            //fractional strips
            if (minDiff.y > 0.0) {
                colour += getSummedArea(summedTexture, ivec2(innerCell.x, startCell.y)-1, ivec2(innerCell2.x-1, startCell.y)) * minDiff.y;
            }

            if (minDiff.x > 0.0) {
                colour += getSummedArea(summedTexture, ivec2(startCell.x, innerCell.y)-1, ivec2(startCell.x, innerCell2.y-1)) * minDiff.x;
            }

            if (maxDiff.y > 0.0) {
                colour += getSummedArea(summedTexture, ivec2(innerCell.x, endCell.y)-1, ivec2(innerCell2.x-1, endCell.y)) * maxDiff.y;
            }

            if (maxDiff.x > 0.0) {
                colour += getSummedArea(summedTexture, ivec2(endCell.x, innerCell.y)-1, ivec2(endCell.x, innerCell2.y-1)) * maxDiff.x;
            }

            //inner parts
            colour += getSummedArea(summedTexture, ivec2(innerCell)-1, ivec2(innerCell2)-1);
            
            //now we have an accumulative pixel value that covers the whole area so just average it
            return floor(colour * colourNormaliser);
        }
    `
};
