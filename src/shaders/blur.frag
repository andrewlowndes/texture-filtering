#version 300 es
precision highp float;
precision highp usampler2D;

uniform float u_bluramount;
uniform sampler2D u_texture;
uniform usampler2D u_summedtexture;

out vec4 outColor;

vec4 getSummedArea(const in ivec2 minCoord, const in ivec2 maxCoord) {
    return vec4(texelFetch(u_summedtexture, maxCoord, 0) - 
        texelFetch(u_summedtexture, ivec2(minCoord.x, maxCoord.y), 0) + 
        texelFetch(u_summedtexture, minCoord, 0) -
        texelFetch(u_summedtexture, ivec2(maxCoord.x, minCoord.y), 0));
}

vec4 getPixel(const in ivec2 pos) {
    return texelFetch(u_texture, pos, 0) * 255.0;
}

//results in up to 24 texture lookups based on complexity of range, whatever size the image is
vec4 averageSummed(const in vec2 minCoord, const in vec2 maxCoord) {
    ivec2 startCell = ivec2(floor(minCoord));
    ivec2 endCell = ivec2(floor(maxCoord));

    //range contained in one pixel
    if (startCell == endCell) {
        return texelFetch(u_texture, ivec2(startCell), 0);
    }
    
    vec2 size = maxCoord - minCoord;
    float pixelArea = size.x * size.y;
    float colourNormaliser = 1.0 / pixelArea;
    
    ivec2 innerCell = ivec2(ceil(minCoord));
    ivec2 innerCell2 = ivec2(floor(maxCoord));

    vec2 minDiff = vec2(innerCell) - minCoord;
    vec2 maxDiff = maxCoord - vec2(innerCell2);

    vec4 colour = vec4(0.0);

    //TODO: optimise by removing branches
    
    //single horizontal strip
    if (startCell.x == endCell.x) {
        if (minDiff.y > 0.0) {
            colour += getPixel(startCell) * size.x * minDiff.y;
        }

        if (maxDiff.y > 0.0) {
            colour += getPixel(endCell) * size.x * maxDiff.y;
        }

        colour += getSummedArea(ivec2(startCell.x, innerCell.y)-1, ivec2(startCell.x, innerCell2.y-1)) * size.x;
        return floor(colour * colourNormaliser);
    }
    
    //single vertical strip
    if (startCell.y == endCell.y) {
        if (minDiff.x > 0.0) {
            colour += getPixel(startCell) * size.y * minDiff.x;
        }

        if (maxDiff.x > 0.0) {
            colour += getPixel(endCell) * size.y * maxDiff.x;
        }

        colour += getSummedArea(ivec2(innerCell.x, startCell.y)-1, ivec2(innerCell2.x-1, startCell.y)) * size.y;
        return floor(colour * colourNormaliser);
    }

    //corner cells
    if (minDiff.y > 0.0) {
        if (minDiff.x > 0.0) {
            colour += getPixel(startCell) * minDiff.x * minDiff.y;
        }

        if (maxDiff.x > 0.0) {
            colour += getPixel(ivec2(endCell.x, startCell.y)) * maxDiff.x * minDiff.y;
        }
    }

    if (maxDiff.y > 0.0) {
        if (minDiff.x > 0.0) {
            colour += getPixel(ivec2(startCell.x, endCell.y)) * minDiff.x * maxDiff.y;
        }

        if (maxDiff.x > 0.0) {
            colour += getPixel(endCell) * maxDiff.x * maxDiff.y;
        }
    }

    //fractional strips
    if (minDiff.y > 0.0) {
        colour += getSummedArea(ivec2(innerCell.x, startCell.y)-1, ivec2(innerCell2.x-1, startCell.y)) * minDiff.y;
    }

    if (minDiff.x > 0.0) {
        colour += getSummedArea(ivec2(startCell.x, innerCell.y)-1, ivec2(startCell.x, innerCell2.y-1)) * minDiff.x;
    }

    if (maxDiff.y > 0.0) {
        colour += getSummedArea(ivec2(innerCell.x, endCell.y)-1, ivec2(innerCell2.x-1, endCell.y)) * maxDiff.y;
    }

    if (maxDiff.x > 0.0) {
        colour += getSummedArea(ivec2(endCell.x, innerCell.y)-1, ivec2(endCell.x, innerCell2.y-1)) * maxDiff.x;
    }

    //inner parts
    colour += getSummedArea(ivec2(innerCell)-1, ivec2(innerCell2)-1);
    
    //now we have an accumulative pixel value that covers the whole area so just average it
    return floor(colour * colourNormaliser);
}

void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec2 tex_size = vec2(textureSize(u_summedtexture, 0));

    vec2 minCoord = clamp(vec2(fragCoord) - u_bluramount, vec2(0.0), tex_size);
    vec2 maxCoord = clamp(vec2(fragCoord) + u_bluramount, vec2(0.0), tex_size);

    vec4 pixelColour = averageSummed(minCoord, maxCoord);

    /*
    //simple test - show the original image pixel using the summed texture (requires 4 lookups - that is why we upload both to the gpu)
    vec4 pixelColour = vec4(
        texelFetch(u_summedtexture, fragCoord, 0) - 
        texelFetch(u_summedtexture, ivec2(fragCoord.x - 1, fragCoord.y), 0) + 
        texelFetch(u_summedtexture, fragCoord - 1, 0) -
        texelFetch(u_summedtexture, ivec2(fragCoord.x, fragCoord.y - 1), 0)
    );
    */

    outColor = pixelColour / 255.0;
}
