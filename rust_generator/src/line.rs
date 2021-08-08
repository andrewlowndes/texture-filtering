use std::f64::EPSILON;

use crate::{line_equation::LineEquation, maths::inverse_lerp, vec2::Vec2};

#[derive(Debug)]
pub struct Line {
    pub p1: Vec2,
    pub p2: Vec2,
}

impl Line {
    pub fn length(&self) -> f64 {
        self.dir().length()
    }

    pub fn dir(&self) -> Vec2 {
        self.p2 - self.p1
    }

    pub fn equation(&self) -> LineEquation {
        let direction = self.dir();

        let gradient = direction.y / direction.x;
        let intersect = self.p1.y - self.p1.x * gradient;

        LineEquation {
            gradient,
            intersect,
        }
    }

    pub fn x(&self) -> Vec2 {
        Vec2 {
            x: self.p1.x,
            y: self.p2.x,
        }
    }

    pub fn y(&self) -> Vec2 {
        Vec2 {
            x: self.p1.y,
            y: self.p2.y,
        }
    }

    pub fn min(&self) -> Vec2 {
        self.p1.min(&self.p2)
    }

    pub fn max(&self) -> Vec2 {
        self.p1.max(&self.p2)
    }

    pub fn clip_rectangle(&self, min: Vec2, max: Vec2) -> Option<Line> {
        let line = {
            // vertical - just crop the y
            if (self.p1.x - self.p2.x).abs() < EPSILON {
                Line {
                    p1: Vec2 {
                        x: self.p1.x,
                        y: self.p1.y.clamp(min.y, max.y),
                    },
                    p2: Vec2 {
                        x: self.p2.x,
                        y: self.p2.y.clamp(min.y, max.y),
                    },
                }
            } else if (self.p1.y - self.p2.y).abs() < EPSILON {
                // horizontal - just crop the x
                Line {
                    p1: Vec2 {
                        x: self.p1.x.clamp(min.x, max.x),
                        y: self.p1.y,
                    },
                    p2: Vec2 {
                        x: self.p2.x.clamp(min.x, max.x),
                        y: self.p2.y,
                    },
                }
            } else {
                let dir = self.dir();

                let t1 = inverse_lerp(self.p1.x, dir.x, min.x).clamp(0.0, 1.0);
                let t2 = inverse_lerp(self.p1.x, dir.x, max.x).clamp(0.0, 1.0);
                let t3 = inverse_lerp(self.p1.y, dir.y, min.y).clamp(0.0, 1.0);
                let t4 = inverse_lerp(self.p1.y, dir.y, max.y).clamp(0.0, 1.0);

                Line {
                    p1: (t1.min(t2).min(t3).min(t4) * dir + self.p1)
                        .clamp_mut(&min, &max)
                        .to_owned(),
                    p2: (t1.max(t2).max(t3).max(t4) * dir + self.p1)
                        .clamp_mut(&min, &max)
                        .to_owned(),
                }
            }
        };

        if !line.p1.in_range(&min, &max) || !line.p2.in_range(&min, &max) {
            None
        } else {
            Some(line)
        }
    }
}
