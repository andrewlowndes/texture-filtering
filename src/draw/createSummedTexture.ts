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

        //add a padded cell on the end of each row
        /*const pix = new Uint32Array(summedTexture[y][imageData.width-1]);

        if (y > 0) {
            add4Mutate(pix, summedTexture[y-1][imageData.width]);
            subtract4Mutate(pix, summedTexture[y-1][imageData.width-1]);
        }

        summedTexture[y][imageData.width] = pix;*/
    }

    //add a padded row
    /*summedTexture[imageData.height] = new Array(imageData.width + 1);
        
    for (let x=0; x<=imageData.width; x++) {
        const pix = new Uint32Array(summedTexture[imageData.height-1][x]);

        if (x > 0) {
            add4Mutate(pix, summedTexture[imageData.height][x-1]);
            subtract4Mutate(pix, summedTexture[imageData.height-1][x-1]);
        }

        summedTexture[imageData.height][x] = pix;
    }
    */

    return summedTexture;
};
