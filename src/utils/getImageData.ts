export const getImageData = (image: HTMLImageElement) => {
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = image.width;
    imageCanvas.height = image.height;

    const imageGraphics = imageCanvas.getContext('2d');

    if (!imageGraphics) {
        throw new Error('Could not create canvas to extract image data');
    }

    imageGraphics.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    imageGraphics.drawImage(image, 0, 0);

    return imageGraphics.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
};
