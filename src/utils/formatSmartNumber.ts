export const formatSmartNumber = (value: number | string): string => {
  const num = Number(value);

  if (isNaN(num)) return '';

  const fixed = num.toFixed(2);

  return fixed.replace(/\.?0+$/, '');
};
