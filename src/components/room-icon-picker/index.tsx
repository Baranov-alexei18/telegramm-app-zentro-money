import { Icon } from '@iconify/react';
import cn from 'classnames';

import { Button } from '@/components/shared/button';
import { ROOM_ICONS } from '@/constants/room-icons';

import styles from './styles.module.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const RoomIconPicker = ({ value, onChange, disabled = false }: Props) => {
  return (
    <div className={styles.wrapper} role="radiogroup" aria-label="Иконка комнаты">
      <div className={styles.grid}>
        {ROOM_ICONS.map((icon) => {
          const isSelected = value === icon.id;

          return (
            <Button
              key={icon.id}
              className={cn(styles.option, { [styles.optionSelected]: isSelected })}
              onClick={() => onChange(icon.id)}
              isDisabled={disabled}
              aria-label={icon.label}
              aria-pressed={isSelected ? true : false}
            >
              <Icon icon={icon.iconifyId} width={22} height={22} />
            </Button>
          );
        })}
      </div>
    </div>
  );
};
