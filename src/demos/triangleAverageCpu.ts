import type { Triangle } from "../interfaces/Triangle";
import { createRenderer } from "../draw/createRenderer";
import { getTriangleCoverage } from "../draw/getTriangleCoverage";
import { addMutate, avg, scale, sub } from "../maths/common";
import { getImageData } from "../utils/getImageData";

const game = document.getElementById("game") as HTMLCanvasElement;
const imageInput = document.getElementById("chooseimage") as HTMLInputElement;
const timetaken = document.getElementById("timetaken") as HTMLSpanElement;

const g = game.getContext("2d")!;

const p1 = { x: 160, y: 160 };
const p2 = { x: 150, y: 270 };
const p3 = { x: 250, y: 130 };

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

const drawImage = (imageData: ImageData) => {
    g.clearRect(0, 0, game.width, game.height);

    g.putImageData(imageData, 0, 0);

    const startTime = Date.now();

    const triangleColour = getTriangleCoverage(imageData, triangle);

    timetaken.innerText = `${(Date.now() - startTime)} ms`;

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

const start = () => {
    const image = new Image();
    let imageData: ImageData;

    image.onload = () => {
        imageData = getImageData(image);
        draw();
    };

    image.src = imageInput.value;

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
        
        drawImage(imageData);
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
};

imageInput.onchange = start;
start();