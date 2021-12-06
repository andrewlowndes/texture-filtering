# Texture filtering using triangle summed area maps
A new technique for approximating the averaged texels for a polygon over a surface.

## Demos
Visit https://andrewlowndes.github.io/texture-filtering/dist/ to see a set of demos showing the various techniques used in this repo.

## Run
1. Ensure NodeJS installed
2. Run `npm i` to install dependencies
3. Run `npm start` to open the demos in a web app

## Roadmap
- [x] Summed area tables
  - [x] Image lookup (CPU)
  - [x] Fast blur (CPU)
  - [x] Fast blur (GPU)
- [x] Triangle coverage
  - [x] Exact triangle coverage (CPU)
  - [x] Generator
    - [x] CPU - JS (Slow)
    - [x] CPU - Rust (Still slow for high resolutions)
    - [x] GPU - WebGL (Fast)
  - [x] Approximated triangle fitting (CPU)
- [x] Triangle summed area tables
  - [x] Generator - WebGL
  - [x] Approximated triangle fitting (CPU)
  - [ ] Mipmap 3D comparison

## How it works - Triangle summed area maps
1. A grid is overlaid onto a texture at a specified resolution
2. Every combination for each vertex for a line is specified for each coordinate on the grid
3. A triangle is formed from each line with the coordinate at (0, 0)
4. The accumulative area under each triangle is calculated
    1. The triangle is rasterised
    2. The colour of pixel fully covered within the triangle is added
    3. The boundary pixels are intersected with the triangle and the colour of the pixel is divided by the area of the new shape
    4. The accumulated colour is divided by the area of the triangle
4. Each triangle colour is store in a texture coordinate

Looking up a triangles averaged colour:
1. A polygon on the texture surface in 2D is broken down into it's lines
2. The line is looked up in the triangle summed area map to give the area for the line
3. Each line area is added or subtracted based on the direction of the line
4. The total area is then divided by the area of the triangle to give the average colour over the triangle

## Usages
- Render textures in 3D space, where a multiple texels covers a pixel - alternative to mipmapping/anisotropic filtering.

## Future development
1. Generalise to work with vector graphics
2. Global illumination

## Development
Install VS Code and the following extensions:
- EditorConfig for VS Code
- ESLint
- Prettier
