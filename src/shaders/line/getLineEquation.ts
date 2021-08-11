import type { ShaderCode } from '../../interfaces/ShaderCode';
import { Line } from '../structs/Line';
import { LineEquation } from '../structs/LineEquation';

export const getLineEquation: ShaderCode = {
    dependencies: [Line, LineEquation],
    text: /* glsl */ `
        LineEquation getLineEquation(Line line) {
            vec2 direction = line.p2 - line.p1;

            float gradient = direction.y / direction.x;
            float intersect = line.p1.y - line.p1.x * gradient;

            return LineEquation(gradient, intersect);
        }
    `
};
