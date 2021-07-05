import type { SummedTexture } from "../interfaces/SummedTexture";
import { add4Mutate } from "../utils/add4Mutate";
import { subtract4Mutate } from "../utils/subtract4Mutate";

export const createSummedTexture = (imageData: ImageData): SummedTexture => {    
    const summedTexture: SummedTexture = new Array(imageData.height);
    
    for (let i=0, y=0; y<imageData.height; y++) {
        summedTexture[y] = new Array(imageData.width);
        
        for (let x=0; x<imageData.width; x++, i+=4) {
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

    return summedTexture;
};
