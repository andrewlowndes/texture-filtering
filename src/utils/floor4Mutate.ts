export const floor4Mutate = <T extends {[key: number]: number }>(a: T): T => {
    a[0] = Math.floor(a[0]);
    a[1] = Math.floor(a[1]);
    a[2] = Math.floor(a[2]);
    a[3] = Math.floor(a[3]);
    return a;
};
