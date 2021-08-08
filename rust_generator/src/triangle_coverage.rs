use std::f64::EPSILON;

use crate::{
    vec2::Vec2,
    rasterise::rasterise,
    slice2d::{from_u32, Slice2d},
    triangle::Triangle,
};

pub fn triangle_coverage(image_buffer: &Slice2d, triangle: &Triangle) -> (u8, u8, u8) {
    let mut colour: (f64, f64, f64) = (0.0, 0.0, 0.0);

    let triangle_area = triangle.area();

    //if the triangle is degenerate and has no area then we just average the colours the lines cover
    if triangle_area < EPSILON {
        let mut num_pixels = 0;

        rasterise(triangle, |min_x, max_x, y, _is_inside| {
            let img_index = image_buffer.index(0, y);

            for x in min_x..=max_x {
                let (r, g, b) = from_u32(image_buffer.data[img_index + x]);

                colour.0 += r as f64;
                colour.1 += g as f64;
                colour.2 += b as f64;
                num_pixels += 1;
            }
        });

        return (
            (colour.0 / num_pixels as f64).floor() as u8,
            (colour.1 / num_pixels as f64).floor() as u8,
            (colour.2 / num_pixels as f64).floor() as u8,
        );
    }

    rasterise(triangle, |min_x, max_x, y, is_inside| {
        let img_index = image_buffer.index(0, y);

        if is_inside {
            for x in min_x..=max_x {
                let (r, g, b) = from_u32(image_buffer.data[img_index + x]);

                colour.0 += r as f64;
                colour.1 += g as f64;
                colour.2 += b as f64;
            }
        } else {
            //process each outer pixel seperately so we have per-pixel shading
            let y_max = y as f64 + 1.0;

            for x in min_x..=max_x {
                //as a test, determine the coverage of the triangle in outside cells and use as antialiasing
                let polygon = triangle.intersect_square(
                    Vec2 {
                        x: x as f64,
                        y: y as f64,
                    },
                    Vec2 {
                        x: x as f64 + 1.0,
                        y: y_max,
                    },
                );

                let percent_coverage = polygon.area().clamp(0.0, 1.0);
                let (r, g, b) = from_u32(image_buffer.data[img_index + x]);

                colour.0 += r as f64 * percent_coverage;
                colour.1 += g as f64 * percent_coverage;
                colour.2 += b as f64 * percent_coverage;
            }
        }
    });

    (
        (colour.0 / triangle_area).floor() as u8,
        (colour.1 / triangle_area).floor() as u8,
        (colour.2 / triangle_area).floor() as u8,
    )
}
