use minifb::{Key, Window, WindowOptions};
use std::{time::Duration, usize};

use generator::{
    vec2::Vec2,
    rasterise::rasterise,
    slice2d::{rgb, Slice2d},
    traverse::{traverse, TraverseOptions},
    triangle::Triangle,
};

fn main() {
    const WIDTH: usize = 512;
    const HEIGHT: usize = 512;

    let mut buffer = Slice2d {
        data: vec![0; WIDTH * HEIGHT],
        width: WIDTH,
        height: HEIGHT,
    };

    let p1 = Vec2 { x: 10.2, y: 10.8 };
    let p2 = Vec2 { x: 20.5, y: 20.4 };
    let p3 = Vec2 { x: 20.5, y: 10.4 };

    let mut triangle = Triangle::new(p1, p2, p3);

    let mut window = Window::new(
        "Rasterise demo - ESC to exit",
        WIDTH,
        HEIGHT,
        WindowOptions::default(),
    )
    .expect("No window");
    window.limit_update_rate(Some(Duration::from_micros(16600)));

    let center = triangle.center();

    let rotate_amount = 0.01;

    let zoom = 20;

    let traverse_options = TraverseOptions {
        pos: Vec2 { x: 0.0, y: 0.0 },
        cell_size: Vec2 {
            x: zoom as f64,
            y: zoom as f64,
        },
    };

    let red = rgb(255, 0, 0);
    let blue = rgb(0, 0, 255);
    let green = rgb(0, 255, 0);
    let yellow = rgb(255, 255, 0);
    let white = rgb(255, 255, 255);

    while window.is_open() && !window.is_key_down(Key::Escape) {
        //clear
        buffer.data.fill(0);

        //rotate all of the triangles vertices so we can test the algorithm fully
        triangle.p1.rotate_mut(&center, rotate_amount);
        triangle.p2.rotate_mut(&center, rotate_amount);
        triangle.p3.rotate_mut(&center, rotate_amount);

        let min = triangle.min();
        let max = triangle.max();

        //triangle scanlines verification
        for y in (min.floor().y as usize)..=(max.floor().y as usize) {
            buffer.rectangle(
                min.x.floor() as i32 * zoom,
                y as i32 * zoom,
                (((max.x.ceil() - min.x.floor()) as i32) * zoom) as usize,
                zoom as usize,
                white,
            );
        }

        rasterise(&triangle, |min_x, max_x, y, is_inside| {
            buffer.rectangle(
                min_x as i32 * zoom,
                y as i32 * zoom,
                ((max_x + 1 - min_x) as i32 * zoom) as usize,
                zoom as usize,
                if is_inside { blue } else { green },
            );
        });

        //overlay a traversal over half the pixels that should be marked on the line for comparison
        for line in triangle.lines() {
            for point in traverse(
                &(line.p1 * zoom as f64),
                &(line.p2 * zoom as f64),
                &traverse_options,
            ) {
                buffer.rectangle(
                    (point.x * zoom as f64 + traverse_options.pos.x) as i32,
                    (point.y * zoom as f64 + traverse_options.pos.y) as i32,
                    (zoom / 2) as usize,
                    zoom as usize,
                    yellow,
                );
            }
        }

        //overlay a zoomed triangle at native resolution using a bresenham to track the location
        for line in triangle.lines() {
            buffer.line(
                (line.p1.x * zoom as f64) as usize,
                (line.p1.y * zoom as f64) as usize,
                (line.p2.x * zoom as f64) as usize,
                (line.p2.y * zoom as f64) as usize,
                red,
            );
        }

        window
            .update_with_buffer(&buffer.data, WIDTH, HEIGHT)
            .unwrap();
    }
}
