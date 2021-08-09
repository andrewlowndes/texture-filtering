import { ShaderPart } from "./ShaderPart";

export interface ShaderStage extends ShaderPart {
    head?: string;
    main: string;
}
