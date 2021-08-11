export const subtract4Mutate = <T extends { [key: number]: number }>(a: T, b: ArrayLike<number>): T => {
    a[0] -= b[0];
    a[1] -= b[1];
    a[2] -= b[2];
    a[3] -= b[3];
    return a;
};
