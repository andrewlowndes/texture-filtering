import type { SummedTexture } from "../interfaces/SummedTexture";
import { add4Mutate } from "../utils/add4Mutate";
import { subtract4Mutate } from "../utils/subtract4Mutate";

//similar to createSummedTexture except creates a single uint32 array and flips the y of the image
export const createSummedTextureWebgl = (imageData: ImageData): Uint32Array => {
    const summedTexture: SummedTexture = new Array(imageData.height);
    
    for (let y=0; y<imageData.height; y++) {
        summedTexture[y] = new Array(imageData.width);
        
        for (let x=0; x<imageData.width; x++) {
            const i = ((imageData.height - 1 - y) * imageData.width + x) * 4;
            const pix = new Uint32Array(imageData.data.slice(i, i + 4));
    
            if (x > 0) {
                add4Mutate(pix, summedTexture[y][x-1]);
            }
    
            if (y > 0) {
                add4Mutate(pix, summedTexture[y-1][x]);
            }
    
            if (x > 0 && y > 0) {
                subtract4Mutate(pix, summedTexture[y-1][x-1]);
            }
    
            summedTexture[y][x] = pix;
        }
    }

    const summedImageRaw = new Uint32Array(imageData.width * imageData.height * 4);

    for (let i=0, y=imageData.height-1; y>=0; y--) {
        const row = summedTexture[y];
        for (let x=0; x<imageData.width; x++, i+=4) {
            const pix = row[x];

            summedImageRaw[i] = pix[0];
            summedImageRaw[i+1] = pix[1];
            summedImageRaw[i+2] = pix[2];
            summedImageRaw[i+3] = pix[3];
        }
    }

    return summedImageRaw;
};
