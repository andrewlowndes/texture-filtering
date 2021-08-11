use itertools::Itertools;

use crate::{line_equation::LineEquation, triangle::Triangle, vec2::Vec2};

#[derive(Debug)]
struct LineRange {
    p_start: Vec2,
    p_end: Vec2,
    x_range: Vec2,
    equation: LineEquation,
}

//when rasterising each vertical scanline for the triangle is traversed and inclusive ranges are passed to the callbacks
//callback properties: min x, max x, y, is_inside
pub fn rasterise<F: FnMut(usize, usize, usize, bool)>(triangle: &Triangle, mut callback: F) {
    let min_pos = triangle.min();
    let max_pos = triangle.max();
    let lines = triangle.lines();

    let line_ranges: Vec<_> = lines
        .iter()
        .map(|line| {
            let (p_start, p_end) = {
                if line.p1.y < line.p2.y {
                    (line.p1, line.p2)
                } else if line.p1.y > line.p2.y {
                    (line.p2, line.p1)
                } else if line.p1.x < line.p2.x {
                    (line.p1, line.p2)
                } else {
                    (line.p2, line.p1)
                }
            };

            LineRange {
                p_start,
                p_end,
                x_range: Vec2::new(line.p1.x.min(line.p2.x), line.p1.x.max(line.p2.x)),
                equation: line.equation(),
            }
        })
        .collect();
    
    if max_pos.y - min_pos.y < 1.0 {
        callback(min_pos.x as usize, max_pos.x as usize, min_pos.y as usize, false);
        return;
    }

    for (prev_y, y) in (min_pos.y.floor() as usize..=max_pos.y.ceil() as usize).tuple_windows() {
        //we just need to get four numbers, the outer min and max and inner min and max values
        let mut range = (-1, -1, -1, -1);

        for line in &line_ranges {
            if line.p_end.y >= prev_y as f64 && line.p_start.y < y as f64 {
                let from_x = line.equation.solve_x(prev_y as f64).map_or(line.p_start.x, |item| item.clamp(line.x_range.x, line.x_range.y));
                let to_x = line.equation.solve_x(y as f64).map_or(line.p_end.x, |item| item.clamp(line.x_range.x, line.x_range.y));
                let x_range = (from_x.min(to_x).floor() as i32, from_x.max(to_x).floor() as i32);

                if range.0 < 0 {
                    //first entry
                    range.0 = x_range.0;
                    range.1 = x_range.1;
                } else if (x_range.0 <= range.1 + 1 && x_range.0 >= range.0 - 1) || (x_range.1 <= range.1 + 1 && x_range.1 >= range.0 - 1) {
                    //extends the first range
                    range.0 = range.0.min(x_range.0);
                    range.1 = range.1.max(x_range.1);
                } else if range.2 < 0 {
                    //must be a new second range, determine if we need to swap or not to keep them ordered
                    if x_range.0 > range.1 {
                        range.2 = x_range.0;
                        range.3 = x_range.1;
                    } else {
                        range.2 = range.0;
                        range.3 = range.1;
                        range.0 = x_range.0;
                        range.1 = x_range.1;
                    }
                } else {
                    //extends the second range
                    range.2 = range.2.min(x_range.0);
                    range.3 = range.3.max(x_range.1);
                }
            }
        }

        //up to 3 entries per scanline, determining an inside range
        if range.2 > range.1 {
            callback(range.0 as usize, range.1 as usize, prev_y, false);
            callback((range.1 + 1) as usize, (range.2 - 1) as usize, prev_y, true);
            callback(range.2 as usize, range.3 as usize, prev_y, false);
        } else {
            callback(range.0 as usize, range.1.max(range.3) as usize, prev_y, false);
        }
    }
}
