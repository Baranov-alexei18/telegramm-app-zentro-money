export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameWeek = (a: Date, b: Date) => {
  const day = (b.getUTCDay() + 6) % 7;

  const startOfWeek = new Date(
    Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate() - day, 0, 0, 0, 0)
  );

  const endOfWeek = new Date(
    Date.UTC(
      startOfWeek.getUTCFullYear(),
      startOfWeek.getUTCMonth(),
      startOfWeek.getUTCDate() + 6,
      23,
      59,
      59,
      999
    )
  );

  return a >= startOfWeek && a <= endOfWeek;
};

export const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
