use minifb::{Key, Window, WindowOptions};
use std::{time::Duration, usize};

use generator::{dda::{DdaOptions, dda}, point::Point, slice2d::{rgb, Slice2d}};

fn main() {
    const WIDTH: usize = 512;
    const HEIGHT: usize = 512;

    let mut buffer = Slice2d {
        data: vec![0; WIDTH * HEIGHT],
        width: WIDTH,
        height: HEIGHT,
    };

    let mut p1 = Point { x: 10.2, y: 10.8 };
    let mut p2 = Point { x: 20.5, y: 20.4 };

    let mut window = Window::new(
        "Dda validation - ESC to exit",
        WIDTH,
        HEIGHT,
        WindowOptions::default(),
    )
    .expect("No window");
    window.limit_update_rate(Some(Duration::from_micros(16600)));

    let center = (p2 + p1) / 2.0;

    let rotate_amount = 0.01;

    let zoom = 20.0;

    let dda_options = DdaOptions {
        pos: Point { x: 100.0, y: 10.0 },
        cell_size: Point { x: zoom, y: zoom },
    };

    let red = rgb(255, 0, 0);
    let white = rgb(255, 255, 255);

    while window.is_open() && !window.is_key_down(Key::Escape) {
        //clear
        buffer.data.fill(0);

        //rotate all of the triangles vertices so we can test the algorithm fully
        p1.rotate_mut(&center, rotate_amount);
        p2.rotate_mut(&center, rotate_amount);

        for point in dda(&(p1 * zoom), &(p2 * zoom), &dda_options) {
            buffer.rectangle((point.x * zoom + dda_options.pos.x) as i32, (point.y * zoom + dda_options.pos.y) as i32, zoom as usize, zoom as usize, white);
        }

        buffer.line((p1.x * zoom) as usize, (p1.y * zoom) as usize, (p2.x * zoom) as usize, (p2.y * zoom) as usize, red);

        window
            .update_with_buffer(&buffer.data, WIDTH, HEIGHT)
            .unwrap();
    }
}
