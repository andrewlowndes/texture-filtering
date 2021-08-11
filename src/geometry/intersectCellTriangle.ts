import type { Aabb } from '../interfaces/Aabb';
import type { Point } from '../interfaces/Point';
import type { Triangle } from '../interfaces/Triangle';
import { add, clamp2, scale } from '../maths/point';
import { timeAtPos } from '../maths/common';

export const intersectCellTriangle = (triangle: Triangle, cell: Aabb): Array<Point> => {
    //branch-less creation of the intersected points of the triangle within the pixel
    const points: Array<Point> = [];

    const t1s = [
        timeAtPos(triangle.p1[0], triangle.e1[0], cell.min[0]),
        timeAtPos(triangle.p1[0], triangle.e1[0], cell.max[0]),
        timeAtPos(triangle.p1[1], triangle.e1[1], cell.min[1]),
        timeAtPos(triangle.p1[1], triangle.e1[1], cell.max[1])
    ];

    t1s.sort();
    points.push(...t1s.map((t) => clamp2(add(triangle.p1, scale(triangle.e1, t)), cell.min, cell.max)));

    const t2s = [
        timeAtPos(triangle.p2[0], triangle.e2[0], cell.min[0]),
        timeAtPos(triangle.p2[0], triangle.e2[0], cell.max[0]),
        timeAtPos(triangle.p2[1], triangle.e2[1], cell.min[1]),
        timeAtPos(triangle.p2[1], triangle.e2[1], cell.max[1])
    ];
    t2s.sort();
    points.push(...t2s.map((t) => clamp2(add(triangle.p2, scale(triangle.e2, t)), cell.min, cell.max)));

    const t3s = [
        timeAtPos(triangle.p3[0], triangle.e3[0], cell.min[0]),
        timeAtPos(triangle.p3[0], triangle.e3[0], cell.max[0]),
        timeAtPos(triangle.p3[1], triangle.e3[1], cell.min[1]),
        timeAtPos(triangle.p3[1], triangle.e3[1], cell.max[1])
    ];
    t3s.sort();
    points.push(...t3s.map((t) => clamp2(add(triangle.p3, scale(triangle.e3, t)), cell.min, cell.max)));

    return points;
};
