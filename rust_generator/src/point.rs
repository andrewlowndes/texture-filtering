use std::f64::EPSILON;

use auto_ops::{impl_op_ex, impl_op_ex_commutative};

use crate::maths::{lerp, sign};

#[derive(Copy, Clone, Debug)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

impl Default for Point {
    fn default() -> Self {
        Self { x: 0.0, y: 0.0 }
    }
}

impl Point {
    pub fn clamp(&self, min: &Self, max: &Self) -> Self {
        Self {
            x: self.x.min(max.x).max(min.x),
            y: self.y.min(max.y).max(min.y),
        }
    }

    pub fn min(&self, b: &Self) -> Self {
        Self {
            x: self.x.min(b.x),
            y: self.y.min(b.y),
        }
    }

    pub fn max(&self, b: &Self) -> Self {
        Self {
            x: self.x.max(b.x),
            y: self.y.max(b.y),
        }
    }

    pub fn floor(&self) -> Self {
        Self {
            x: self.x.floor(),
            y: self.y.floor(),
        }
    }

    pub fn ceil(&self) -> Self {
        Self {
            x: self.x.ceil(),
            y: self.y.ceil(),
        }
    }

    pub fn abs(&self) -> Self {
        Self {
            x: self.x.abs(),
            y: self.y.abs(),
        }
    }

    pub fn sign(&self) -> Self {
        Self {
            x: sign(self.x),
            y: sign(self.y),
        }
    }

    pub fn normalise(&self) -> Self {
        let mag = self.length();

        Self {
            x: self.x / mag,
            y: self.y / mag,
        }
    }

    pub fn lerp(&self, diff: &Self, t: f64) -> Self {
        Self {
            x: lerp(self.x, diff.x, t),
            y: lerp(self.y, diff.y, t),
        }
    }

    pub fn rotate(&self, center: &Point, amount: f64) -> Self {
        let dx = self.x - center.x;
        let dy = self.y - center.y;
        let cos_rotate = amount.cos();
        let sin_rotate = amount.sin();

        Point {
            x: center.x + (dx * cos_rotate) - (dy * sin_rotate),
            y: center.y + (dx * sin_rotate) + (dy * cos_rotate),
        }
    }

    pub fn clamp_mut(&mut self, min: &Self, max: &Self) -> &mut Self {
        self.x = self.x.min(max.x).max(min.x);
        self.y = self.y.min(max.y).max(min.y);
        self
    }

    pub fn min_mut(&mut self, b: &Self) -> &mut Self {
        self.x = self.x.min(b.x);
        self.y = self.y.min(b.y);
        self
    }

    pub fn max_mut(&mut self, b: &Self) -> &mut Self {
        self.x = self.x.max(b.x);
        self.y = self.y.max(b.y);
        self
    }

    pub fn floor_mut(&mut self) -> &mut Self {
        self.x = self.x.floor();
        self.y = self.y.floor();
        self
    }

    pub fn ceil_mut(&mut self) -> &mut Self {
        self.x = self.x.ceil();
        self.y = self.y.ceil();
        self
    }

    pub fn abs_mut(&mut self) -> &mut Self {
        self.x = self.x.abs();
        self.y = self.y.abs();
        self
    }

    pub fn sign_mut(&mut self) -> &mut Self {
        self.x = sign(self.x);
        self.y = sign(self.y);
        self
    }

    pub fn normalise_mut(&mut self) -> &mut Self {
        let mag = self.length();

        self.x /= mag;
        self.y /= mag;
        self
    }

    pub fn lerp_mut(&mut self, diff: &Self, t: f64) -> &mut Self {
        self.x = lerp(self.x, diff.x, t);
        self.y = lerp(self.y, diff.y, t);
        self
    }

    pub fn rotate_mut(&mut self, center: &Point, amount: f64) -> &mut Self {
        let dx = self.x - center.x;
        let dy = self.y - center.y;
        let cos_rotate = amount.cos();
        let sin_rotate = amount.sin();

        self.x = center.x + (dx * cos_rotate) - (dy * sin_rotate);
        self.y = center.y + (dx * sin_rotate) + (dy * cos_rotate);
        self
    }

    pub fn determinant(&self, p: &Self) -> f64 {
        (self.x * p.y) - (self.y * p.x)
    }

    pub fn dot(&self, p: &Self) -> f64 {
        self.x * p.x + self.y * p.y
    }

    pub fn length(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }

    pub fn in_range(&self, min: &Self, max: &Self) -> bool {
        !(self.x > max.x || self.x < min.x || self.y > max.y || self.y < min.y)
    }
}

impl PartialEq<Self> for Point {
    fn eq(&self, other: &Self) -> bool {
        //since we are dealing with floats here we should allow for rounding error
        (self.x - other.x).abs() < EPSILON && (self.y - other.y).abs() < EPSILON
    }
}

impl_op_ex!(+ |a: &Point, b: &Self| -> Point {
    Point {
        x: a.x + b.x,
        y: a.y + b.y
    }
});

impl_op_ex_commutative!(+ |a: &Point, b: f64| -> Point {
    Point {
        x: a.x + b,
        y: a.y + b
    }
});

impl_op_ex!(+= |a: &mut Point, b: &Self| {
    a.x += b.x;
    a.y += b.y;
});

impl_op_ex!(+= |a: &mut Point, b: f64| {
    a.x += b;
    a.y += b;
});

impl_op_ex!(-|a: &Point, b: &Point| -> Point {
    Point {
        x: a.x - b.x,
        y: a.y - b.y,
    }
});

impl_op_ex_commutative!(-|a: &Point, b: f64| -> Point {
    Point {
        x: a.x - b,
        y: a.y - b,
    }
});

impl_op_ex!(-= |a: &mut Point, b: &Self| {
    a.x -= b.x;
    a.y -= b.y;
});

impl_op_ex!(-= |a: &mut Point, b: f64| {
    a.x -= b;
    a.y -= b;
});

impl_op_ex!(*|a: &Point, b: &Point| -> Point {
    Point {
        x: a.x * b.x,
        y: a.y * b.y,
    }
});

impl_op_ex_commutative!(*|a: &Point, b: f64| -> Point {
    Point {
        x: a.x * b,
        y: a.y * b,
    }
});

impl_op_ex!(*= |a: &mut Point, b: &Point| {
    a.x *= b.x;
    a.y *= b.y;
});

impl_op_ex!(*= |a: &mut Point, b: f64| {
    a.x *= b;
    a.y *= b;
});

impl_op_ex!(/ |a: &Point, b: &Point| -> Point {
    Point {
        x: a.x / b.x,
        y: a.y / b.y
    }
});

impl_op_ex_commutative!(/ |a: &Point, b: f64| -> Point {
    Point {
        x: a.x / b,
        y: a.y / b
    }
});

impl_op_ex!(/= |a: &mut Point, b: &Point| {
    a.x /= b.x;
    a.y /= b.y;
});

impl_op_ex!(/= |a: &mut Point, b: f64| {
    a.x /= b;
    a.y /= b;
});
