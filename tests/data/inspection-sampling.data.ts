import type { SamplingData, SamplingType } from '../../pages/inspection-sampling.page';

export const SAMPLING_TYPES: readonly SamplingType[] = [
  'Fixed Sample',
  'Percentage sample',
  '100% Inspection',
];

export function generateImportSamplingData() {
  const suffix = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return {
    code: `AI${suffix}`,
    shortText: `Imported by automated test ${suffix}`,
    type: 'FIXED' as const,
    sampleSize: 5,
  };
}

export function generateSamplingData(): SamplingData {
  const so = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return {
    code: `AT${so}`,
    shortText: `Auto test ${so}`,
    type: 'Fixed Sample',
    sampleSize: '5',
    longText: 'Dữ liệu tạo bởi auto test',
  };
}
