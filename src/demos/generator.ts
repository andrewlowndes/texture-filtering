import { vec2 } from "gl-matrix";

import type { Triangle } from "../interfaces/Triangle";
import { getTriangleCoverage } from "../draw/getTriangleCoverage";
import { equals, sub } from "../maths/point";
import { getImageData } from "../utils/getImageData";

const game = document.getElementById("game") as HTMLCanvasElement;
const imageInput = document.getElementById("chooseimage") as HTMLSelectElement;
const trianglemap = document.getElementById("trianglemap") as HTMLDivElement;
const resolution = document.getElementById("resolution") as HTMLSelectElement;
const timetaken = document.getElementById("timetaken") as HTMLSpanElement;

const g = game.getContext("2d")!;

const drawImage = (imageData: ImageData) => {
    g.clearRect(0, 0, game.width, game.height);
    g.putImageData(imageData, 0, 0);
};

//this is pretty intensive and needs to be offloaded to an optimised program
const createTriangleFittingMap = (imageData: ImageData, numIterations: number): [CanvasRenderingContext2D, ImageData] => {
    //generate a map of the triangles 6 elements (3 points of x, y) within 16 possible values along the image
    const textureSize = Math.pow(numIterations, 3);

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = textureSize;
    sampleCanvas.height = textureSize;

    const sampleGraphics = sampleCanvas.getContext('2d')!;
    const sampleData = sampleGraphics.getImageData(0, 0, textureSize, textureSize)!;

    //we force samples on the extremes of the dimensions
    const xStep = (imageData.width-1) / (numIterations-1);
    const yStep = (imageData.height-1) / (numIterations-1);

    const p1 = vec2.create();
    const p2 = vec2.create();
    const p3 = vec2.create();

    const triangle: Triangle = {
        p1,
        p2,
        p3,
        e1: vec2.create(),
        e2: vec2.create(),
        e3: vec2.create(),
        points: [p1, p2, p3]
    };

    //cover all possibilities for all 6 coordinates of the triangle
    const jitterAmount = 1;
    const jitterAmount2 = 2;
    let colour: ArrayLike<number>;

    for (let i=0, x1=0; x1<imageData.width; x1 += xStep) {
        p1[0] = Math.floor(x1);
        for (let y1=0; y1<imageData.height; y1 += yStep) {
            p1[1] = Math.floor(y1);
            for (let x2=0; x2<imageData.width; x2 += xStep) {
                p2[0] = Math.floor(x2);
                for (let y2=0; y2<imageData.height; y2 += yStep) {
                    p2[1] = Math.floor(y2);
                    
                    //convert degenerate triangles to valid triangles by offsetting the coords slightly
                    if (equals(p1, p2)) {
                        p2[0] = Math.floor(x2) + jitterAmount;
                        p2[1] += jitterAmount;
                    }

                    triangle.e1 = sub(p2, p1);

                    for (let x3=0; x3<imageData.width; x3 += xStep) {
                        p3[0] = Math.floor(x3);
                        for (let y3=0; y3<imageData.height; y3 += yStep, i+=4) {
                            p3[1] = Math.floor(y3);
                            
                            //convert degenerate triangles to valid triangles by offsetting the coords slightly
                            if (equals(p2, p3) || equals(p1, p3)) {
                                p3[0] = Math.floor(x3) + jitterAmount2;
                                p3[1] += jitterAmount2;
                            }

                            triangle.e2 = sub(p3, p2);
                            triangle.e3 = sub(p1, p3);
                            
                            colour = getTriangleCoverage(imageData, triangle);

                            sampleData.data.set(colour, i);
                        }
                    }
                }
            }
        }
    }

    sampleGraphics.putImageData(sampleData, 0, 0);

    return [sampleGraphics, sampleData];
};

const start = () => {
    const image = new Image();
    
    const createMap = () => {
        const numIterations = parseInt(resolution.value, 10);
        const imageData = getImageData(image);

        //output the generated map so we can save it and see what the cache looks like
        const startTime = Date.now();
        const [sampleGraphics] = createTriangleFittingMap(imageData, numIterations);
        timetaken.innerText = `${(Date.now() - startTime)} ms`;

        trianglemap.innerHTML = '';
        trianglemap.append(sampleGraphics.canvas);
        
        drawImage(imageData);
    };

    resolution.onchange = createMap;
    image.onload = createMap;

    image.src = imageInput.value;
};

imageInput.onchange = start;
start();
