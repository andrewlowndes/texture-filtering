import { SummedTexture } from "../interfaces/SummedTexture";
import { add4Mutate } from "../utils/add4Mutate";
import { floor4Mutate } from "../utils/floor4Mutate";
import { scale4Mutate } from "../utils/scale4Mutate";
import { subtract4Mutate } from "../utils/subtract4Mutate";
import { getPixel } from "./canvas";

const getSummedTextureVal = (summedTexture: SummedTexture, x: number, y: number) => {
    try {
        const result = x >= 0 && y >= 0 ? summedTexture[y][x] : [0,0,0,0];

        if (result === undefined) {
            throw Error('No summed texture value');
        }

        return result;
    } catch (err) {
        console.error(x, y);
        throw err;
    }
};

const getSummedArea = (summedTexture: SummedTexture, x: number, y: number, x2: number, y2: number) => {
    const result = [0,0,0,0];

    try {
        add4Mutate(result, getSummedTextureVal(summedTexture, x2, y2));
        subtract4Mutate(result, getSummedTextureVal(summedTexture, x, y2));
        subtract4Mutate(result, getSummedTextureVal(summedTexture, x2, y));
        add4Mutate(result, getSummedTextureVal(summedTexture, x, y));
    } catch (err) {
        console.error([
            result,
            getSummedTextureVal(summedTexture, x2, y2),
            getSummedTextureVal(summedTexture, x, y2),
            getSummedTextureVal(summedTexture, x2, y),
            getSummedTextureVal(summedTexture, x, y)
        ]);
        throw err;
    }

    return result;
};

//results in up to 24 texture lookups based on complexity of range, whatever size the image is
export const averageSummed = (summedTexture: SummedTexture, imageData: ImageData, x: number, y: number, x2: number, y2: number) => {
    const startCellX = Math.floor(x);
    const startCellY = Math.floor(y);
    const endCellX = Math.floor(x2);
    const endCellY = Math.floor(y2);

    //range contained in one pixel
    if (startCellX == endCellX && startCellY == endCellY) {
        return floor4Mutate(getPixel(imageData, startCellX, startCellY));
    }
    
    const width = x2 - x;
    const height = y2 - y;
    const pixelArea = width * height;
    const colourNormaliser = 1 / pixelArea;
    
    const innerCellX = Math.ceil(x);
    const innerCellY = Math.ceil(y);
    const innerCellX2 = Math.floor(x2);
    const innerCellY2 = Math.floor(y2);
    
    const leftDiff = innerCellX-x;
    const topDiff = innerCellY-y;
    const rightDiff = x2-innerCellX2;
    const bottomDiff = y2-innerCellY2;

    const colour = [0,0,0,0];
    
    //single horizontal strip
    if (startCellX == endCellX) {
        if (topDiff) {
            add4Mutate(colour, scale4Mutate(getPixel(imageData, startCellX, startCellY), width * topDiff));
        }
        if (bottomDiff) {
            add4Mutate(colour, scale4Mutate(getPixel(imageData, endCellX, endCellY), width * bottomDiff));
        }
        add4Mutate(colour, scale4Mutate(getSummedArea(summedTexture, startCellX-1, innerCellY-1, startCellX, innerCellY2-1), width));
        return floor4Mutate(scale4Mutate(colour, colourNormaliser));
    }
    
    //single vertical strip
    if (startCellY == endCellY) {
        if (leftDiff) {
            add4Mutate(colour, scale4Mutate(getPixel(imageData, startCellX, startCellY), height * leftDiff));
        }
        if (rightDiff) {
            add4Mutate(colour, scale4Mutate(getPixel(imageData, endCellX, endCellY), height * rightDiff));
        }
        add4Mutate(colour, scale4Mutate(getSummedArea(summedTexture, innerCellX-1, startCellY-1, innerCellX2-1, startCellY), height));
        return floor4Mutate(scale4Mutate(colour, colourNormaliser));
    }

    //corner cells
    if (topDiff) {
        if (leftDiff) {
            add4Mutate(colour, scale4Mutate(getPixel(imageData, startCellX, startCellY), leftDiff * topDiff));
        }

        if (rightDiff) {
            add4Mutate(colour, scale4Mutate(getPixel(imageData, endCellX, startCellY), rightDiff * topDiff));
        }
    }

    if (bottomDiff) {
        if (leftDiff) {
            add4Mutate(colour, scale4Mutate(getPixel(imageData, startCellX, endCellY), leftDiff * bottomDiff));
        }

        if (rightDiff) {
            add4Mutate(colour, scale4Mutate(getPixel(imageData, endCellX, endCellY), rightDiff * bottomDiff));
        }
    }

    //fractional strips
    if (topDiff) {
        add4Mutate(colour, scale4Mutate(getSummedArea(summedTexture, innerCellX-1, startCellY-1, innerCellX2-1, startCellY), topDiff));
    }

    if (leftDiff) {
        add4Mutate(colour, scale4Mutate(getSummedArea(summedTexture, startCellX-1, innerCellY-1, startCellX, innerCellY2-1), leftDiff));
    }

    if (bottomDiff) {
        add4Mutate(colour, scale4Mutate(getSummedArea(summedTexture, innerCellX-1, endCellY-1, innerCellX2-1, endCellY), bottomDiff));
    }

    if (rightDiff) {
        add4Mutate(colour, scale4Mutate(getSummedArea(summedTexture, endCellX-1, innerCellY-1, endCellX, innerCellY2-1), rightDiff));
    }

    //inner parts
    add4Mutate(colour, getSummedArea(summedTexture, innerCellX-1, innerCellY-1, innerCellX2-1, innerCellY2-1));
    
    //now we have an accumulative pixel value that covers the whole area so just average it
    return floor4Mutate(scale4Mutate(colour, colourNormaliser));
};
