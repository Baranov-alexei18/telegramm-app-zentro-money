import { CSSProperties, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

import Logo from '@/assets/images/logo.png';
import { CreateRoomForm } from '@/components/forms/create-room-form';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { LinkButton } from '@/components/shared/link-button';
import { LogoLoader } from '@/components/shared/logo-loader';
import { notificationManager } from '@/components/shared/toast/utils';
import { ROUTE_PATHS } from '@/constants/route-path';
import { getUserGreetingName } from '@/lib/get-user-greeting-name';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

import { GREETING_CHAR_VARIANTS, GREETING_CONTAINER_VARIANTS, HOME_STEPS } from './constants';
import { HomeRoomCard } from './home-room-card';
import { QuickTransactionPanel } from './quick-transaction-panel';

import styles from './styles.module.css';

let hasPlayedHomeGreeting = false;

const markHomeGreetingPlayed = (node: HTMLHeadingElement | null) => {
  if (node) {
    hasPlayedHomeGreeting = true;
  }
};

export const HomePage = () => {
  const { user } = useUserStore();
  const { userRooms, isUserRoomsLoading, hasLoadedUserRooms, loadedRoomsUserId, fetchUserRooms } =
    useRoomStore();
  const navigate = useNavigate();

  const greetingName = getUserGreetingName(user);
  const greetingPrefix = greetingName ? 'Привет, ' : 'Привет!';
  const greetingText = greetingName ? `${greetingPrefix}${greetingName}!` : greetingPrefix;

  const greetingChars = useMemo(
    () =>
      Array.from(greetingText).map((char, index) => ({
        id: `${index}-${char}`,
        index,
        char: char === ' ' ? '\u00A0' : char,
      })),
    [greetingText]
  );
  const shouldAnimateGreeting = useRef(!hasPlayedHomeGreeting).current;

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    if (hasLoadedUserRooms && loadedRoomsUserId === user.id) {
      return;
    }

    fetchUserRooms(user.id).catch(() => {
      notificationManager.add(
        { title: 'Не удалось загрузить комнаты', type: 'error' },
        { timeout: 1500 }
      );
    });
  }, [fetchUserRooms, hasLoadedUserRooms, loadedRoomsUserId, user?.id]);

  const isRoomsPending = Boolean(
    user && (isUserRoomsLoading || !hasLoadedUserRooms || loadedRoomsUserId !== user.id)
  );

  const handleToRoom = (id: string) => {
    navigate(`${ROUTE_PATHS.room}/${id}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerSection}>
        <img src={Logo} alt="Zentro" className={styles.logoWrapper} />

        {user && (
          <motion.h2
            ref={markHomeGreetingPlayed}
            key={greetingText}
            aria-label={greetingText}
            className={styles.greeting}
            variants={GREETING_CONTAINER_VARIANTS}
            initial={shouldAnimateGreeting ? 'hidden' : false}
            animate="visible"
          >
            {greetingChars.map((item) => (
              <motion.span
                key={item.id}
                aria-hidden="true"
                variants={GREETING_CHAR_VARIANTS}
                className={styles.greetingChar}
                style={{ '--char-index': item.index } as CSSProperties}
              >
                {item.char}
              </motion.span>
            ))}
          </motion.h2>
        )}

        <p className={styles.description}>
          Управляйте общими расходами, создавайте комнаты, приглашайте участников и отслеживайте
          совместный бюджет.
        </p>
      </div>

      {isRoomsPending ? (
        <div className={styles.loaderStage} aria-busy="true">
          <div className={styles.blurredLoaderWrapper}>
            <div className={styles.blurredQuickPanel}>
              <div className={styles.blurredHeaderRow}>
                <span className={styles.blurredTitlePill} />
                <span className={styles.blurredBadgePill} />
              </div>
              <div className={styles.blurredActionsGrid}>
                <div className={styles.blurredIncomeBtn} />
                <div className={styles.blurredExpenseBtn} />
              </div>
            </div>

            <div className={styles.blurredRoomsSection}>
              <div className={styles.blurredHeaderRow}>
                <span className={styles.blurredTitlePill} />
                <span className={styles.blurredSmallPill} />
              </div>
              <div className={styles.roomsGrid}>
                {[0, 1].map((item) => (
                  <div key={item} className={styles.blurredRoomCard}>
                    <div className={styles.blurredCardTop} />
                    <div className={styles.blurredCardTitle} />
                    <div className={styles.blurredCardSub} />
                    <div className={styles.blurredCardFooter} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.centerLogoOverlay}>
            <LogoLoader size={68} />
          </div>
        </div>
      ) : userRooms.length > 0 ? (
        <div className={styles.dashboardContent}>
          <QuickTransactionPanel rooms={userRooms} />

          <section>
            <div className={styles.roomsHeader}>
              <h3 className={styles.roomsSectionTitle}>Ваши комнаты</h3>
              <LinkButton href={ROUTE_PATHS.rooms} className={styles.allRoomsLink}>
                Все комнаты
              </LinkButton>
            </div>

            <div className={styles.roomsGrid}>
              {userRooms.map((room) => (
                <HomeRoomCard key={room.roomId} room={room} onOpen={handleToRoom} />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <>
          <section className={styles.emptyCard}>
            <p className={styles.emptyText}>
              У вас пока нет комнат. Создайте свою первую комнату или присоединитесь к существующей
              по ID.
            </p>
            <div className={styles.emptyActions}>
              <BottomSheet
                id="home-create-room"
                classNameWrapperTrigger={styles.ctaSheetTrigger}
                triggerComponent={<div className={styles.primaryCta}>Создать комнату</div>}
              >
                <CreateRoomForm />
              </BottomSheet>

              <LinkButton href={ROUTE_PATHS.rooms} className={styles.secondaryCta}>
                Войти по ID комнаты
              </LinkButton>
            </div>
          </section>

          <div className={styles.stepsGrid}>
            {HOME_STEPS.map((step) => (
              <div className={styles.stepCard} key={step.title}>
                <div className={styles.stepIcon}>
                  <Icon icon={step.icon} width={26} height={26} />
                </div>
                <div className={styles.stepTitle}>{step.title}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
