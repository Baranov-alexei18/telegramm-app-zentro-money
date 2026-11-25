# Room role policy

This document describes the permissions the code implements today. There is no separate owner role. There is no ban, mute, or message deletion.

## What permissions depend on

The role is stored in `rooms/{roomId}.members[userId].role`.

There are two roles (`RoomUserRole`):

- `admin` — room administrator.
- `base_user` — member.

The room creator is stored as `admin`. A person accepted from a join request is stored as `base_user`. The current admin can instantly transfer their own admin role to one other participant and become `base_user` in the same write. There is no confirmation or acceptance step. Several `admin` values can stay on the document: a transfer changes only the caller and the chosen participant.

Checks go through `ROLE_ROOM_MATRIX` and `canInRoom`. In the room UI this is `useRoomAccess`. To edit room metadata, the store also calls `canInRoom(..., ROOM_UPDATE)`. There are no Firestore rules in the repository: the restriction is client-side.

Room kind (`kind`) is not a role. It changes the member limit and invitations:

- `shared_expenses` — up to 5 members; join requests and invites are available to the administrator.
- `single_person` — 1 member; inviting is not allowed. A shared room can be switched to personal only when it has one person.

An empty `kind` is treated as shared expenses.

## Administrator

In addition to everything a member can do:

- Sees join requests and accepts or rejects them. The request panel exists only for shared expenses.
- Copies the room id to invite someone, while the room is shared and the limit is not reached.
- Removes a `base_user` from the room. The control is inside the member menu opened from the three-dot button on that person's row. The menu is not shown on the admin's own row or next to another admin. This is removal from the roster, not a ban: coming back is not blocked by a separate rule.
- Changes the name, description, room kind, cover, icon, and icon color.
- Creates, edits, and deletes categories.
- Edits and deletes any transaction in the room, not only their own.
- Transfers their own admin role to one other participant whose role is `base_user` (`transferRoomAdmin`). The caller becomes `base_user`. The action is «Передать админа» in the same three-dot menu, next to «Удалить пользователя». The menu is hidden from non-admins, hidden on the caller's own row, and hidden next to anyone who is already `admin`. A room with one member has nobody to receive the role. Other admins on the document are left as they are. The target does not confirm, and no join notification is created. Chat access does not change.

## Member

- Creates transactions.
- Edits and deletes only their own transactions (`transaction.userId` matches their id).
- Reads the roster, transactions, and statistics.
- Writes in the room chat. Deleting someone else's or their own messages is not possible: that operation does not exist. An admin transfer does not add or remove chat access.
- Does not see requests, does not invite, does not remove people, does not edit the room or categories, and does not transfer the admin role.

If the user is not in `members` or the role is empty, `useRoomAccess` closes all of the actions listed above.

## What does not exist

There is no ban, mute, kick that blocks return, chat moderation, acceptance step for an admin transfer, way to appoint an extra administrator without giving up your own role, way to remove admin from someone else, or separate “owner” and “member” permissions beyond `admin` and `base_user`.
