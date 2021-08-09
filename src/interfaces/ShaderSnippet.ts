import { ShaderParameter } from "./ShaderParameter";
import { ShaderPart } from "./ShaderPart";

//specialised instance of a shader snippet
export interface ShaderSnippetInstance extends ShaderPart {
    snippet: ShaderSnippet,
    name: string;
    params?: Array<ShaderSnippetInstance>;
    resultObjs: Array<ShaderParameter>;
}

//dynamically generated shader function with customisable injectable snippet instances
export interface ShaderSnippet extends ShaderPart {
    params: Array<ShaderParameter>;
    returnType?: string;
    text: (...params: Array<ShaderSnippetInstance>) => string;
}
