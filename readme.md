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

## Generator
Read the [readme for the fast Rust generator](rust_generator/) to create cached triangle maps from custom textures.

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
- [ ] Generator
  - [x] CPU (Slow)
  - [x] CPU - Rust (Still slow for resolutions over 10)
  - [ ] WebGL
- [ ] WebGL
  - [ ] Fast blur
  - [ ] Approximated triangle fitting in 3D

## Usages
- Render textures in 3D space, where a multiple texels covers a pixel - alternative to mipmapping/anisotropic filtering.

## Future development
1. Simplify the map generation and lookup
 - remove degenerate triangles
 - remove back-facing triangles

2. Create a solution for approximating the rendering equation for realistic lighting.
Method:
 - project the pixel area onto surfaces instead of using rays
 - use the triangle fitting algorithm to accelerate the gather of the coverage for textures
