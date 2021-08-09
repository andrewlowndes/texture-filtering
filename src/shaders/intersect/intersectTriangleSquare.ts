import type { ShaderCode } from "../../interfaces/ShaderCode";
import { Aabb } from "../structs/Aabb";
import { Triangle } from "../structs/Triangle";
import { sort } from "../maths/sort";
import { intersectLineSquare } from "./intersectLineSquare";

export const intersectTriangleSquare: ShaderCode = {
    dependencies: [Triangle, Aabb, sort, intersectLineSquare],
    text: /* glsl */`
        vec2[12] intersectTriangleSquare(Triangle triangle, Triangle edges, Aabb bounds) {
            vec4 t1s = sort(intersectLineSquare(triangle.p1, edges.p1, bounds));
            vec4 t2s = sort(intersectLineSquare(triangle.p2, edges.p2, bounds));
            vec4 t3s = sort(intersectLineSquare(triangle.p3, edges.p3, bounds));
            
            return vec2[12](
                clamp(triangle.p1 + edges.p1 * t1s.x, bounds.minPos, bounds.maxPos),
                clamp(triangle.p1 + edges.p1 * t1s.y, bounds.minPos, bounds.maxPos),
                clamp(triangle.p1 + edges.p1 * t1s.z, bounds.minPos, bounds.maxPos),
                clamp(triangle.p1 + edges.p1 * t1s.w, bounds.minPos, bounds.maxPos),

                clamp(triangle.p2 + edges.p2 * t2s.x, bounds.minPos, bounds.maxPos),
                clamp(triangle.p2 + edges.p2 * t2s.y, bounds.minPos, bounds.maxPos),
                clamp(triangle.p2 + edges.p2 * t2s.z, bounds.minPos, bounds.maxPos),
                clamp(triangle.p2 + edges.p2 * t2s.w, bounds.minPos, bounds.maxPos),
                
                clamp(triangle.p3 + edges.p3 * t3s.x, bounds.minPos, bounds.maxPos),
                clamp(triangle.p3 + edges.p3 * t3s.y, bounds.minPos, bounds.maxPos),
                clamp(triangle.p3 + edges.p3 * t3s.z, bounds.minPos, bounds.maxPos),
                clamp(triangle.p3 + edges.p3 * t3s.w, bounds.minPos, bounds.maxPos)
            );
        }
    `
};
