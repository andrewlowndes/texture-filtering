import { getImageData } from "../utils/getImageData";
import { createProgramFromShader } from "../webgl/createProgramFromShader";

import { generator } from '../shaders/generator';

const game = document.getElementById("game") as HTMLCanvasElement;
const imagePreview = document.getElementById("image_preview") as HTMLImageElement;
const imageInput = document.getElementById("chooseimage") as HTMLSelectElement;
const resolution = document.getElementById("resolution") as HTMLSelectElement;
const timetaken = document.getElementById("timetaken") as HTMLSpanElement;

const gl = game.getContext('webgl2', { antialias: false, premultipliedAlpha: false })!;

const load = (imageData: ImageData, numIterations: number) => {
    const size = Math.pow(numIterations, 3);
    gl.canvas.width = size;
    gl.canvas.height = size;

    const shaderProgram = createProgramFromShader(gl, generator);
    gl.useProgram(shaderProgram);

    //pass our texture and number of iterations as uniforms to our shaders
    const imageTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    const imageTextureLocation = gl.getUniformLocation(shaderProgram, "uSampler");
    gl.uniform1i(imageTextureLocation, 0);

    const resolutionLocation = gl.getUniformLocation(shaderProgram, "uResolution");
    gl.uniform1ui(resolutionLocation, numIterations);

    const samplerSizeLocation = gl.getUniformLocation(shaderProgram, "uSize");
    gl.uniform1ui(samplerSizeLocation, size);

    const stepLocation = gl.getUniformLocation(shaderProgram, "uStep");
    gl.uniform2fv(stepLocation, [(imageData.width-1) / (numIterations-1), (imageData.height-1) / (numIterations-1)]);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};

const draw = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    const startTime = Date.now();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    timetaken.innerText = `${(Date.now() - startTime)} ms`;
};

const start = async () => {
    const image = new Image();

    const createMap = () => {
        imagePreview.src = imageInput.value;
        const numIterations = parseInt(resolution.value, 10);
        const imageData = getImageData(image);

        load(imageData, numIterations);
        draw();
    };

    resolution.onchange = createMap;
    image.onload = createMap;
    image.src = imageInput.value;
}

imageInput.onchange = start;
start();