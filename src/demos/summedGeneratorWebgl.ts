import { getImageData } from '../utils/getImageData';
import { createProgramFromShader } from '../webgl/createProgramFromShader';

import { summedGenerator } from '../shaders/summedGenerator';
import { textureShader } from '../shaders/texture';

const game = document.getElementById('game') as HTMLCanvasElement;
const imagePreview = document.getElementById('image_preview') as HTMLImageElement;
const imageInput = document.getElementById('chooseimage') as HTMLSelectElement;
const resolution = document.getElementById('resolution') as HTMLSelectElement;
const timetaken = document.getElementById('timetaken') as HTMLSpanElement;

const gl = game.getContext('webgl2', { antialias: false, premultipliedAlpha: false });

if (!gl) {
    throw new Error("No WebGL :(");
}

if (gl.getExtension('EXT_color_buffer_float') === null) {
    throw new Error("No render to Float32 support :(");
}

const load = (imageData: ImageData, numIterations: number) => {
    const size = Math.pow(numIterations, 2);
    gl.canvas.width = size;
    gl.canvas.height = size;
    
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    //render our summed channel image to a framebuffer (store accumulated sum or precision using 32-bit per channel)
    /*const summedMapFramebuffer = gl.createFramebuffer();
    const summedMapRenderbuffer = gl.createRenderbuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, summedMapFramebuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, summedMapRenderbuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, summedMapRenderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA32F, size, size);
    
    const summedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, summedTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, size, size, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, summedTexture, 0);
    */

    const shaderProgram = createProgramFromShader(gl, summedGenerator);
    gl.useProgram(shaderProgram);

    //pass our texture and number of iterations as uniforms to our shaders
    const imageTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    const imageTextureLocation = gl.getUniformLocation(shaderProgram, 'uSampler');
    gl.uniform1i(imageTextureLocation, 0);

    const resolutionLocation = gl.getUniformLocation(shaderProgram, 'uResolution');
    gl.uniform1ui(resolutionLocation, numIterations);

    const samplerSizeLocation = gl.getUniformLocation(shaderProgram, 'uSize');
    gl.uniform1ui(samplerSizeLocation, size);

    const stepLocation = gl.getUniformLocation(shaderProgram, 'uStep');
    gl.uniform2fv(stepLocation, [
        (imageData.width - 1) / (numIterations - 1),
        (imageData.height - 1) / (numIterations - 1)
    ]);

    //we will then use a simple shader to render it directly so we can show it
    /*gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    //prep the main framebuffer for rendering our generated texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const program = createProgramFromShader(gl, textureShader);
    gl.useProgram(program);

    const divisorLocation = gl.getUniformLocation(shaderProgram, 'uDivisor');
    gl.uniform1ui(divisorLocation, size * size);

    const textureUniformLocation = gl.getUniformLocation(program, 'uSampler');
    gl.uniform1i(textureUniformLocation, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, summedTexture);
    */
};

const draw = () => {
    const startTime = Date.now();
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    timetaken.innerText = `${Date.now() - startTime} ms`;
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
};

imageInput.onchange = start;
start();
