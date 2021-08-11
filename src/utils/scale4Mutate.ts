export const scale4Mutate = <T extends { [key: number]: number }>(a: T, mag: number): T => {
    a[0] *= mag;
    a[1] *= mag;
    a[2] *= mag;
    a[3] *= mag;
    return a;
};
