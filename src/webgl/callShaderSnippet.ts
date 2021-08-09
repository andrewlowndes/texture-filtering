import { ShaderSnippetInstance } from "../interfaces/ShaderSnippet";
import { snippetResult } from "./snippetResult";

export const callShaderSnippet = (instance: ShaderSnippetInstance, params: Array<string>, resultObjs?: Array<string>) => {
    if (instance.snippet.params.length !== params.length) {
        throw new Error(`Missing params in ${instance.name} call, expecting params: ${instance.snippet.params.map(param => param.name).join(', ')}`);
    }

    //all cb should forward the result objects by default if unspecified so further callbacks can access the result data
    if (resultObjs) {
        if (resultObjs.length !== instance.resultObjs.length) {
            throw new Error(`Missing result object in ${instance.name} call, expecting results: ${instance.resultObjs.map(resultObj => resultObj.name).join(', ')}`);
        }
    } else {
        resultObjs = instance.resultObjs.map(resultObj => `${snippetResult}${resultObj.name}`);
    }
    
    return `${instance.name}(${params.join(', ')}, ${resultObjs.join(', ')});`;
};
