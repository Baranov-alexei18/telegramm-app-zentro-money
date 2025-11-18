import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { PlayStoreIcon } from '@/components/icons/play-store-icon';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { COLLECTION_ROOM, SUB_COLLECTION_MESSAGES } from '@/constants/db';
import { db } from '@/services/firebase/config';
import { createMessageChat } from '@/services/firebase/createMessageChat';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { getUsername } from '@/utils/getUsername';

import styles from './styles.module.css';

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: Timestamp;
};

export const ChatPanel = () => {
  const { user } = useUserStore();
  const { room } = useRoomStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!room) return;

    const q = query(
      collection(db, COLLECTION_ROOM, room.roomId, SUB_COLLECTION_MESSAGES),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [room?.roomId]);

  const sendMessage = async () => {
    if (!text.trim() || !room || !user) return;

    await createMessageChat(user, room.roomId, text);

    setText('');
  };

  const formatTime = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className={styles.panel}>
      <BottomSheet
        id="room-chat"
        triggerComponent={<div className={styles.chatTrigger}>💬 Открыть чат</div>}
      >
        <div className={styles.chatPanel}>
          <h3 className={styles.title}>Чат комнаты</h3>

          <div className={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${msg.senderId === user?.id ? styles.myMessage : ''}`}
              >
                <div className={styles.messageHeader}>
                  <p
                    className={styles.sender}
                  >{`${msg.senderName},  ${formatTime(msg.createdAt)}`}</p>
                </div>
                <p className={styles.text}>{msg.text}</p>
              </div>
            ))}
          </div>

          <div className={styles.inputWrapper}>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Введите сообщение..."
              className={styles.input}
            />
            <Button onClick={sendMessage} className={styles.sendButton}>
              <PlayStoreIcon />
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
