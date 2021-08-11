import type { Triangle } from '../interfaces/Triangle';
import { intersectCellTriangle } from '../geometry/intersectCellTriangle';
import { polygonArea } from '../geometry/polygonArea';
import { rasterise } from './rasterise';
import { add4Mutate } from '../utils/add4Mutate';
import { floor4Mutate } from '../utils/floor4Mutate';
import { scale4Mutate } from '../utils/scale4Mutate';
import { getPixel } from '../draw/canvas';
import { clamp } from '../maths/common';

export const triangleCoverage = (imageData: ImageData, triangle: Triangle) => {
    //plot a triangle outline on top of the image
    const colour = [0, 0, 0, 0];
    const triangleCoverage = Number(polygonArea(triangle.points!).toFixed(5));

    //if the triangle is degenerate and has no area then we just average the colours the lines cover
    if (triangleCoverage < 1.0) {
        let numPixels = 0;

        rasterise(triangle.points!, (minX, maxX, y) => {
            for (let x = minX; x <= maxX; x++) {
                add4Mutate(colour, getPixel(imageData, x, y));
                numPixels++;
            }
        });

        return floor4Mutate(scale4Mutate(colour, 1 / numPixels));
    }

    rasterise(triangle.points!, (minX, maxX, y, isInside) => {
        if (isInside) {
            for (let x = minX; x <= maxX; x++) {
                add4Mutate(colour, getPixel(imageData, x, y));
            }
        } else {
            const yMax = y + 1;

            for (let x = minX; x <= maxX; x++) {
                const cellFillPolygon = intersectCellTriangle(triangle, { min: [x, y], max: [x + 1, yMax] });
                const areaCoverage = clamp(Number(polygonArea(cellFillPolygon).toFixed(5)), 0, 1);

                const pixel = getPixel(imageData, x, y);

                add4Mutate(colour, scale4Mutate(pixel, areaCoverage));
            }
        }
    });

    //fill the triangle with the computed average value
    return floor4Mutate(scale4Mutate(colour, 1 / triangleCoverage));
};
