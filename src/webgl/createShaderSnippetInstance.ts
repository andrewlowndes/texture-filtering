import type { ShaderSnippetInstance } from '../interfaces/ShaderSnippet';

let uniqueName = 0;

export const createShaderSnippetInstance = (instance: Omit<ShaderSnippetInstance, 'name'>): ShaderSnippetInstance => {
    return {
        ...instance,
        name: `_snippet_${uniqueName++}`
    };
};
