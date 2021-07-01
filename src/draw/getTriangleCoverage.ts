import type { Triangle } from "../interfaces/Triangle";
import { aabb } from "../aabb/aabb";
import { intersectCellTriangle } from "../geometry/intersectCellTriangle";
import { polygonArea } from "../geometry/polygonArea";
import { ceil, floor } from "../maths/common";
import { rasterizeTriangle } from "../render/rasterizeTriangle";
import { add4Mutate } from "../utils/add4Mutate";
import { clamp } from "../utils/clamp";
import { floor4Mutate } from "../utils/floor4Mutate";
import { scale4Mutate } from "../utils/scale4Mutate";
import { getPixel } from "./canvas";

export const getTriangleCoverage = (imageData: ImageData, triangle: Triangle) => {
    //plot a triangle outline on top of the image
    const triangleColour = [0,0,0,0];

    const triangleAabb = aabb(triangle.points!);

    rasterizeTriangle(triangle.points!, {
        pos: { x: 0, y: 0 },
        cellSize: { x: 1, y: 1 },
        maxSteps: 100000,
        min: floor(triangleAabb.min),
        max: ceil(triangleAabb.max)
    }, (boundaryCell) => {
      const cellBounds = {
        min: { x: boundaryCell.x, y: boundaryCell.y }, 
        size: { x: 1, y: 1 },  
        max: { x: boundaryCell.x + 1, y: boundaryCell.y + 1 }
      };
  
      const cellFillPolygon = intersectCellTriangle(triangle, cellBounds);
      const areaCoverage = clamp(Number(polygonArea(cellFillPolygon).toFixed(5)), 0, 1);
    
      const pixel = getPixel(imageData, boundaryCell.x, boundaryCell.y);
  
      add4Mutate(triangleColour, scale4Mutate(pixel, areaCoverage));
    }, (solidCell) => {
        //this can be accelerated by using a summed texture that operates in one dimension so we can process entire scanlines
        const pixel = getPixel(imageData, solidCell.x, solidCell.y);
        add4Mutate(triangleColour, pixel);
    });

    //fill the triangle with the computed average value
    const triangleCoverage = Number(polygonArea(triangle.points!).toFixed(5));
    scale4Mutate(triangleColour, 1 / triangleCoverage);

    return floor4Mutate(triangleColour);
};
