import { CategoryType } from '@/types/category';

export const prepareVictoryData = (
  labels: string[],
  grouped: Record<string, Record<string, number>>,
  categories: CategoryType[]
) => {
  const categoryIds = categories.map((c) => ({ categoryId: c.id, color: c.color }));

  return categoryIds.map((category) => {
    return labels.map((label) => ({
      x: label,
      y: grouped[label][category.categoryId] ?? 0,
      color: category.color,
    }));
  });
};
