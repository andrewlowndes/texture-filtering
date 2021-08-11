import type { ShaderCode } from '../../interfaces/ShaderCode';

export const sort: ShaderCode = {
    text: /* glsl */ `
        vec4 sort(vec4 nums) {
            float a = min(nums.x, nums.y);
            float b = max(nums.x, nums.y);
            float c = min(nums.z, nums.w);
            float d = max(nums.z, nums.w);
            float e = min(b, c);
            float f = max(b, c);
            float h = max(a, e);
            float i = min(f, d);

            return vec4(min(a, e), min(h, i), max(h, i), max(f, d));
        }
    `
};
