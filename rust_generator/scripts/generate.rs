use generator::{image::load_image, slice2d::from_u32, triangle_map::create_triangle_map};
use image::{Rgb, RgbImage};
use std::{env::args, time::Instant};

fn main() {
    if args().len() < 2 {
        println!("Usage: [image path] [resolution] [output path]");
        return;
    }

    //allow a image path to be given, a resolution and output directory
    let input_path = args().nth(1).expect("no image path given");
    let resolution = args()
        .nth(2)
        .expect("no resolution given")
        .parse::<usize>()
        .expect("resolution must be a positive number");
    let output_path = args().nth(3).expect("no resolution given");

    //generate a triangle map from the inputs
    let img = load_image(&input_path).expect("Could not load image :(");

    println!("Generating...");
    let start = Instant::now();
    let cache = create_triangle_map(img, resolution);
    let time_taken = start.elapsed().as_millis();
    println!("Time taken: {:?}ms", time_taken);

    let mut cache_img = RgbImage::new(cache.width as u32, cache.height as u32);

    for x in 0..cache.width {
        for y in 0..cache.height {
            let colour = from_u32(cache.data[cache.index(x, y)]);
            cache_img.put_pixel(x as u32, y as u32, Rgb([colour.0, colour.1, colour.2]));
        }
    }

    cache_img
        .save(&output_path)
        .expect("could not save image to output path specified");
    
    println!("Saved image :)");
}
