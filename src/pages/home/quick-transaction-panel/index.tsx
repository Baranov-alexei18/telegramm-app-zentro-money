import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import cn from 'classnames';

import { TransactionForm } from '@/components/forms/transaction-form';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Select } from '@/components/shared/select';
import { notificationManager } from '@/components/shared/toast/utils';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { RoomType } from '@/types/room';
import { TransactionFormValues } from '@/types/transaction';

import styles from './styles.module.css';

type Props = {
  rooms: RoomType[];
};

type SheetBodyProps = {
  activeRoom: RoomType;
  roomOptions: { label: string; value: string }[];
  type: TRANSACTION_TYPE;
  onSelectRoom: (roomId: string) => void;
  onSubmit: (data: TransactionFormValues, type: TRANSACTION_TYPE) => Promise<void>;
};

const QuickTransactionSheetBody = ({
  activeRoom,
  roomOptions,
  type,
  onSelectRoom,
  onSubmit,
}: SheetBodyProps) => {
  const { room, setRoom } = useRoomStore();

  useEffect(() => {
    if (room?.roomId !== activeRoom.roomId) {
      setRoom(activeRoom);
    }
  }, [activeRoom, room?.roomId, setRoom]);

  const syncedRoom = room?.roomId === activeRoom.roomId ? room : activeRoom;
  const categories = useMemo(
    () => syncedRoom.categories?.filter((cat) => cat.type === type) ?? [],
    [syncedRoom.categories, type]
  );

  return (
    <div className={styles.sheetBody}>
      <div className={styles.sheetHeader}>
        <h3 className={styles.sheetTitle}>
          {type === TRANSACTION_TYPE.EXPENSE ? 'Новый расход' : 'Новый доход'}
        </h3>
        {roomOptions.length > 1 ? (
          <Select
            ariaLabel="Выбор комнаты"
            options={roomOptions}
            value={activeRoom.roomId}
            onChange={onSelectRoom}
            className={styles.roomSelect}
          />
        ) : (
          <span className={styles.singleRoomBadge}>{activeRoom.name}</span>
        )}
      </div>

      <TransactionForm
        key={`${activeRoom.roomId}-${type}`}
        type={type}
        categories={categories}
        onSubmit={(data) => onSubmit(data, type)}
      />
    </div>
  );
};

export const QuickTransactionPanel = ({ rooms }: Props) => {
  const { user } = useUserStore();
  const { room, setRoom, addTransaction } = useRoomStore();

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    () =>
      (room && rooms.some((item) => item.roomId === room.roomId)
        ? room.roomId
        : rooms[0]?.roomId) || ''
  );

  useEffect(() => {
    if (!rooms.length) return;

    const exists = rooms.some((item) => item.roomId === selectedRoomId);
    if (!exists) {
      setSelectedRoomId(rooms[0].roomId);
    }
  }, [rooms, selectedRoomId]);

  const activeRoom = useMemo(
    () => rooms.find((item) => item.roomId === selectedRoomId) ?? rooms[0],
    [rooms, selectedRoomId]
  );

  const roomOptions = useMemo(
    () => rooms.map((item) => ({ label: item.name, value: item.roomId })),
    [rooms]
  );

  const handleSelectRoom = (nextRoomId: string) => {
    setSelectedRoomId(nextRoomId);
    const nextRoom = rooms.find((item) => item.roomId === nextRoomId);
    if (nextRoom) {
      setRoom(nextRoom);
    }
  };

  const handleTransactionSubmit = async (data: TransactionFormValues, type: TRANSACTION_TYPE) => {
    if (!user || !activeRoom) return;

    try {
      await addTransaction(activeRoom.roomId, {
        userId: user.id,
        roomId: activeRoom.roomId,
        type,
        ...data,
      });

      notificationManager.add(
        {
          title: type === TRANSACTION_TYPE.INCOME ? 'Доход добавлен' : 'Расход добавлен',
          type: 'ok',
        },
        { timeout: 1500 }
      );
    } catch {
      notificationManager.add(
        { title: 'Не удалось сохранить транзакцию', type: 'error' },
        { timeout: 1500 }
      );
    }
  };

  if (!activeRoom) {
    return null;
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Быстрая запись</span>
        {roomOptions.length > 1 ? (
          <Select
            ariaLabel="Выбор комнаты"
            options={roomOptions}
            value={activeRoom.roomId}
            onChange={handleSelectRoom}
            className={styles.roomSelect}
          />
        ) : (
          <span className={styles.singleRoomBadge}>{activeRoom.name}</span>
        )}
      </div>

      <div className={styles.actionsGrid}>
        <BottomSheet
          id="home-quick-income"
          classNameWrapperTrigger={styles.sheetTrigger}
          triggerComponent={
            <div className={cn(styles.actionCard, styles.incomeAction)}>
              <Icon icon="mingcute:arrow-down-circle-fill" width={22} height={22} />
              <span>Доход</span>
            </div>
          }
        >
          <QuickTransactionSheetBody
            activeRoom={activeRoom}
            roomOptions={roomOptions}
            type={TRANSACTION_TYPE.INCOME}
            onSelectRoom={handleSelectRoom}
            onSubmit={handleTransactionSubmit}
          />
        </BottomSheet>

        <BottomSheet
          id="home-quick-expense"
          classNameWrapperTrigger={styles.sheetTrigger}
          triggerComponent={
            <div className={cn(styles.actionCard, styles.expenseAction)}>
              <Icon icon="mingcute:arrow-up-circle-fill" width={22} height={22} />
              <span>Расход</span>
            </div>
          }
        >
          <QuickTransactionSheetBody
            activeRoom={activeRoom}
            roomOptions={roomOptions}
            type={TRANSACTION_TYPE.EXPENSE}
            onSelectRoom={handleSelectRoom}
            onSubmit={handleTransactionSubmit}
          />
        </BottomSheet>
      </div>
    </section>
  );
};
