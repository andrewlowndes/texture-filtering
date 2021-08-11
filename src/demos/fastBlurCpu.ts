import type { SummedTexture } from '../interfaces/SummedTexture';
import { averageNaive } from '../draw/averageNaive';
import { averageSummed } from '../draw/averageSummed';
import { createRenderer } from '../draw/createRenderer';
import { createSummedTexture } from '../draw/createSummedTexture';
import { getImageData } from '../utils/getImageData';
import { makeLogScale } from '../maths/makeLogScale';
import { clamp } from '../maths/common';

const game = document.getElementById('game') as HTMLCanvasElement;
const image = document.getElementById('image') as HTMLImageElement;
const method = document.getElementById('method') as HTMLInputElement;
const amountInput = document.getElementById('amount') as HTMLInputElement;
const amountValueInput = document.getElementById('amountvalue') as HTMLInputElement;
const timetaken = document.getElementById('timetaken') as HTMLSpanElement;

const g = game.getContext('2d')!;

let blurAmount = 8;

const drawImage = (imageData: ImageData, summedTexture: SummedTexture) => {
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
        default:
            throw new Error('Unknown method');
    }

    const startTime = Date.now();

    for (let y = 0, i = 0; y < game.height; y++) {
        for (let x = 0; x < game.width; x++, i += 4) {
            const plotX = clamp(x - blurAmount, 0, game.width);
            const plotY = clamp(y - blurAmount, 0, game.height);
            const plotX2 = clamp(x + blurAmount, 0, game.width);
            const plotY2 = clamp(y + blurAmount, 0, game.height);

            const pixelColour = pixelFunc(plotX, plotY, plotX2, plotY2);
            canvasImage.data.set(pixelColour, i);
        }
    }

    g.putImageData(canvasImage, 0, 0);

    timetaken.innerText = `${Date.now() - startTime} ms`;
};

const start = () => {
    const imageData = getImageData(image);
    const summedTexture = createSummedTexture(imageData);

    const blurLogScale = makeLogScale(0, 512);

    const draw = createRenderer(() => {
        amountValueInput.value = blurAmount.toString();
        amountInput.value = blurLogScale.toLinear(blurAmount).toString();
        drawImage(imageData, summedTexture);
    });

    amountInput.oninput = () => {
        //convert the slider value as if it was exponential
        blurAmount = parseFloat(blurLogScale.fromLinear(parseFloat(amountInput.value)).toFixed(1));
        draw();
    };

    amountValueInput.onchange = () => {
        blurAmount = parseFloat(amountValueInput.value);
        draw();
    };

    method.onchange = draw;

    draw();
};

if (image.complete) {
    start();
} else {
    image.onload = start;
}
