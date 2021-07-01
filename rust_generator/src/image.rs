use image::{io::Reader, GenericImageView};

use crate::slice2d::{rgb, Slice2d};

pub fn load_image(path: &str) -> Option<Slice2d> {
    let img = Reader::open(path).ok()?.decode().ok()?;

    //translate the img structure to match the front buffer structure so we can output the buffer directly
    Some(Slice2d {
        data: img
            .as_rgba8()?
            .pixels()
            .map(|pixel| rgb(pixel[0], pixel[1], pixel[2]))
            .collect::<Vec<u32>>(),
        width: img.width() as usize,
        height: img.height() as usize,
    })
}
