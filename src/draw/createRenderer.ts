
export const createRenderer = (renderFunc: () => void, afterRenderFunc?: () => void) => {
    let drawing = false;

    return () => {
        if (!drawing) {
            drawing = true;
            requestAnimationFrame(() => {
                renderFunc();
                drawing = false;
                afterRenderFunc?.();
            });
        }
    }
};
