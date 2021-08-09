export interface ShaderParameter {
    qualifier: 'in' | 'out' | 'inout';
    type: string;
    name: string;
}
