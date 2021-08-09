import { ShaderCode } from "../../interfaces/ShaderCode";
import { epsilon } from "../maths/epsilon";
import { Line } from "../structs/Line";
import { LineEquation } from "../structs/LineEquation";

export const solveLineX: ShaderCode = {
    dependencies: [Line, LineEquation, epsilon],
    text: /* glsl */`
        float solveLineX(LineEquation equation, float y) {
            if (abs(equation.gradient) > epsilon) {
                return (y - equation.intersect) / equation.gradient;
            } else {
                return -1.0;
            }
        }
    `
};
