import type { ShaderCode } from "../../interfaces/ShaderCode";
import { Triangle } from "../structs/Triangle";

export const triangleMin: ShaderCode = {
    dependencies: [Triangle],
    text: /* glsl */`
        vec2 triangleMin(Triangle triangle) {
            return min(min(triangle.p1, triangle.p2), triangle.p3);
        }
    `
};
