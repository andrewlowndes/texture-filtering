import type { Triangle } from "../interfaces/Triangle";
import { createRenderer } from "../draw/createRenderer";
import { addMutate, avg, scale, sub } from "../maths/common";
import { getImageData } from "../utils/getImageData";
import { clamp } from "../utils/clamp";
import { loadImage } from "../utils/loadImage";

const game = document.getElementById("game") as HTMLCanvasElement;
const resolution = document.getElementById("resolution") as HTMLSelectElement;
const cache = document.getElementById("cache") as HTMLImageElement;
const timetaken = document.getElementById("timetaken") as HTMLSpanElement;

const g = game.getContext("2d")!;

const p1 = { x: 160, y: 160 };
const p2 = { x: 250, y: 130 };
const p3 = { x: 150, y: 270 };

const triangle: Triangle = {
  p1,
  p2,
  p3,
  points: [p1, p2, p3],
  e1: sub(p2, p1),
  e2: sub(p3, p2),
  e3: sub(p1, p3)
};

triangle.center = avg(triangle.points!);

let numIterations: number;
let imageData: ImageData;
let triangleMapData: ImageData;

const gridDotRadius = 4;
const triangleMapBytes = 4;
const PI2 = Math.PI * 2;

const drawImage = () => {
    g.clearRect(0, 0, game.width, game.height);

    const xStep = (imageData.width-1) / (numIterations-1);
    const yStep = (imageData.height-1) / (numIterations-1);

    //get the time it takes to transform our triangle and perform the lookup
    const startTime = Date.now();

    const maxIndex = numIterations - 1;

    const p1Index = { x: clamp(Math.round(triangle.p1.x / xStep), 0, maxIndex), y: clamp(Math.round(triangle.p1.y / yStep), 0, maxIndex) };
    const p2Index = { x: clamp(Math.round(triangle.p2.x / xStep), 0, maxIndex), y: clamp(Math.round(triangle.p2.y / yStep), 0, maxIndex) };
    const p3Index = { x: clamp(Math.round(triangle.p3.x / xStep), 0, maxIndex), y: clamp(Math.round(triangle.p3.y / yStep), 0, maxIndex) };

    const triangleMapIndex = (
        p3Index.y + numIterations * (
            p3Index.x + numIterations * (
                p2Index.y + numIterations * (
                    p2Index.x + numIterations * (
                        p1Index.y + numIterations * (
                            p1Index.x
                        )
                    )
                )
            )
        )
    );

    const triangleColour = triangleMapData.data.slice(triangleMapIndex * triangleMapBytes, (triangleMapIndex + 1) * triangleMapBytes);
    
    timetaken.innerText = `${(Date.now() - startTime)} ms`;

    g.putImageData(imageData, 0, 0);

    //plot the virtual grid points for our resolution
    for (let x=0; x<imageData.width; x += xStep) {
        for (let y=0; y<imageData.height; y += yStep) {
            g.fillStyle = "yellow";
            g.beginPath();
            g.arc(x, y, gridDotRadius, 0, PI2);
            g.fill();
        }
    }

    //render an outline of the triangle coords that we have fitted to the grid
    g.lineWidth = 1;
    g.strokeStyle = "red";
    g.beginPath();
    g.moveTo(p1Index.x * xStep, p1Index.y * yStep);
    g.lineTo(p2Index.x * xStep, p2Index.y * yStep);
    g.lineTo(p3Index.x * xStep, p3Index.y * yStep);
    g.closePath();
    g.stroke();

    //render our triangle
    g.lineWidth = 1;
    g.strokeStyle = "black";
    g.fillStyle = `rgba(${Math.floor(triangleColour[0])}, ${Math.floor(triangleColour[1])}, ${Math.floor(triangleColour[2])}, ${Math.floor(triangleColour[3])})`;
    g.beginPath();
    g.moveTo(triangle.p1.x, triangle.p1.y);
    g.lineTo(triangle.p2.x, triangle.p2.y);
    g.lineTo(triangle.p3.x, triangle.p3.y);
    g.closePath();
    g.fill();
    g.stroke();
};

const rotateAmount = 0.01;
const scaleAmount = 0.1;
const cosRotate = Math.cos(rotateAmount);
const sineRotate = Math.sin(rotateAmount);
    
const draw = createRenderer(() => {
    triangle.points!.forEach((point) => {
        const dx = point.x - triangle.center!.x;
        const dy = point.y - triangle.center!.y;

        point.x = triangle.center!.x + (dx * cosRotate) - (dy * sineRotate);
        point.y = triangle.center!.y + (dx * sineRotate) + (dy * cosRotate);
    });

    triangle.e1 = sub(triangle.p2, triangle.p1);
    triangle.e2 = sub(triangle.p3, triangle.p2);
    triangle.e3 = sub(triangle.p1, triangle.p3);
    
    if (imageData && triangleMapData) {
        drawImage();
    }
}, () => draw());

game.onwheel = function(e) {
    const scaleFactor = scaleAmount*Math.sign(e.deltaY);

    addMutate(triangle.p1, scale(sub(triangle.p1, triangle.center!), scaleFactor));
    addMutate(triangle.p2, scale(sub(triangle.p2, triangle.center!), scaleFactor));
    addMutate(triangle.p3, scale(sub(triangle.p3, triangle.center!), scaleFactor));

    return false;
};

game.onmousemove = (e) => {
    const bounds = game.getBoundingClientRect();
    const mousePos = {
      x: e.pageX - bounds.left - document.documentElement.scrollLeft, 
      y: e.pageY - bounds.top - document.documentElement.scrollTop
    };

    const diff = sub(mousePos, triangle.center!);

    addMutate(triangle.p1, diff);
    addMutate(triangle.p2, diff);
    addMutate(triangle.p3, diff);
    
    triangle.center = mousePos;

    draw();
};

const start = async () => {
    numIterations = parseInt(resolution.value, 10);

    const cacheSrc = `media/cache/photo_${numIterations}.png`;

    const [image, cacheImage] = await Promise.all([
        loadImage("media/photo.png"),
        loadImage(cacheSrc)
    ]);

    cache.src = cacheSrc;

    imageData = getImageData(image);
    triangleMapData = getImageData(cacheImage);

    draw();
};

start();

resolution.onchange = start;
