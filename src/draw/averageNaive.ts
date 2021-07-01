import { add4Mutate } from "../utils/add4Mutate";
import { floor4Mutate } from "../utils/floor4Mutate";
import { scale4Mutate } from "../utils/scale4Mutate";
import { getPixel } from "./canvas";

export const averageNaive = (imageData: ImageData, x: number, y: number, x2: number, y2: number) => {
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

    //perhaps we should be blending another way (alpha) instead of adding?
    
    //single horizontal strip
    if (startCellX == endCellX) {
        if (topDiff) {
            add4Mutate(colour, scale4Mutate(getPixel(imageData, startCellX, startCellY), width * topDiff));
        }

        if (bottomDiff) {
            add4Mutate(colour, scale4Mutate(getPixel(imageData, endCellX, endCellY), width * bottomDiff));
        }

        const midColour = [0,0,0,0];
        for (let j=innerCellY; j<innerCellY2; j++) {
            add4Mutate(midColour, getPixel(imageData, startCellX, j));
        }
        add4Mutate(colour, scale4Mutate(midColour, width));

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

        const midColour = [0,0,0,0];
        for (let i=innerCellX; i<innerCellX2; i++) {
            add4Mutate(midColour, getPixel(imageData, i, startCellY));
        }
        add4Mutate(colour, scale4Mutate(midColour, height));

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
        const topColour = [0,0,0,0];
        for (let i=innerCellX; i<innerCellX2; i++) {
            add4Mutate(topColour, getPixel(imageData, i, startCellY));
        }
        add4Mutate(colour, scale4Mutate(topColour, topDiff));
    }

    if (leftDiff) {
        const leftColour = [0,0,0,0];
        for (let j=innerCellY; j<innerCellY2; j++) {
            add4Mutate(leftColour, getPixel(imageData, startCellX, j));
        }
        add4Mutate(colour, scale4Mutate(leftColour, leftDiff));
    }

    if (bottomDiff) {
        const bottomColour = [0,0,0,0];
        for (let i=innerCellX; i<innerCellX2; i++) {
            add4Mutate(bottomColour, getPixel(imageData, i, endCellY));
        }
        add4Mutate(colour, scale4Mutate(bottomColour, bottomDiff));
    }

    if (rightDiff) {
        const rightColour = [0,0,0,0];
        for (let j=innerCellY; j<innerCellY2; j++) {
            add4Mutate(rightColour, getPixel(imageData, endCellX, j));
        }
        add4Mutate(colour, scale4Mutate(rightColour, rightDiff));
    }

    //inner parts
    for (let i=innerCellX; i<innerCellX2; i++) {
        for (let j=innerCellY; j<innerCellY2; j++) {
            add4Mutate(colour, getPixel(imageData, i, j));
        }
    }
    
    //now we have an accumulative pixel value that covers the whole area so just average it
    return floor4Mutate(scale4Mutate(colour, colourNormaliser));
};
