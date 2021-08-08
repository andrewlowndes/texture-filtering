use std::f64::EPSILON;

use crate::{maths::neg_fract, point::Point};

pub struct TraverseOptions {
    pub pos: Point,
    pub cell_size: Point,
}

impl Default for TraverseOptions {
    fn default() -> Self {
        Self {
            pos: Point { x: 0.0, y: 0.0 },
            cell_size: Point { x: 1.0, y: 1.0 },
        }
    }
}

pub struct TraverseResult {
    cell: Point,
    step: Point,
    t_max: Point,
    t_delta: Point,
    done: bool,
}

impl Iterator for TraverseResult {
    type Item = Point;

    fn next(&mut self) -> Option<Self::Item> {
        if self.done {
            return None;
        }

        let cell = self.cell;

        if self.t_max.x > 1.0 && self.t_max.y > 1.0 {
            self.done = true;
            return Some(cell);
        };

        if self.t_max.x < self.t_max.y {
            self.cell.x += self.step.x;
            self.t_max.x += self.t_delta.x;
        } else {
            self.cell.y += self.step.y;
            self.t_max.y += self.t_delta.y;
        }

        Some(cell)
    }
}

pub fn traverse(
    from: &Point,
    to: &Point,
    options: &TraverseOptions,
) -> Box<dyn Iterator<Item = Point>> {
    let pos = from - options.pos;
    let dir = to - from;
    let cell = (pos / options.cell_size).floor();
    let stop_cell = ((to - options.pos) / options.cell_size).floor();

    if dir.y.abs() < EPSILON {
        let range = (cell.x.min(stop_cell.x) as usize)..=(cell.x.max(stop_cell.x) as usize);
        return Box::new(range.map(move |x| Point {
            x: x as f64,
            y: cell.y,
        }));
    }

    if dir.x.abs() < EPSILON {
        let range = (cell.y.min(stop_cell.y) as usize)..=(cell.y.max(stop_cell.y) as usize);
        return Box::new(range.map(move |y| Point {
            x: cell.x,
            y: y as f64,
        }));
    }

    let step = dir.sign();

    let t_delta = (step / dir) * options.cell_size;
    let t_pos = pos / options.cell_size;

    let t_max = Point {
        x: {
            if step.x > 0.0 {
                t_delta.x * neg_fract(t_pos.x)
            } else {
                t_delta.x * t_pos.x.fract()
            }
        },
        y: {
            if step.y > 0.0 {
                t_delta.y * neg_fract(t_pos.y)
            } else {
                t_delta.y * t_pos.y.fract()
            }
        },
    };

    Box::new(TraverseResult {
        cell,
        step,
        t_max,
        t_delta,
        done: false,
    })
}
