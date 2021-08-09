# Texture filtering using pre-computed triangle coverage maps
A new technique for approximating the averaged texels for a polygon over a surface.

## Process
Creating a triangle coverage map
1. A low-res grid is created for the texture
2. A triangle is created for each possible position on the grid
3. Each triangle's coverage is computed
   1. The triangle is rasterised over the texels
   2. The colour of pixel fully covered within the triangle is added
   3. The boundary pixels are intersected with the triangle and the colour of the pixel is divided by the area of the new shape
   4. The accumulated colour is divided by the area of the triangle
4. Each triangle colour is store in a texture coordinate

Looking up a triangles averaged colour
1. The triangle coords are projected into texel space
2. The texels coords are rounded to the nearest grid coordinate
3. The pre-computed coverage is looked up and used

## Demos
Visit https://andrewlowndes.github.io/texture-filtering/dist/ to see a set of demos showing the various techniques used in this repo.

## Run
1. Ensure NodeJS installed
2. Run `npm i` to install dependencies
3. Run `npm start` to open the demos in a web app

## Roadmap
- [x] CPU Demo (Canvas)
  - [x] Summed area tables
  - [x] Fast blur (using summed area tables)
  - [x] Exact triangle coverage
  - [x] Approximated triangle fitting
- [x] Generator
  - [x] CPU (Slow)
  - [x] CPU - Rust (Still slow for high resolutions)
  - [x] GPU - WebGL (Fast)
- [ ] WebGL
  - [x] Fast blur
  - [ ] Approximated triangle fitting in 3D

## Usages
- Render textures in 3D space, where a multiple texels covers a pixel - alternative to mipmapping/anisotropic filtering.

## Generator
Read the [readme for the fast Rust generator](rust_generator/) to create cached triangle maps from custom textures.

### Performance comparison
The web-based version is currently single-threaded and the Rust version creates threads for every sample in the generated image. Timing based on running in Windows 10 on a Ryzen 7 2700X with 32GB DDR4 1200MHz RAM and Geforce RTX 2080 Super GPU.

| Resolution | JS (Chrome 91 64-bit) | Rust (rustc 1.55.0-nightly) | WebGL2 (Chrome 91 64-bit) | Map size |
--- | --- | --- | --- | ---
| 2 | 1s  | <1s | <1s | 8 x 8 |
| 3 | 7s  | <1s | <1s | 27 x 27 |
| 4 | 34s | <1s | <1s | 64 x 64 |
| 5 | 123s | ~2s | <1s | 125 x 125 |
| 6 | - | ~4s | <1s | 216 x 216 |
| 7 | - | ~10s | <1s | 343 x 343 |
| 8 | - | ~20s | <1s | 512 x 512 |
| 9 | - | ~40s | <1s | 729 x 729 |
| 10 | - | ~100s | <1s | 1000 x 1000 |
| 11 | - | ~192s | <1s | 1331 x 1331 |
| 12 | - | ~345s | <1s | 1728 x 1728 |
| 13 | - | - | ~2s | 2197 x 2197 |
| 14 | - | - | ~3s | 2744 x 2744 |
| 15 | - | - | ~4s | 3375 x 3375 |
| 16 | - | - | ~5s | 4096 x 4096 |

The WebGL2 GPU version far exceeds performance and scalability than all other CPU-based solutions

## Future development
1. Simplify the map generation and lookup
 - remove degenerate triangles
 - remove back-facing triangles

2. Create a solution for approximating the rendering equation for realistic lighting.
Method:
 - project the pixel area onto surfaces instead of using rays
 - use the triangle fitting algorithm to accelerate the gather of the coverage for textures
