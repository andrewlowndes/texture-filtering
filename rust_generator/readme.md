# Triangle coverage map generator - Rust
A port of the generator logic to produce a triangle coverage map for an image.

## Install
Ensure Rust is installed. Enable nightly version via `rustup default nightly`.

## Running
Checkout the repository and change to this directory (`cd rust_generator`), then run the examples via:

- Triangle map example: `cargo run --release --example=triangle_map`
- Coverage example: `cargo run --release --example=coverage`
- Traverse example: `cargo run --release --example=traverse`
- Rasterise example: `cargo run --release --example=rasterise`
- Antialias example: `cargo run --release --example=antialias`

Generate a map directly from a given image and store as a png back to the filesystem via:

`cargo run --release --bin generate [source_img] [resolution] [output_img]`

Example:

`cargo run --release --bin generate ../dist/media/photo.png 2 ../dist/media/cache/photo_2.png`

## Performance comparison
The web-based version is currently single-threaded and the Rust version creates threads for every sample in the generated image. Timing based on running in Windows 10 on a Ryzen 7 2700X witih 32GB DDR4 RAM running at 1200MHz. 

| Resolution | Web-based (Chrome 91 64-bit) | Rust (rustc 1.55.0-nightly) | Map size |
--- | --- | --- | ---
| 2 | 1s  | <1s | 8 x 8 |
| 3 | 7s  | <1s | 27 x 27 |
| 4 | 34s | <1s | 64 x 64 |
| 5 | 123s | ~2s | 125 x 125 |
| 6 | - | ~4s | 216 x 216 |
| 7 | - | ~10s | 343 x 343 |
| 8 | - | ~20s | 512 x 512 |
| 9 | - | ~40s | 729 x 729 |
| 10 | - | ~100s | 1000 x 1000 |
| 11 | - | ~192s | 1331 x 1331 |
| 12 | - | ~345s | 1729 x 1728 |

The performance of the Rust app is not quick enough for large resolutions (target of 16), need to opt for a GPU-based solution.
