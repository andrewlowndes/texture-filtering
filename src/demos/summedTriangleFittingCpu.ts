import { vec2 } from 'gl-matrix';

import type { Triangle } from '../interfaces/Triangle';
import { createRenderer } from '../draw/createRenderer';
import { avg, scale, sub } from '../maths/point';
import { getImageData } from '../utils/getImageData';
import { loadImage } from '../utils/loadImage';
import { clamp } from '../maths/common';
import { add4Mutate } from '../utils/add4Mutate';
import { polygonArea, polygonAreaSigned } from '../geometry/polygonArea';
import { scale4Mutate } from '../utils/scale4Mutate';

const game = document.getElementById('game') as HTMLCanvasElement;
const resolution = document.getElementById('resolution') as HTMLSelectElement;
const cache = document.getElementById('cache') as HTMLImageElement;
const timetaken = document.getElementById('timetaken') as HTMLSpanElement;
const chooseimage = document.getElementById('chooseimage') as HTMLSelectElement;

const g = game.getContext('2d')!;

const p1 = vec2.fromValues(160, 160);
const p2 = vec2.fromValues(250, 130);
const p3 = vec2.fromValues(150, 270);

const triangle: Triangle = {
    p1,
    p2,
    p3,
    points: [p1, p2, p3],
    e1: sub(p2, p1),
    e2: sub(p3, p2),
    e3: sub(p1, p3)
};

triangle.center = avg(...triangle.points!);

let numIterations: number;
let imageData: ImageData;
let triangleMapData: ImageData;

const gridDotRadius = 2;
const triangleMapBytes = 4;
const PI2 = Math.PI * 2;

const drawImage = () => {
    g.clearRect(0, 0, game.width, game.height);

    const xStep = (imageData.width - 1) / (numIterations - 1);
    const yStep = (imageData.height - 1) / (numIterations - 1);

    //get the time it takes to transform our triangle and perform the lookup
    const startTime = Date.now();

    const maxIndex = numIterations - 1;

    const p1Index: vec2 = [
        clamp(Math.round(triangle.p1[0] / xStep), 0, maxIndex),
        clamp(Math.round(triangle.p1[1] / yStep), 0, maxIndex)
    ];
    const p2Index: vec2 = [
        clamp(Math.round(triangle.p2[0] / xStep), 0, maxIndex),
        clamp(Math.round(triangle.p2[1] / yStep), 0, maxIndex)
    ];
    const p3Index: vec2 = [
        clamp(Math.round(triangle.p3[0] / xStep), 0, maxIndex),
        clamp(Math.round(triangle.p3[1] / yStep), 0, maxIndex)
    ];

    const getSummedColour = (p1Index: vec2, p2Index: vec2) => {
        const triangleMapIndex =
            triangleMapBytes *
            (p2Index[1] + numIterations * (p2Index[0] + numIterations * (p1Index[1] + numIterations * p1Index[0])));
        return Array.from(triangleMapData.data.slice(triangleMapIndex, triangleMapIndex + triangleMapBytes));
    };

    //since we are using normalised
    const startCoord: vec2 = [0, 0];
    const totalSum = [0, 0, 0, 0];

    add4Mutate(
        totalSum,
        scale4Mutate(getSummedColour(p1Index, p2Index), polygonAreaSigned([startCoord, triangle.p1, triangle.p2]))
    );
    add4Mutate(
        totalSum,
        scale4Mutate(getSummedColour(p2Index, p3Index), polygonAreaSigned([startCoord, triangle.p2, triangle.p3]))
    );
    add4Mutate(
        totalSum,
        scale4Mutate(getSummedColour(p3Index, p1Index), polygonAreaSigned([startCoord, triangle.p3, triangle.p1]))
    );
    scale4Mutate(totalSum, 1 / polygonArea(triangle.points!));

    timetaken.innerText = `${Date.now() - startTime} ms`;

    g.putImageData(imageData, 0, 0);

    //plot the virtual grid points for our resolution
    const radius = numIterations > 32 ? 1 : gridDotRadius;
    for (let x = 0; x < imageData.width; x += xStep) {
        for (let y = 0; y < imageData.height; y += yStep) {
            g.fillStyle = 'yellow';
            g.beginPath();
            g.arc(x, y, radius, 0, PI2);
            g.fill();
        }
    }

    //render an outline of the triangle coords that we have fitted to the grid
    g.lineWidth = 1;
    g.strokeStyle = 'red';
    g.beginPath();
    g.moveTo(p1Index[0] * xStep, p1Index[1] * yStep);
    g.lineTo(p2Index[0] * xStep, p2Index[1] * yStep);
    g.lineTo(p3Index[0] * xStep, p3Index[1] * yStep);
    g.closePath();
    g.stroke();

    //render our triangle
    g.lineWidth = 1;
    g.strokeStyle = 'black';
    g.fillStyle = `rgba(${Math.floor(totalSum[0])}, ${Math.floor(totalSum[1])}, ${Math.floor(
        totalSum[2]
    )}, ${Math.floor(totalSum[3])})`;
    g.beginPath();
    g.moveTo(triangle.p1[0], triangle.p1[1]);
    g.lineTo(triangle.p2[0], triangle.p2[1]);
    g.lineTo(triangle.p3[0], triangle.p3[1]);
    g.closePath();
    g.fill();
    g.stroke();
};

const rotateAmount = 0.01;
const scaleAmount = 0.1;

const draw = createRenderer(
    () => {
        triangle.points!.forEach((point) => {
            vec2.rotate(point, point, triangle.center!, rotateAmount);
        });

        triangle.e1 = sub(triangle.p2, triangle.p1);
        triangle.e2 = sub(triangle.p3, triangle.p2);
        triangle.e3 = sub(triangle.p1, triangle.p3);

        if (imageData && triangleMapData) {
            drawImage();
        }
    },
    () => draw()
);

game.onwheel = function (e) {
    const scaleFactor = scaleAmount * Math.sign(e.deltaY);

    vec2.add(triangle.p1, triangle.p1, scale(sub(triangle.p1, triangle.center!), scaleFactor));
    vec2.add(triangle.p2, triangle.p2, scale(sub(triangle.p2, triangle.center!), scaleFactor));
    vec2.add(triangle.p3, triangle.p3, scale(sub(triangle.p3, triangle.center!), scaleFactor));

    return false;
};

game.onmousemove = (e) => {
    const bounds = game.getBoundingClientRect();
    const mousePos = vec2.fromValues(
        e.pageX - bounds.left - document.documentElement.scrollLeft,
        e.pageY - bounds.top - document.documentElement.scrollTop
    );

    const diff = sub(mousePos, triangle.center!);

    vec2.add(triangle.p1, triangle.p1, diff);
    vec2.add(triangle.p2, triangle.p2, diff);
    vec2.add(triangle.p3, triangle.p3, diff);

    triangle.center = mousePos;

    draw();
};

const pics: Record<string, string> = {
    photo: 'media/photo.png',
    lines: 'media/test.png',
    pattern: 'media/sample.png'
};

const start = async () => {
    numIterations = parseInt(resolution.value, 10);

    const imageType = chooseimage.value;

    //TODO: need a way of storing and looking up a 32-bit per pixel image (HDR)
    const cacheSrc = `media/cache/summed_${imageType}_${numIterations}.png`;

    const [image, cacheImage] = await Promise.all([loadImage(pics[imageType]), loadImage(cacheSrc)]);

    cache.src = cacheSrc;

    imageData = getImageData(image);
    triangleMapData = getImageData(cacheImage);

    draw();
};

start();

resolution.onchange = start;
chooseimage.onchange = start;
