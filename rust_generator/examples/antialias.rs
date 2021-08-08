use minifb::{Key, MouseMode, Window, WindowOptions};
use std::time::Duration;

use generator::{
    image::load_image,
    vec2::Vec2,
    rasterise::rasterise,
    slice2d::{from_u32, rgb, Slice2d},
    triangle::Triangle,
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

    let mut triangle = Triangle::new(
        Vec2 { x: 120.0, y: 120.0 },
        Vec2 { x: 200.0, y: 150.0 },
        Vec2 { x: 150.0, y: 200.0 },
    );

    let mut window = Window::new(
        "Antialias example - ESC to exit",
        WIDTH,
        HEIGHT,
        WindowOptions::default(),
    )
    .expect("No window");
    window.limit_update_rate(Some(Duration::from_micros(16600)));

    let mut center = triangle.center();

    let rotate_amount = 0.01;

    while window.is_open() && !window.is_key_down(Key::Escape) {
        //clear
        buffer.data.fill(0);

        let triangle_size = triangle.max() - triangle.min();

        if let Some((x, y)) = window.get_mouse_pos(MouseMode::Discard) {
            //make sure the triangle does not go out the bounds by only setting if the
            let mouse_x = x as f64;
            let mouse_y = y as f64;

            if mouse_x > triangle_size.x
                && mouse_x < buffer.width as f64 - triangle_size.x
                && mouse_y > triangle_size.y
                && mouse_y < buffer.height as f64 - triangle_size.y
            {
                let new_center = Vec2 {
                    x: mouse_x,
                    y: mouse_y,
                };

                triangle.p1 = triangle.p1 - center + new_center;
                triangle.p2 = triangle.p2 - center + new_center;
                triangle.p3 = triangle.p3 - center + new_center;

                center.x = mouse_x;
                center.y = mouse_y;
            }
        }

        //rotate all of the triangles vertices so we can test the algorithm fully
        triangle.p1.rotate_mut(&center, rotate_amount);
        triangle.p2.rotate_mut(&center, rotate_amount);
        triangle.p3.rotate_mut(&center, rotate_amount);
        triangle.calculate_directions();

        rasterise(&triangle, |min_x, max_x, y, is_inside| {
            if is_inside {
                let width = max_x + 1 - min_x;
                let buffer_index = buffer.index(min_x, y);
                let img_index = img.index(min_x, y);

                buffer.data[buffer_index..=buffer_index + width]
                    .copy_from_slice(&img.data[img_index..=img_index + width]);
            } else {
                //process each outer pixel seperately so we have per-pixel shading
                for x in min_x..=max_x {
                    //as a test, determine the coverage of the triangle in outside cells and use as antialiasing
                    let polygon = triangle.intersect_square(
                        Vec2 {
                            x: x as f64,
                            y: y as f64,
                        },
                        Vec2 {
                            x: x as f64 + 1.0,
                            y: y as f64 + 1.0,
                        },
                    );

                    let percent_coverage = polygon.area().clamp(0.0, 1.0);
                    let pic_color = from_u32(img.get(x, y));

                    buffer.rectangle(
                        x as i32,
                        y as i32,
                        1,
                        1,
                        rgb(
                            (pic_color.0 as f64 * percent_coverage).floor() as u8,
                            (pic_color.1 as f64 * percent_coverage).floor() as u8,
                            (pic_color.2 as f64 * percent_coverage).floor() as u8,
                        ),
                    );
                }
            }
        });

        window
            .update_with_buffer(&buffer.data, WIDTH, HEIGHT)
            .unwrap();
    }
}
