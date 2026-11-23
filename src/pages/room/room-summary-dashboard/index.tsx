import { CSSProperties } from 'react';
import { Icon } from '@iconify/react';

import { RoomCoverPicker } from '@/components/room-cover-picker';
import { RoomIconColorPicker } from '@/components/room-icon-color-picker';
import { RoomIconPicker } from '@/components/room-icon-picker';
import { RoomIdentity } from '@/components/room-identity';
import { RoomKindPicker } from '@/components/room-kind-picker';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { notificationManager } from '@/components/shared/toast/utils';
import { ROOM_KIND_LABEL, RoomKind } from '@/constants/room-kind';
import { useRoomAccess } from '@/hooks/useRoomAccess';
import { canSwitchRoomKind, ROOM_KIND_SWITCH_BLOCKED_MESSAGE } from '@/lib/can-switch-room-kind';
import { getRoomMemberLimit } from '@/lib/get-room-member-limit';
import { resolveRoomCoverGradient } from '@/lib/resolve-room-cover-gradient';
import { resolveRoomIcon } from '@/lib/resolve-room-icon';
import { resolveRoomIconColor } from '@/lib/resolve-room-icon-color';
import { resolveRoomKind } from '@/lib/resolve-room-kind';
import { EditableRoomField } from '@/pages/room/editable-room-field';
import { MembersPanel } from '@/pages/room/members-panel';
import { useAppStore } from '@/store/appStore';
import { useRoomStore } from '@/store/roomStore';
import { RoomType } from '@/types/room';
import { UserWithRoleRoom } from '@/types/user';

import styles from './styles.module.css';

type Props = {
  room: RoomType;
  members: UserWithRoleRoom[];
};

export const RoomSummaryDashboard = ({ room, members }: Props) => {
  const { updateRoomMeta } = useRoomStore();
  const { canUpdateRoom } = useRoomAccess();
  const { closeTopBottomSheet } = useAppStore();
  const canEdit = canUpdateRoom();
  const kind = resolveRoomKind(room);
  const cover = resolveRoomCoverGradient(room);
  const icon = resolveRoomIcon(room);
  const iconColor = resolveRoomIconColor(room);
  const membersCount = Object.keys(room.members ?? {}).length;
  const memberLimit = getRoomMemberLimit(kind);
  const canSelectSingle = canSwitchRoomKind(kind, RoomKind.SINGLE_PERSON, membersCount);

  const handleSaveName = async (name: string) => {
    await updateRoomMeta({ name });
    notificationManager.add({ title: 'Сохранено', type: 'ok' }, { timeout: 1000 });
  };

  const handleSaveDescription = async (description: string) => {
    await updateRoomMeta({ description });
    notificationManager.add({ title: 'Сохранено', type: 'ok' }, { timeout: 1000 });
  };

  const handleKindChange = async (nextKind: RoomKind) => {
    if (nextKind === kind) {
      closeTopBottomSheet();
      return;
    }

    if (!canSelectSingle && nextKind === RoomKind.SINGLE_PERSON) {
      notificationManager.add(
        { title: ROOM_KIND_SWITCH_BLOCKED_MESSAGE, type: 'error' },
        { timeout: 2000 }
      );
      return;
    }

    await updateRoomMeta({ kind: nextKind });
    closeTopBottomSheet();
    notificationManager.add({ title: 'Тип комнаты обновлён', type: 'ok' }, { timeout: 1000 });
  };

  const handleCoverChange = async (coverGradientId: string) => {
    await updateRoomMeta({ coverGradientId });
    closeTopBottomSheet();
    notificationManager.add({ title: 'Обложка обновлена', type: 'ok' }, { timeout: 1000 });
  };

  const handleIconChange = async (iconId: string) => {
    await updateRoomMeta({ iconId });
    notificationManager.add({ title: 'Иконка обновлена', type: 'ok' }, { timeout: 1000 });
  };

  const handleIconColorChange = async (iconColorId: string) => {
    await updateRoomMeta({ iconColorId });
    notificationManager.add({ title: 'Цвет иконки обновлён', type: 'ok' }, { timeout: 1000 });
  };

  const coverNode = (
    <div className={styles.cover} style={{ '--cover-gradient': cover.css } as CSSProperties}>
      <span className={styles.coverShift} />
      <span className={styles.coverHint}>
        <Icon icon="solar:palette-bold" width={16} height={16} />
      </span>
    </div>
  );

  if (!canEdit) {
    return (
      <section className={styles.card}>
        <div className={styles.body}>
          <RoomIdentity
            className={room.description?.trim() ? undefined : styles.emptyDescriptionIdentity}
            room={room}
            title={
              <h1 className={styles.roomName} title={room.name}>
                {room.name}
              </h1>
            }
          />
          <MembersPanel members={members} />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <BottomSheet
        id="room-cover"
        classNameWrapperTrigger={styles.coverTrigger}
        triggerComponent={coverNode}
      >
        <h3 className={styles.sheetTitle}>Цвет обложки</h3>
        <RoomCoverPicker value={cover.id} onChange={handleCoverChange} showLabel={false} />
      </BottomSheet>

      <div className={styles.body}>
        <RoomIdentity
          room={room}
          renderIcon={(badge) => (
            <BottomSheet
              id="room-icon"
              classNameWrapperTrigger={styles.iconTrigger}
              triggerComponent={badge}
            >
              <h3 className={styles.sheetTitle}>Иконка</h3>
              <RoomIconPicker value={icon.id} onChange={handleIconChange} />
              <h3 className={styles.sheetSectionTitle}>Цвет иконки</h3>
              <RoomIconColorPicker
                value={iconColor.id}
                coverCss={cover.css}
                onChange={handleIconColorChange}
              />
            </BottomSheet>
          )}
          title={
            <EditableRoomField
              value={room.name}
              onSave={handleSaveName}
              canEdit={true}
              className={styles.roomName}
              ariaLabel="Название комнаты"
              minLength={3}
            />
          }
          description={
            <EditableRoomField
              value={room.description}
              onSave={handleSaveDescription}
              canEdit={true}
              className={styles.roomDescription}
              placeholder="Добавить описание"
              ariaLabel="Описание комнаты"
            />
          }
        />

        <div className={styles.metaRow}>
          <BottomSheet
            id="room-kind"
            classNameWrapperTrigger={styles.metaTrigger}
            triggerComponent={
              <div className={styles.metaChip}>
                <span className={styles.metaLabel}>Тип</span>
                <span className={styles.metaValue}>{ROOM_KIND_LABEL[kind]}</span>
              </div>
            }
          >
            <h3 className={styles.sheetTitle}>Тип комнаты</h3>
            <RoomKindPicker
              value={kind}
              onChange={handleKindChange}
              canSelectSingle={canSelectSingle}
              singleBlockedHint={ROOM_KIND_SWITCH_BLOCKED_MESSAGE}
              showLabel={false}
            />
          </BottomSheet>

          <MembersPanel
            members={members}
            classNameWrapperTrigger={styles.metaTrigger}
            triggerComponent={
              <div className={styles.metaChip}>
                <span className={styles.metaLabel}>Состав</span>
                <span className={styles.metaValue}>
                  {membersCount} / {memberLimit}
                </span>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
};
