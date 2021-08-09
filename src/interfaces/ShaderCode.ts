import { ShaderPart } from "./ShaderPart";

//a static template of shader code with dependencies
export interface ShaderCode extends ShaderPart {
    text: string;
}
