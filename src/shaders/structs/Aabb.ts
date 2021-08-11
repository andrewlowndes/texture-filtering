import type { ShaderCode } from '../../interfaces/ShaderCode';

export const Aabb: ShaderCode = {
    text: /* glsl */ `
        struct Aabb {
            vec2 minPos;
            vec2 maxPos;
        };
    `
};
