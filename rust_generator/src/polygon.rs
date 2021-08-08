use crate::vec2::Vec2;

use itertools::Itertools;

#[derive(Clone, Debug)]
pub struct Polygon {
    pub points: Vec<Vec2>,
}

impl Polygon {
    pub fn area_signed(&self) -> f64 {
        if self.points.len() < 3 {
            return 0.0;
        }

        self.points
            .iter()
            .chain(&self.points[0..1])
            .tuple_windows()
            .fold(0.0f64, |acc, (p1, p2)| acc + p1.determinant(p2))
            / 2.0
    }

    pub fn area(&self) -> f64 {
        self.area_signed().abs()
    }
}
