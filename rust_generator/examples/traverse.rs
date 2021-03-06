use minifb::{Key, Window, WindowOptions};
use std::{time::Duration, usize};

use generator::{
    vec2::Vec2,
    slice2d::{rgb, Slice2d},
    traverse::{traverse, TraverseOptions},
};

fn main() {
    const WIDTH: usize = 512;
    const HEIGHT: usize = 512;

    let mut buffer = Slice2d {
        data: vec![0; WIDTH * HEIGHT],
        width: WIDTH,
        height: HEIGHT,
    };

    let mut p1 = Vec2 { x: 10.2, y: 10.8 };
    let mut p2 = Vec2 { x: 20.5, y: 20.4 };

    let mut window = Window::new(
        "Traverse demo - ESC to exit",
        WIDTH,
        HEIGHT,
        WindowOptions::default(),
    )
    .expect("No window");
    window.limit_update_rate(Some(Duration::from_micros(16600)));

    let center = (p2 + p1) / 2.0;

    let rotate_amount = 0.01;

    let zoom = 20.0;

    let traverse_options = TraverseOptions {
        pos: Vec2 { x: 100.0, y: 10.0 },
        cell_size: Vec2 { x: zoom, y: zoom },
    };

    let red = rgb(255, 0, 0);
    let white = rgb(255, 255, 255);

    while window.is_open() && !window.is_key_down(Key::Escape) {
        //clear
        buffer.data.fill(0);

        //rotate all of the triangles vertices so we can test the algorithm fully
        p1.rotate_mut(&center, rotate_amount);
        p2.rotate_mut(&center, rotate_amount);

        for point in traverse(&(p1 * zoom), &(p2 * zoom), &traverse_options) {
            buffer.rectangle(
                (point.x * zoom + traverse_options.pos.x) as i32,
                (point.y * zoom + traverse_options.pos.y) as i32,
                zoom as usize,
                zoom as usize,
                white,
            );
        }

        buffer.line(
            (p1.x * zoom) as usize,
            (p1.y * zoom) as usize,
            (p2.x * zoom) as usize,
            (p2.y * zoom) as usize,
            red,
        );

        window
            .update_with_buffer(&buffer.data, WIDTH, HEIGHT)
            .unwrap();
    }
}
