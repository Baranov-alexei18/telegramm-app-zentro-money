export type PluralFormsType = [string, string, string];

export const pluralizeRu = (count: number, [one, few, many]: PluralFormsType): string => {
  const absCount = Math.abs(Math.trunc(count));
  const mod100 = absCount % 100;
  const mod10 = absCount % 10;

  if (mod100 >= 11 && mod100 <= 19) {
    return many;
  }

  if (mod10 === 1) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return few;
  }

  return many;
};
