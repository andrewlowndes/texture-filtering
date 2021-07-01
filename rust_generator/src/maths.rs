pub fn lerp(a: f64, diff: f64, t: f64) -> f64 {
    a + diff * t
}

pub fn inverse_lerp(a: f64, diff: f64, val: f64) -> f64 {
    if diff==0.0 { 0.0 } else { (val - a) / diff }
}

pub fn sign(a: f64) -> f64 {
    if a > 0.0 {
        1.0
    } else if a < 0.0 {
        -1.0
    } else {
        0.0
    }
}

pub fn neg_fract(x: f64) -> f64 {
    1.0 - x + x.floor()
}
