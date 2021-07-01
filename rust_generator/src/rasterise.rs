use crate::{
    dda::{dda, DdaOptions},
    triangle::Triangle,
};

#[derive(Clone, Debug, PartialEq)]
pub struct LineEntry {
    min: usize,
    max: usize,
}

pub type Scanline = [Option<LineEntry>; 3];

//when rasterising each vertical scanline for the triangle is traversed and inclusive ranges are passed to the callbacks
//note: can convert to a generator instead and store the inside/outside on the return object
//callback properties: min x, max x, y, is_inside
pub fn rasterise<F: FnMut(usize, usize, usize, bool)>(
    triangle: &Triangle,
    options: &DdaOptions,
    mut callback: F,
) {
    let min = triangle.min();
    let max = triangle.max();

    if max.y < min.y {
        return;
    }

    let num_scanlines = (max.y.floor() - min.y.floor() + 1.0) as usize;

    //each scanline can have all 3 lines cross it so we need to store ranges for each one
    let mut scanlines: Vec<Scanline> = vec![[None, None, None]; num_scanlines];

    let lines = [
        (&triangle.p1, &triangle.p2),
        (&triangle.p2, &triangle.p3),
        (&triangle.p3, &triangle.p1),
    ];

    let y_start = min.y.floor() as usize;

    //store the min and max x positions for all of the lines for each y coord
    lines.iter().enumerate().for_each(|(index, (p1, p2))| {
        for point in dda(p1, p2, options) {
            let scanline_index = (point.y - y_start as f64).floor() as usize;
            let scanline = scanlines.get_mut(scanline_index).unwrap_or_else(|| {
                dbg!(&lines, num_scanlines, scanline_index, point);
                panic!("Scanline index out of bounds");
            });

            let x = point.x.floor() as usize;

            if let Some(entry) = scanline.get_mut(index).unwrap() {
                entry.min = entry.min.min(x);
                entry.max = entry.max.max(x);
            } else {
                scanline[index] = Some(LineEntry { min: x, max: x });
            }
        }
    });

    //now we can just iterate through the scanlines and determine what is outside boundary and what is inside
    scanlines
        .into_iter()
        .enumerate()
        .for_each(|(index, scanline)| {
            let mut lines = scanline
                .iter()
                .filter(|item| item.is_some())
                .map(|item| item.as_ref().unwrap())
                .collect::<Vec<_>>();

            lines.sort_by(|a, b| a.min.cmp(&b.min).then_with(|| a.max.cmp(&b.max)));

            lines.dedup_by(|a, b| (a.min >= b.min && a.max <= b.max));

            let y = y_start + index;

            match lines.len() {
                1 => {
                    let line = &lines[0];
                    callback(line.min, line.max, y, false);
                }
                2 => {
                    let line1 = &lines[0];
                    let line2 = &lines[1];

                    if line2.min <= (line1.max + 1) {
                        callback(line1.min, line2.max, y, false);
                    } else {
                        callback(line1.min, line1.max, y, false);
                        callback(line1.max + 1, line2.min - 1, y, true);
                        callback(line2.min, line2.max, y, false);
                    }
                }
                3 => {
                    let min = lines[0].min;
                    let max = lines[2].max;

                    callback(min, max, y, false);
                }
                0 => {}
                _ => {
                    panic!("Too many lines!")
                }
            }
        });
}
