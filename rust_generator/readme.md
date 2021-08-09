# Triangle coverage map generator - Rust
A port of the generator logic to produce a triangle coverage map for an image. 

**Note: it is far quicker to use the WebGL version, this is left here for reference.**


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
