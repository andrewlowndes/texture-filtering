export const makeLogScale = (from: number, to: number) => {
    const min = from ? Math.log(from) : 0;
    const max = Math.log(to);
    const scale = max - min;

    return {
        fromLinear: (value: number) => Math.exp(min + scale * value),
        toLinear: (logValue: number) => (Math.log(logValue) - min) / scale
    };
};
