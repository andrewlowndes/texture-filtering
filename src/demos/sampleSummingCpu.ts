import type { SummedTexture } from '../interfaces/SummedTexture';
import { averageNaive } from '../draw/averageNaive';
import { averageSummed } from '../draw/averageSummed';
import { getPixel, setPixel } from '../draw/canvas';
import { createRenderer } from '../draw/createRenderer';
import { createSummedTexture } from '../draw/createSummedTexture';
import { getImageData } from '../utils/getImageData';
import { clamp } from '../maths/common';

const game = document.getElementById('game') as HTMLCanvasElement;
const image = document.getElementById('image') as HTMLImageElement;
const method = document.getElementById('method') as HTMLInputElement;
const imageInput = document.getElementById('chooseimage') as HTMLInputElement;
const scaleInput = document.getElementById('scale') as HTMLInputElement;
const xoffsetInput = document.getElementById('xoffset') as HTMLInputElement;
const yoffsetInput = document.getElementById('yoffset') as HTMLInputElement;
const scaleValueInput = document.getElementById('scalevalue') as HTMLInputElement;
const xoffsetValueInput = document.getElementById('xoffsetvalue') as HTMLInputElement;
const yoffsetValueInput = document.getElementById('yoffsetvalue') as HTMLInputElement;
const timetaken = document.getElementById('timetaken') as HTMLSpanElement;

const g = game.getContext('2d')!;

let scale = 0.33;
let xoffset = 0;
let yoffset = 0;

const drawImage = (summedTexture: SummedTexture, imageData: ImageData) => {
    //now render a scaled down size of the texture on the canvas (per-pixel) using the sample summing approach
    g.clearRect(0, 0, game.width, game.height);

    const canvasImage = g.getImageData(0, 0, game.width, game.height);

    let pixelFunc: (x: number, y: number, x2: number, y2: number) => ArrayLike<number>;

    switch (method.value) {
        case 'summed':
            pixelFunc = (x, y, x2, y2) => averageSummed(summedTexture, imageData, x, y, x2, y2);
            break;
        case 'naive':
            pixelFunc = (x, y, x2, y2) => averageNaive(imageData, x, y, x2, y2);
            break;
        case 'none':
            pixelFunc = (x, y) => getPixel(imageData, x, y);
            break;
        default:
            throw new Error('Unknown method');
    }

    const startTime = Date.now();

    const maxY = game.height - 1;
    const maxX = game.width - 1;

    for (let y = Math.max(0, yoffset); y < Math.min(game.height * scale + yoffset, game.height); y++) {
        for (let x = Math.max(0, xoffset); x < Math.min(game.width * scale + xoffset, game.width); x++) {
            const plotX = clamp((x - xoffset) / scale, 0, maxX);
            const plotY = clamp((y - yoffset) / scale, 0, maxY);
            const plotX2 = clamp((x + 1 - xoffset) / scale, 0, maxX);
            const plotY2 = clamp((y + 1 - yoffset) / scale, 0, maxY);

            setPixel(canvasImage, x, y, pixelFunc(plotX, plotY, plotX2, plotY2));
        }
    }

    g.putImageData(canvasImage, 0, 0);

    timetaken.innerText = `${Date.now() - startTime} ms`;
};

const start = () => {
    const imageData = getImageData(image);
    const summedTexture = createSummedTexture(imageData);

    const draw = createRenderer(() => {
        scaleInput.value = scaleValueInput.value = scale.toString();
        xoffsetInput.value = xoffsetValueInput.value = xoffset.toString();
        yoffsetInput.value = yoffsetValueInput.value = yoffset.toString();
        drawImage(summedTexture, imageData);
    });

    scaleInput.oninput = () => {
        scale = parseFloat(scaleInput.value);
        draw();
    };

    xoffsetInput.oninput = () => {
        xoffset = parseFloat(xoffsetInput.value);
        draw();
    };

    yoffsetInput.oninput = () => {
        yoffset = parseFloat(yoffsetInput.value);
        draw();
    };

    scaleValueInput.onchange = () => {
        scale = parseFloat(scaleValueInput.value);
        draw();
    };

    xoffsetValueInput.onchange = () => {
        xoffset = parseFloat(xoffsetValueInput.value);
        draw();
    };

    yoffsetValueInput.onchange = () => {
        yoffset = parseFloat(yoffsetValueInput.value);
        draw();
    };

    method.oninput = draw;

    draw();
};

const loadImage = () => {
    image.src = imageInput.value;

    if (image.complete) {
        start();
    } else {
        image.onload = start;
    }
};

imageInput.onchange = () => {
    loadImage();
};

loadImage();
