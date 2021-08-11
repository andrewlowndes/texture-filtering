import type { LineEquation } from '../interfaces/LineEquation';

export const solveLineX = (equation: LineEquation, y: number) => {
    if (Math.abs(equation.gradient) != 0) {
        return (y - equation.intersect) / equation.gradient;
    } else {
        return -1.0;
    }
};
