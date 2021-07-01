use minifb::{Key, Window, WindowOptions};
use std::time::{Duration, Instant};

use generator::{image::load_image, slice2d::Slice2d, triangle_map::create_triangle_map};

const RESOLUTION: usize = 3;

fn main() {
    let img = load_image("../dist/media/photo.png").expect("Could not load image :(");

    //warning: resolution complexity is exponential and can take a long time, keep it 8 or under
    let start = Instant::now();
    let cache = create_triangle_map(img, RESOLUTION);
    let time_taken = start.elapsed().as_millis();

    println!("Time taken: {:?}ms", time_taken);

    let mut buffer = Slice2d {
        data: vec![0; cache.width * cache.height ],
        width: cache.width,
        height: cache.height,
    };

    let mut window = Window::new(
        "Triangle map generation example - ESC to exit",
        cache.width,
        cache.height,
        WindowOptions::default(),
    )
    .expect("No window");

    window.limit_update_rate(Some(Duration::from_micros(16600)));

    while window.is_open() && !window.is_key_down(Key::Escape) {
        buffer.image(&cache, 0, 0);

        window
            .update_with_buffer(&buffer.data, cache.width, cache.height)
            .unwrap();
    }
}
