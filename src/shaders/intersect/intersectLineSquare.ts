import type { ShaderCode } from "../../interfaces/ShaderCode";
import { Aabb } from "../structs/Aabb";
import { inverseLerp } from "../maths/inverseLerp";

export const intersectLineSquare: ShaderCode = {
    dependencies: [Aabb, inverseLerp],
    text: /* glsl */`
        vec4 intersectLineSquare(vec2 pos, vec2 dir, Aabb bounds) {
            return vec4(
                inverseLerp(pos.x, dir.x, bounds.minPos.x),
                inverseLerp(pos.x, dir.x, bounds.maxPos.x),
                inverseLerp(pos.y, dir.y, bounds.minPos.y),
                inverseLerp(pos.y, dir.y, bounds.maxPos.y)
            );
        }
    `
};
