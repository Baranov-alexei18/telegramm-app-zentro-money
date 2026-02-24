import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import Logo from '@/assets/images/logo.png';
import { OfflineBanner } from '@/components/offline-banner';
import { ROUTE_PATHS } from '@/constants/route-path';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { useUserStore } from '@/store/userStore';
import { RoomType } from '@/types/room';

import styles from './styles.module.css';

const steps = [
  { icon: '🏠', title: 'Создайте комнату' },
  { icon: '👥', title: 'Пригласите участников' },
  { icon: '💳', title: 'Ведите общий бюджет' },
  { icon: '📊', title: 'Анализируйте статистику' },
];

export const HomePage = () => {
  const { user } = useUserStore();

  const [rooms, setRooms] = useState<RoomType[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const getRoomsData = async () => {
      if (!user) {
        return;
      }
      try {
        const data = await getUserRooms(user?.id);

        setRooms(data);
      } catch (e) {
        console.error(e);
      }
    };

    getRoomsData();
  }, [user]);

  const handleToRoom = (id: string) => {
    navigate(`${ROUTE_PATHS.room}/${id}`);
  };

  return (
    <div className={styles.wrapper}>
      <OfflineBanner />
      <div className={styles.headerSection}>
        <img src={Logo} alt="Logo" className={styles.logoWrapper} />
        <p className={styles.description}>
          Управляйте общими расходами, создавайте комнаты, приглашайте участников и отслеживайте
          совместный бюджет.
        </p>
      </div>

      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <div className={styles.stepCard} key={step.title}>
            <div className={styles.stepIcon}>{step.icon}</div>
            <div className={styles.stepTitle}>{step.title}</div>
          </div>
        ))}
      </div>

      {rooms?.length > 0 && (
        <div>
          <h3 className={styles.roomsCarouselTitle}>Ваши комнаты</h3>

          <div className={styles.roomsCarousel}>
            {rooms.map((room) => (
              <div
                key={room.roomId}
                className={styles.roomCard}
                onClick={() => handleToRoom(room.roomId)}
              >
                <div className={styles.roomName}>{room.name}</div>
                <div className={styles.roomMeta}>
                  {Object.keys(room.members || {}).length} участника
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
