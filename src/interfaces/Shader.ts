import { ShaderStage } from "./ShaderStage";

//wrap round a fragment shader and vertex shader
//TODO: could branch out uniforms, atrributes and uniforms
export interface Shader {
    version: string;
    fragment: ShaderStage;
    vertex: ShaderStage;
}
