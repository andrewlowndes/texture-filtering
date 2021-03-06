import type { ShaderCode } from '../../interfaces/ShaderCode';
import { Triangle } from '../structs/Triangle';

export const triangleMax: ShaderCode = {
    dependencies: [Triangle],
    text: /* glsl */ `
        vec2 triangleMax(Triangle triangle) {
            return max(max(triangle.p1, triangle.p2), triangle.p3);
        }
    `
};
