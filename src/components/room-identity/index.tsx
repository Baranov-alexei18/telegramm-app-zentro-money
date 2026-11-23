import { CSSProperties, ReactNode } from 'react';
import { Icon } from '@iconify/react';
import cn from 'classnames';

import { resolveRoomIcon } from '@/lib/resolve-room-icon';
import { resolveRoomIconColor } from '@/lib/resolve-room-icon-color';
import { RoomType } from '@/types/room';

import styles from './styles.module.css';

type Props = {
  room: Pick<RoomType, 'roomId' | 'iconId' | 'iconColorId' | 'coverGradientId'>;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  renderIcon?: (icon: ReactNode) => ReactNode;
};

export const RoomIdentity = ({ room, title, description, className, renderIcon }: Props) => {
  const icon = resolveRoomIcon(room);
  const iconColor = resolveRoomIconColor(room);
  const badge = (
    <span
      className={cn(styles.iconBadge, { [styles.iconBadgeEditable]: Boolean(renderIcon) })}
      style={{ '--icon-color': iconColor.css } as CSSProperties}
      aria-hidden={true}
    >
      <Icon icon={icon.iconifyId} width={22} height={22} />
    </span>
  );

  return (
    <div className={cn(styles.identity, className)}>
      <div className={styles.iconSlot}>{renderIcon ? renderIcon(badge) : badge}</div>
      <div className={styles.text}>
        <div className={styles.title}>{title}</div>
        {description ? <div className={styles.description}>{description}</div> : null}
      </div>
    </div>
  );
};
