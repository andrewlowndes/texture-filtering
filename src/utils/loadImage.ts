export const loadImage = async (src: string): Promise<HTMLImageElement> => {
    const img = new Image();

    return new Promise((resolve, reject) => {
        img.onload = () => {
            resolve(img);
        };

        img.onerror = (err) => {
            reject(err);
        };

        img.src = src;
    });
};
