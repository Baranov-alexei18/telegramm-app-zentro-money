export const filterMembersByRoom = <T extends { id: string }>(
  members: T[],
  roomMembers: Record<string, unknown>
): T[] => {
  const memberIds = new Set(Object.keys(roomMembers));
  return members.filter((m) => memberIds.has(m.id));
};
