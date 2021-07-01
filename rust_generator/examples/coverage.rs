use minifb::{Key, Window, WindowOptions};
use std::time::Duration;

use generator::{dda::DdaOptions, image::load_image, point::Point, rasterise::rasterise, slice2d::{Slice2d, rgb}, triangle::Triangle, triangle_coverage::triangle_coverage};

fn main() {
    const WIDTH: usize = 512;
    const HEIGHT: usize = 512;

    let img = load_image("../dist/media/photo.png").expect("Could not load image :(");

    let mut buffer = Slice2d {
        data: vec![0; WIDTH * HEIGHT],
        width: WIDTH,
        height: HEIGHT,
    };

    let triangles = vec![
        Triangle::new(
            Point { x: 0.0, y: 0.0 },
            Point { x: 50.0, y: 0.0 },
            Point { x: 0.0, y: 50.0 },
        ),
        Triangle::new(
            Point { x: 511.0, y: 511.0 },
            Point { x: 461.0, y: 511.0 },
            Point { x: 511.0, y: 461.0 },
        ),
        Triangle::new(
            Point { x: 511.0, y: 0.0 },
            Point { x: 461.0, y: 0.0 },
            Point { x: 511.0, y: 50.0 },
        ),
        Triangle::new(
            Point { x: 0.0, y: 511.0 },
            Point { x: 50.0, y: 511.0 },
            Point { x: 0.0, y: 461.0 },
        ),
        Triangle::new(
            Point { x: 70.0, y: 20.0 },
            Point { x: 450.0, y: 461.0 },
            Point { x: 452.0, y: 461.0 },
        ),
        Triangle::new(
            Point { x: 450.0, y: 20.0 },
            Point { x: 70.0, y: 461.0 },
            Point { x: 72.0, y: 461.0 },
        ),
        Triangle::new(
            Point { x: 255.1, y: 120.2 },
            Point { x: 155.3, y: 461.4 },
            Point { x: 255.5, y: 461.6 },
        ),
        Triangle::new(
            Point { x: 461.1, y: 120.2 },
            Point { x: 255.3, y: 261.4 },
            Point { x: 155.5, y: 120.6 },
        ),
        Triangle::new(
            Point { x: 510.0, y: 510.0 },
            Point { x: 510.0, y: 255.0 },
            Point { x: 510.0, y: 0.0 }
        ),
        Triangle::new(
            Point { x: 2.0, y: 0.0 },
            Point { x: 2.0, y: 255.0 },
            Point { x: 2.0, y: 510.0 }
        ),
        Triangle::new(
            Point { x: 0.0, y: 510.0 },
            Point { x: 255.0, y: 510.0 },
            Point { x: 510.0, y: 510.0 }
        ),
        Triangle::new(
            Point { x: 0.0, y: 2.0 },
            Point { x: 255.0, y: 2.0 },
            Point { x: 510.0, y: 2.0 }
        )
    ];
    
    let mut window = Window::new(
        "Coverage example - ESC to exit",
        WIDTH,
        HEIGHT,
        WindowOptions::default(),
    )
    .expect("No window");
    window.limit_update_rate(Some(Duration::from_micros(16600)));

    let dda_options = DdaOptions::default();

    while window.is_open() && !window.is_key_down(Key::Escape) {
        //clear
        buffer.data.fill(0);

        //draw a copy of the image for reference
        buffer.image(&img, 0, 0);

        for triangle in &triangles {
            let triangle_rgb = triangle_coverage(&img, &triangle);
            let triangle_col = rgb(triangle_rgb.0, triangle_rgb.1, triangle_rgb.2);
            rasterise(&triangle, &dda_options, |min_x, max_x, y, _is_inside| {
                buffer.rectangle(min_x as i32, y as i32, max_x - min_x + 1, 1, triangle_col);
            });
        }

        window
            .update_with_buffer(&buffer.data, WIDTH, HEIGHT)
            .unwrap();
    }
}
