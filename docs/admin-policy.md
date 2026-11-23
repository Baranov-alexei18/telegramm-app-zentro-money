# Room role policy

This document describes the permissions the code implements today. There is no separate owner role. There is no ban, mute, or message deletion.

## What permissions depend on

The role is stored in `rooms/{roomId}.members[userId].role`.

There are two roles (`RoomUserRole`):

- `admin` — room administrator.
- `base_user` — member.

The room creator is stored as `admin`. A person accepted from a join request is stored as `base_user`. The role cannot be changed in the UI: there is no way to appoint or remove an administrator. Several `admin` values are possible only if that role is already stored on the document.

Checks go through `ROLE_ROOM_MATRIX` and `canInRoom`. In the room UI this is `useRoomAccess`. To edit room metadata, the store also calls `canInRoom(..., ROOM_UPDATE)`. There are no Firestore rules in the repository: the restriction is client-side.

Room kind (`kind`) is not a role. It changes the member limit and invitations:

- `shared_expenses` — up to 5 members; join requests and invites are available to the administrator.
- `single_person` — 1 member; inviting is not allowed. A shared room can be switched to personal only when it has one person.

An empty `kind` is treated as shared expenses.

## Administrator

In addition to everything a member can do:

- Sees join requests and accepts or rejects them. The request panel exists only for shared expenses.
- Copies the room id to invite someone, while the room is shared and the limit is not reached.
- Removes another member from the room. This button cannot remove themselves. This is removal from the roster, not a ban: coming back is not blocked by a separate rule.
- Changes the name, description, room kind, cover, icon, and icon color.
- Creates, edits, and deletes categories.
- Edits and deletes any transaction in the room, not only their own.

## Member

- Creates transactions.
- Edits and deletes only their own transactions (`transaction.userId` matches their id).
- Reads the roster, transactions, and statistics.
- Writes in the room chat. Deleting someone else's or their own messages is not possible: that operation does not exist.
- Does not see requests, does not invite, does not remove people, and does not edit the room or categories.

If the user is not in `members` or the role is empty, `useRoomAccess` closes all of the actions listed above.

## What does not exist

There is no ban, mute, kick that blocks return, chat moderation, transfer of the administrator role, or separate “owner” and “member” permissions beyond `admin` and `base_user`.
