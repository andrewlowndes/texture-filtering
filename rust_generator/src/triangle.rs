use crate::{line::Line, maths::inverse_lerp, vec2::Vec2, polygon::Polygon};

#[derive(Debug)]
pub struct Triangle {
    pub p1: Vec2,
    pub p2: Vec2,
    pub p3: Vec2,

    dir1: Vec2,
    dir2: Vec2,
    dir3: Vec2,
}

impl Triangle {
    pub fn new(p1: Vec2, p2: Vec2, p3: Vec2) -> Triangle {
        let mut triangle = Triangle {
            p1,
            p2,
            p3,
            dir1: Vec2::default(),
            dir2: Vec2::default(),
            dir3: Vec2::default(),
        };

        triangle.calculate_directions();

        triangle
    }

    pub fn lines(&self) -> [Line; 3] {
        [
            Line {
                p1: self.p1,
                p2: self.p2,
            },
            Line {
                p1: self.p2,
                p2: self.p3,
            },
            Line {
                p1: self.p3,
                p2: self.p1,
            },
        ]
    }

    //call when manually updating triangle points to re-compute cached properties
    pub fn calculate_directions(&mut self) {
        self.dir1 = self.p2 - self.p1;
        self.dir2 = self.p3 - self.p2;
        self.dir3 = self.p1 - self.p3;
    }

    pub fn center(&self) -> Vec2 {
        (self.p1 + self.p2 + self.p3) / 3.0
    }

    pub fn min(&self) -> Vec2 {
        self.p1.min(&self.p2).min(&self.p3)
    }

    pub fn max(&self) -> Vec2 {
        self.p1.max(&self.p2).max(&self.p3)
    }

    pub fn area(&self) -> f64 {
        Polygon::area(&Polygon {
            points: vec![self.p1, self.p2, self.p3],
        })
    }

    pub fn area_signed(&self) -> f64 {
        Polygon::area_signed(&Polygon {
            points: vec![self.p1, self.p2, self.p3],
        })
    }

    pub fn intersect_square(&self, min: Vec2, max: Vec2) -> Polygon {
        let mut points = Vec::with_capacity(12);

        let mut line1_points = vec![
            inverse_lerp(self.p1.x, self.dir1.x, min.x).clamp(0.0, 1.0),
            inverse_lerp(self.p1.x, self.dir1.x, max.x).clamp(0.0, 1.0),
            inverse_lerp(self.p1.y, self.dir1.y, min.y).clamp(0.0, 1.0),
            inverse_lerp(self.p1.y, self.dir1.y, max.y).clamp(0.0, 1.0),
        ];

        line1_points.sort_by(|a, b| a.partial_cmp(b).unwrap());
        line1_points.into_iter().for_each(|t| {
            points.push((self.p1 + self.dir1 * t).clamp(&min, &max));
        });

        let mut line2_points = vec![
            inverse_lerp(self.p2.x, self.dir2.x, min.x).clamp(0.0, 1.0),
            inverse_lerp(self.p2.x, self.dir2.x, max.x).clamp(0.0, 1.0),
            inverse_lerp(self.p2.y, self.dir2.y, min.y).clamp(0.0, 1.0),
            inverse_lerp(self.p2.y, self.dir2.y, max.y).clamp(0.0, 1.0),
        ];

        line2_points.sort_by(|a, b| a.partial_cmp(b).unwrap());
        line2_points.into_iter().for_each(|t| {
            points.push((self.p2 + self.dir2 * t).clamp(&min, &max));
        });

        let mut line3_points = vec![
            inverse_lerp(self.p3.x, self.dir3.x, min.x).clamp(0.0, 1.0),
            inverse_lerp(self.p3.x, self.dir3.x, max.x).clamp(0.0, 1.0),
            inverse_lerp(self.p3.y, self.dir3.y, min.y).clamp(0.0, 1.0),
            inverse_lerp(self.p3.y, self.dir3.y, max.y).clamp(0.0, 1.0),
        ];

        line3_points.sort_by(|a, b| a.partial_cmp(b).unwrap());
        line3_points.into_iter().for_each(|t| {
            points.push((self.p3 + self.dir3 * t).clamp(&min, &max));
        });

        points.dedup();

        Polygon { points }
    }
}
