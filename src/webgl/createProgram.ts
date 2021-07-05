export const createProgram = (gl: WebGL2RenderingContext, vertShader: WebGLShader, fragShader: WebGLShader) => {
    const program = gl.createProgram();

    if (program === null) {
        throw new Error('Could not create program');
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!linked) {
        const errorMessage = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`Error linking program : ${errorMessage}`);
    }

    return program;
};
