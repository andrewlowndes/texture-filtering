use crate::{bresenham::line, line::Line, point::Point};

/**
 * A wrapper around a buffer with specific sizes and methods for operating on the buffer
 */
#[derive(Clone)]
pub struct Slice2d {
    pub data: Vec<u32>,
    pub width: usize,
    pub height: usize,
}

impl Slice2d {
    pub fn index(&self, x: usize, y: usize) -> usize {
        y * self.width + x
    }

    pub fn get(&self, x: usize, y: usize) -> u32 {
        self.data[self.index(x, y)]
    }

    pub fn set(&mut self, x: i32, y: i32, col: u32) {
        if x >= 0 && x < self.width as i32 && y >= 0 && y < self.height as i32 {
            let index = self.index(x as usize, y as usize);
            self.data[index] = col;
        }
    }

    pub fn line(&mut self, x: usize, y: usize, x2: usize, y2: usize, col: u32) {
        let full_line = Line {
            p1: Point {
                x: x as f64,
                y: y as f64,
            },
            p2: Point {
                x: x2 as f64,
                y: y2 as f64,
            },
        };

        if let Some(clipped_line) = full_line.clip_rectangle(
            Point { x: 0.0, y: 0.0 },
            Point {
                x: self.width as f64 - 1.0,
                y: self.height as f64 - 1.0,
            },
        ) {
            for (plot_x, plot_y) in line(
                clipped_line.p1.x as i32,
                clipped_line.p1.y as i32,
                clipped_line.p2.x as i32,
                clipped_line.p2.y as i32,
            ) {
                unsafe {
                    self.set_unchecked(plot_x as usize, plot_y as usize, col);
                }
            }
        }
    }

    pub fn rectangle(&mut self, x: i32, y: i32, width: usize, height: usize, col: u32) {
        let x_samples = (self.width as i32 - x).min(width as i32 + x.min(0));
        let y_samples = (self.height as i32 - y).min(height as i32 + y.min(0));

        if x_samples < 0 || y_samples < 0 {
            return;
        }

        let x_start = x.max(0) as usize;
        let y_start = y.max(0) as usize;
        let x_width = x_samples as usize;

        let new_buffer = vec![col; x_width];

        for plot_y in y_start..(y_start + y_samples as usize) {
            let i = self.index(x_start, plot_y);
            self.data[i..(i + x_width)].copy_from_slice(&new_buffer);
        }
    }

    pub fn image(&mut self, buffer: &Slice2d, x: i32, y: i32) {
        let x_samples = (self.width as i32 - x).min(buffer.width as i32 + x.min(0));
        let y_samples = (self.height as i32 - y).min(buffer.height as i32 + y.min(0));

        if x_samples < 0 || y_samples < 0 {
            return;
        }

        let x_start = x.max(0) as usize;
        let y_start = y.max(0) as usize;
        let x_width = x_samples as usize;
        let x_sample_start = -x.min(0) as usize;
        let x_sample_end = x_sample_start + x_width;

        for (index, row) in buffer
            .data
            .chunks(buffer.width)
            .skip(y_start)
            .take(y_samples as usize)
            .enumerate()
        {
            let i = self.index(x_start, index as usize + y_start);
            let x_slice = &row[x_sample_start..x_sample_end];

            self.data[i..(i + x_width)].copy_from_slice(x_slice);
        }
    }

    /// # Safety
    /// Panics if the x or y is out of the buffer bounds
    pub unsafe fn set_unchecked(&mut self, x: usize, y: usize, col: u32) {
        self.data[y * self.width + x] = col;
    }

    /// # Safety
    /// Panics if the line coordinates are out of the buffer bounds
    pub unsafe fn line_unchecked(&mut self, x: usize, y: usize, x2: usize, y2: usize, col: u32) {
        for (plot_x, plot_y) in line(x as i32, y as i32, x2 as i32, y2 as i32) {
            self.set_unchecked(plot_x as usize, plot_y as usize, col);
        }
    }

    /// # Safety
    /// Panics if the position and size are out of the buffer bounds
    pub unsafe fn rectangle_unchecked(
        &mut self,
        x: usize,
        y: usize,
        width: usize,
        height: usize,
        col: u32,
    ) {
        let new_buffer = vec![col; width];

        for plot_y in y..y + height {
            let i = self.index(x, plot_y);
            self.data[i..(i + width)].copy_from_slice(&new_buffer);
        }
    }

    /// # Safety
    /// Panics if the position and image size are outside the buffer dimensions
    pub unsafe fn image_unchecked(&mut self, buffer: &Slice2d, x: usize, y: usize) {
        for (index, row) in buffer.data.chunks(buffer.width).enumerate() {
            let i = self.index(x, index + y);
            self.data[i..(i + buffer.width)].copy_from_slice(row);
        }
    }
}

pub const fn rgb(r: u8, g: u8, b: u8) -> u32 {
    u32::from_be_bytes([0, r, g, b])
}

pub const fn from_u32(col: u32) -> (u8, u8, u8) {
    let [_, r, g, b] = u32::to_be_bytes(col);
    (r, g, b)
}
