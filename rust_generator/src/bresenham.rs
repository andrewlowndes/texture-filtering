pub struct LineIterator {
    err: i32,
    x: i32,
    y: i32,
    end_x: i32,
    end_y: i32,
    dx: i32,
    dy: i32,
    sx: i32,
    sy: i32,
    done: bool,
}

impl Iterator for LineIterator {
    type Item = (i32, i32);

    fn next(&mut self) -> Option<Self::Item> {
        if self.done {
            return None;
        }

        let result = Some((self.x, self.y));

        if self.x == self.end_x && self.y == self.end_y {
            self.done = true;
            return result;
        }

        let e2 = 2 * self.err;

        if e2 >= self.dy {
            self.err += self.dy;
            self.x += self.sx;
        }

        if e2 <= self.dx {
            self.err += self.dx;
            self.y += self.sy;
        }

        result
    }
}

pub fn line(x: i32, y: i32, end_x: i32, end_y: i32) -> LineIterator {
    let dx = (end_x - x).abs();
    let sx = if x < end_x { 1 } else { -1 };
    let dy = -(end_y - y).abs();
    let sy = if y < end_y { 1 } else { -1 };
    let err = dx + dy;

    LineIterator {
        dx,
        sx,
        dy,
        sy,
        err,
        x,
        y,
        end_x,
        end_y,
        done: false,
    }
}
