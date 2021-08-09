import { ShaderCode } from "../../interfaces/ShaderCode";
import { Line } from "../structs/Line";
import { LineRange } from "../structs/LineRange";
import { getLineEquation } from "./getLineEquation";

export const getLineRange: ShaderCode = {
    dependencies: [Line, LineRange, getLineEquation],
    text: /* glsl */`
        LineRange getLineRange(Line line) {
            vec2 pStart;
            vec2 pEnd;
            
            //TODO: make a branchless version
            if (line.p1.y < line.p2.y) {
                pStart = line.p1;
                pEnd = line.p2;
            } else if (line.p1.y > line.p2.y) {
                pStart = line.p2;
                pEnd = line.p1;
            } else if (line.p1.x < line.p2.x) {
                pStart = line.p1;
                pEnd = line.p2;
            } else {
                pStart = line.p2;
                pEnd = line.p1;
            }

            return LineRange(
                pStart,
                pEnd,
                vec2(min(line.p1.x, line.p2.x), max(line.p1.x, line.p2.x)),
                getLineEquation(line)
            );
        }
    `
};
