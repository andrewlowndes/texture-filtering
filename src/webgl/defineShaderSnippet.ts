import type { ShaderSnippetInstance } from '../interfaces/ShaderSnippet';
import { snippetResult } from './snippetResult';

export const defineShaderSnippet = (instance: ShaderSnippetInstance) => {
    const funcParams = [
        ...instance.snippet.params,
        ...instance.resultObjs.map((param) => ({ ...param, name: `${snippetResult}${param.name}` }))
    ].map((param) => `${param.qualifier} ${param.type} ${param.name}`);

    return `${instance.snippet.returnType ?? 'void'} ${instance.name}(${funcParams.join(',')}) {
        ${instance.snippet.text(...(instance.params ?? []))}
    }`;
};
