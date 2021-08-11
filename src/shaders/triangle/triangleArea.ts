import type { ShaderCode } from '../../interfaces/ShaderCode';
import { Triangle } from '../structs/Triangle';
import { vec2Determinant } from '../maths/vec2Determinant';

export const triangleArea: ShaderCode = {
    dependencies: [Triangle, vec2Determinant],
    text: /* glsl */ `
        float triangleArea(Triangle triangle) {
            return abs((
                vec2Determinant(triangle.p1, triangle.p2) +
                vec2Determinant(triangle.p2, triangle.p3) +
                vec2Determinant(triangle.p3, triangle.p1)
            ) / 2.0);
        }
    `
};
