
import { vec2 } from "gl-matrix";

import type { Triangle } from "../interfaces/Triangle";
import { intersectCellTriangle } from "../geometry/intersectCellTriangle";
import { polygonArea } from "../geometry/polygonArea";
import { rasterizeTriangle } from "../render/rasterizeTriangle";
import { add4Mutate } from "../utils/add4Mutate";
import { clamp } from "../utils/clamp";
import { floor4Mutate } from "../utils/floor4Mutate";
import { scale4Mutate } from "../utils/scale4Mutate";
import { getPixel } from "./canvas";
import { adds } from "../maths/point";

export const getTriangleCoverage = (imageData: ImageData, triangle: Triangle) => {
    //plot a triangle outline on top of the image
    const triangleColour = [0,0,0,0];

    rasterizeTriangle(triangle.points!, {
        pos: vec2.create(),
        cellSize: vec2.fromValues(1, 1)
    }, (boundaryCell) => {
      const cellBounds = {
        min: boundaryCell, 
        size: vec2.fromValues(1, 1),
        max: adds(boundaryCell, 1)
      };
  
      const cellFillPolygon = intersectCellTriangle(triangle, cellBounds);
      const areaCoverage = clamp(Number(polygonArea(cellFillPolygon).toFixed(5)), 0, 1);
    
      const pixel = getPixel(imageData, boundaryCell[0], boundaryCell[1]);
  
      add4Mutate(triangleColour, scale4Mutate(pixel, areaCoverage));
    }, (solidCell) => {
        //this can be accelerated by using a summed texture that operates in one dimension so we can process entire scanlines
        const pixel = getPixel(imageData, solidCell[0], solidCell[1]);
        add4Mutate(triangleColour, pixel);
    });

    //fill the triangle with the computed average value
    const triangleCoverage = Number(polygonArea(triangle.points!).toFixed(5));
    scale4Mutate(triangleColour, 1 / triangleCoverage);

    return floor4Mutate(triangleColour);
};
