use std::{sync::Arc, thread};

use crate::{
    vec2::Vec2,
    slice2d::{rgb, Slice2d},
    triangle::Triangle,
    triangle_coverage::triangle_coverage,
};

pub fn create_triangle_map(img: Slice2d, resolution: usize) -> Slice2d {
    let texture_size = resolution.pow(3);

    //we force samples on the extremes of the dimensions
    let img_width = img.width;
    let img_height = img.height;

    let x_step = (img_width - 1) / (resolution - 1);
    let y_step = (img_height - 1) / (resolution - 1);

    //cover all possibilities for all 6 coordinates of the triangle
    let img_ref = Arc::new(img);

    let mut handles = vec![];
    for x1 in (0..img_width).step_by(x_step) {
        for y1 in (0..img_height).step_by(y_step) {
            for x2 in (0..img_width).step_by(x_step) {
                for y2 in (0..img_height).step_by(y_step) {
                    for x3 in (0..img_width).step_by(x_step) {
                        for y3 in (0..img_height).step_by(y_step) {
                            let img_ref_clone = img_ref.clone();

                            let handle = thread::spawn(move || {
                                let mut triangle = Triangle::new(
                                    Vec2 {
                                        x: x1 as f64,
                                        y: y1 as f64,
                                    },
                                    Vec2 {
                                        x: x2 as f64,
                                        y: y2 as f64,
                                    },
                                    Vec2 {
                                        x: x3 as f64,
                                        y: y3 as f64,
                                    },
                                );

                                triangle.calculate_directions();

                                let colour = triangle_coverage(&img_ref_clone, &triangle);
                                rgb(colour.0, colour.1, colour.2)
                            });

                            handles.push(handle);
                        }
                    }
                }
            }
        }
    }

    Slice2d {
        width: texture_size,
        height: texture_size,
        data: handles
            .into_iter()
            .map(|item| item.join().unwrap())
            .collect::<Vec<_>>(),
    }
}
