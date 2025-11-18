export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameWeek = (a: Date, b: Date) => {
  const startOfWeek = new Date(b);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(b.getDate() - b.getDay() + 1);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return a >= startOfWeek && a <= endOfWeek;
};

export const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
