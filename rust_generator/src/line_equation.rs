use std::f64::EPSILON;

//y = m/x + c where m = dx/dy
#[derive(Debug)]
pub struct LineEquation {
    pub gradient: f64,
    pub intersect: f64,
}

impl LineEquation {
    pub fn solve_x(&self, y: f64) -> Option<f64> {
        if self.gradient.is_finite() && self.gradient.abs() > EPSILON {
            Some((y - self.intersect) / self.gradient)
        } else {
            None
        }
    }

    pub fn solve_y(&self, x: f64) -> f64 {
        self.gradient * x + self.intersect
    }
}
