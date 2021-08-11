export const loadShader = (
    gl: WebGL2RenderingContext,
    source: string,
    type: WebGL2RenderingContext['VERTEX_SHADER'] | WebGL2RenderingContext['FRAGMENT_SHADER']
) => {
    const shader = gl.createShader(type);

    if (shader === null) {
        throw new Error('Could not create shader');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!compiled) {
        const errorMessage = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(
            `Error compiling shader: ${errorMessage}\n${source
                .split('\n')
                .map((str, index) => `${index + 1}:${str}`)
                .join('\n')}`
        );
    }

    return shader;
};
