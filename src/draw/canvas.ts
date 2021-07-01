export const getPixel = (imageData: ImageData, x: number, y: number) => {
    const sampleIndex = (imageData.width * Math.floor(y) + Math.floor(x)) * 4;
    return imageData.data.slice(sampleIndex, sampleIndex + 4);
};

export const setPixel = (imageData: ImageData, x: number, y: number, rgba: ArrayLike<number>) => {
    imageData.data.set(rgba, (Math.floor(y) * imageData.width + Math.floor(x)) * 4);
};
