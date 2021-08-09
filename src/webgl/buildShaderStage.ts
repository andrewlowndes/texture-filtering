import type { ShaderCode } from "../interfaces/ShaderCode";
import type { ShaderPart } from "../interfaces/ShaderPart";
import type { ShaderSnippetInstance } from "../interfaces/ShaderSnippet";
import type { ShaderStage } from "../interfaces/ShaderStage";
import { defineShaderSnippet } from "./defineShaderSnippet";

export const buildShaderStage = (shader: ShaderStage, version: string) => {    
    let testDependencies = new Set(shader.dependencies || []);
    const allDependencies = new Set(testDependencies);

    let nextSet: Set<ShaderPart>;

    const addDependencies = (dependencies?: Array<ShaderPart>) => {
        if (dependencies) {
            for (const subdependency of dependencies) {
                if (allDependencies.has(subdependency)) {
                    allDependencies.delete(subdependency);
                } else {
                    nextSet.add(subdependency);
                }

                allDependencies.add(subdependency);
            }
        }
    };

    while (testDependencies.size) {
        nextSet = new Set<ShaderPart>();

        for (const dependency of testDependencies) {
            if ('snippet' in dependency) {
                const instance = dependency as ShaderSnippetInstance;
                
                addDependencies(instance.snippet.dependencies);
                addDependencies(instance.params);
            }

            addDependencies(dependency.dependencies);
        }
    
        testDependencies = nextSet;
    }

    const dependencies = Array.from(allDependencies.values()).reverse();

    return `#version ${version}

        ${shader.head ?? ''}

        ${dependencies.map(dependency => {
            const dep = dependency as ShaderCode | ShaderSnippetInstance;

            if ('snippet' in dep) {
                return defineShaderSnippet(dep);
            } else {
                return dep.text;
            }
        }).join('\n')}
    
        void main(void) {
            ${shader.main}
        }
    `;
};
