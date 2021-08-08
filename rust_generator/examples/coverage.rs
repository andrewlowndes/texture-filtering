use minifb::{Key, Window, WindowOptions};
use std::time::Duration;

use generator::{
    image::load_image,
    vec2::Vec2,
    rasterise::rasterise,
    slice2d::{rgb, Slice2d},
    triangle::Triangle,
    triangle_coverage::triangle_coverage,
};

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
            Vec2 { x: 0.0, y: 0.0 },
            Vec2 { x: 50.0, y: 0.0 },
            Vec2 { x: 0.0, y: 50.0 },
        ),
        Triangle::new(
            Vec2 { x: 511.0, y: 511.0 },
            Vec2 { x: 461.0, y: 511.0 },
            Vec2 { x: 511.0, y: 461.0 },
        ),
        Triangle::new(
            Vec2 { x: 511.0, y: 0.0 },
            Vec2 { x: 461.0, y: 0.0 },
            Vec2 { x: 511.0, y: 50.0 },
        ),
        Triangle::new(
            Vec2 { x: 0.0, y: 511.0 },
            Vec2 { x: 50.0, y: 511.0 },
            Vec2 { x: 0.0, y: 461.0 },
        ),
        Triangle::new(
            Vec2 { x: 70.0, y: 20.0 },
            Vec2 { x: 450.0, y: 461.0 },
            Vec2 { x: 452.0, y: 461.0 },
        ),
        Triangle::new(
            Vec2 { x: 450.0, y: 20.0 },
            Vec2 { x: 70.0, y: 461.0 },
            Vec2 { x: 72.0, y: 461.0 },
        ),
        Triangle::new(
            Vec2 { x: 255.1, y: 120.2 },
            Vec2 { x: 155.3, y: 461.4 },
            Vec2 { x: 255.5, y: 461.6 },
        ),
        Triangle::new(
            Vec2 { x: 461.1, y: 120.2 },
            Vec2 { x: 255.3, y: 261.4 },
            Vec2 { x: 155.5, y: 120.6 },
        ),
        Triangle::new(
            Vec2 { x: 510.0, y: 510.0 },
            Vec2 { x: 510.0, y: 255.0 },
            Vec2 { x: 510.0, y: 0.0 },
        ),
        Triangle::new(
            Vec2 { x: 2.0, y: 0.0 },
            Vec2 { x: 2.0, y: 255.0 },
            Vec2 { x: 2.0, y: 510.0 },
        ),
        Triangle::new(
            Vec2 { x: 0.0, y: 510.0 },
            Vec2 { x: 255.0, y: 510.0 },
            Vec2 { x: 510.0, y: 510.0 },
        ),
        Triangle::new(
            Vec2 { x: 0.0, y: 2.0 },
            Vec2 { x: 255.0, y: 2.0 },
            Vec2 { x: 510.0, y: 2.0 },
        ),
    ];

    let mut window = Window::new(
        "Coverage example - ESC to exit",
        WIDTH,
        HEIGHT,
        WindowOptions::default(),
    )
    .expect("No window");
    window.limit_update_rate(Some(Duration::from_micros(16600)));

    while window.is_open() && !window.is_key_down(Key::Escape) {
        //clear
        buffer.data.fill(0);

        //draw a copy of the image for reference
        buffer.image(&img, 0, 0);

        for triangle in &triangles {
            let triangle_rgb = triangle_coverage(&img, triangle);
            let triangle_col = rgb(triangle_rgb.0, triangle_rgb.1, triangle_rgb.2);

            rasterise(triangle, |min_x, max_x, y, _is_inside| {
                buffer.rectangle(min_x as i32, y as i32, max_x + 1 - min_x, 1, triangle_col);
            });
        }

        window
            .update_with_buffer(&buffer.data, WIDTH, HEIGHT)
            .unwrap();
    }
}
