import { createRenderer } from "../draw/createRenderer";
import { createSummedTextureWebgl } from "../draw/createSummedTextureWebgl";
import { makeLogScale } from "../maths/makeLogScale";
import { getImageData } from "../utils/getImageData";
import { createProgramFromShader } from "../webgl/createProgramFromShader";

import { blur } from '../shaders/blur';

const game = document.getElementById("game") as HTMLCanvasElement;
const image = document.getElementById("image") as HTMLImageElement;
const amountInput = document.getElementById("amount") as HTMLInputElement;
const amountValueInput = document.getElementById("amountvalue") as HTMLInputElement;
const timetaken = document.getElementById("timetaken") as HTMLSpanElement;

//need to use webgl 2 to be able to create a suitable summed texture without compression
const gl = game.getContext("webgl2")!;

if (!gl) {
    throw new Error("No WebGL2 Support :(");
}

let blurAmount = 8;
let blurUniformLocation: WebGLUniformLocation;

const render = (program: WebGLProgram, screenTriangle: WebGLVertexArrayObject) => {
    const startTime = Date.now();

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //draw our single triangle
    gl.useProgram(program);

    gl.uniform1f(blurUniformLocation, blurAmount);

    gl.bindVertexArray(screenTriangle);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    timetaken.innerText = `${(Date.now() - startTime)} ms`;
};

const start = () => {
    const blurLogScale = makeLogScale(0, 512);

    gl.clearColor(0, 0, 0, 0);

    const program = createProgramFromShader(gl, blur);

    //buffers
    const screenTriangle = gl.createVertexArray();

    if (screenTriangle === null) {
        throw new Error('Could not create screen triangle');
    }

    gl.bindVertexArray(screenTriangle);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    // - original texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    // - summed texture
    // flatten the produced summed image so it is suitable for creating a texture out of it
    // once we have generated our summmed texture we can pass it to our shaders using RGBA32UI format (4 byte unsigned int per channel)
    // this means the summed texture can support summing for textures of up to 4096 x 4096 (plenty)
    const maxPixels = 4096 * 4096;
    if (image.width * image.height > maxPixels) {
        throw new Error("Image too big, up to 4096 x 4096 supported");
    }

    const summedImage = createSummedTextureWebgl(getImageData(image));

    const summedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, summedTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, image.width, image.height, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, summedImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //bind buffers to shader
    gl.useProgram(program);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const textureUniformLocation = gl.getUniformLocation(program, "u_texture");
    gl.uniform1i(textureUniformLocation, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    blurUniformLocation = gl.getUniformLocation(program, "u_bluramount")!;
    
    const summedTextureUniformLocation = gl.getUniformLocation(program, "u_summedtexture");
    gl.uniform1i(summedTextureUniformLocation, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, summedTexture);

    //inputs
    const draw = createRenderer(() => {
        amountValueInput.value = blurAmount.toString();
        amountInput.value = blurLogScale.toLinear(blurAmount).toString();
        render(program, screenTriangle);
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

    draw();
};

if (image.complete) {
    start() 
} else {
    image.onload = start;
}
