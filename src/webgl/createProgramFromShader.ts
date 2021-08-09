import { Shader } from "../interfaces/Shader";
import { buildShaderStage } from "./buildShaderStage";
import { createProgram } from "./createProgram";
import { loadShader } from "./loadShader";

export const createProgramFromShader = (gl: WebGL2RenderingContext, shader: Shader) => {
    const vertSource = buildShaderStage(shader.vertex, shader.version);
    const fragSource = buildShaderStage(shader.fragment, shader.version);
    
    const vertShader = loadShader(gl, vertSource, gl.VERTEX_SHADER);
    const fragShader = loadShader(gl, fragSource, gl.FRAGMENT_SHADER);

    return createProgram(gl, vertShader, fragShader);
};
