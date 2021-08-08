use crate::{line_equation::LineEquation, triangle::Triangle};
use itertools::Itertools;

#[derive(Debug)]
struct LineRange {
    min_y: f64,
    max_y: f64,
    start_x: f64,
    end_x: f64,
    min_x: f64,
    max_x: f64,
    equation: LineEquation,
}

//when rasterising each vertical scanline for the triangle is traversed and inclusive ranges are passed to the callbacks
//callback properties: min x, max x, y, is_inside
pub fn rasterise<F: FnMut(usize, usize, usize, bool)>(triangle: &Triangle, mut callback: F) {
    let min = triangle.min();
    let max = triangle.max();
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

            let x_values = line.x();

            LineRange {
                min_y: p_start.y,
                max_y: p_end.y,
                start_x: p_start.x,
                end_x: p_end.x,
                min_x: x_values.smallest(),
                max_x: x_values.largest(),
                equation: line.equation(),
            }
        })
        .collect();
    
    if max.y - min.y < 1.0 {
        callback(min.x.floor() as usize, max.x.floor() as usize, min.y.floor() as usize, false);
        return;
    }

    ((min.y.floor() as usize)..=(max.y.ceil() as usize))
        .tuple_windows()
        .for_each(|(prev_y, y)| {
            let scanline_ranges = line_ranges
                .iter()
                .filter(|line_range| {
                    line_range.max_y >= prev_y as f64 && line_range.min_y < y as f64
                })
                .map(|line| {
                    //could pre-compute these to avoid duplicate intersection tests but simpler this way
                    let from_x = line
                        .equation
                        .solve_x(prev_y as f64)
                        .map_or(line.start_x, |item| item.clamp(line.min_x, line.max_x));

                    let to_x = line
                        .equation
                        .solve_x(y as f64)
                        .map_or(line.end_x, |item| item.clamp(line.min_x, line.max_x));

                    (from_x.min(to_x), from_x.max(to_x))
                })
                .sorted_by(|a, b| {
                    a.0.partial_cmp(&b.0)
                        .unwrap()
                        .then(a.1.partial_cmp(&b.1).unwrap())
                })
                .collect::<Vec<_>>();

            //up to 3 entries per scanline, determining an inside range
            let inside_range_search = scanline_ranges
                .windows(2)
                .find(|pair| pair[1].0 - pair[0].1 > 1.0);

            let start_x = scanline_ranges.first().unwrap().0.floor() as usize;
            let end_x = scanline_ranges.last().unwrap().1.floor() as usize;

            if let Some(inside_range) = inside_range_search {
                let inside_start_x = (inside_range[0].1.floor() + 1.0) as usize;
                let inside_end_x = (inside_range[1].0.floor() - 1.0) as usize;

                callback(start_x, inside_start_x - 1, prev_y, false);
                callback(inside_start_x, inside_end_x, prev_y, true);
                callback(inside_end_x + 1, end_x, prev_y, false);
            } else {
                //single entry per scanline with the full range of our triangle
                callback(start_x, end_x, prev_y, false);
            }
        });
}
