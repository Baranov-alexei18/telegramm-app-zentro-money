import cn from 'classnames';

import { Button } from '@/components/shared/button';
import { ROOM_COVER_GRADIENTS } from '@/constants/room-cover-gradients';

import styles from './styles.module.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showLabel?: boolean;
};

export const RoomCoverPicker = ({ value, onChange, disabled = false, showLabel = true }: Props) => {
  return (
    <div className={styles.wrapper} role="radiogroup" aria-label="Цвет обложки">
      {showLabel && <span className={styles.label}>Цвет обложки</span>}
      <div className={styles.grid}>
        {ROOM_COVER_GRADIENTS.map((gradient) => {
          const isSelected = value === gradient.id;

          return (
            <Button
              key={gradient.id}
              className={cn(styles.swatch, { [styles.swatchSelected]: isSelected })}
              onClick={() => onChange(gradient.id)}
              isDisabled={disabled}
              aria-label={gradient.label}
              aria-pressed={isSelected ? true : false}
              style={{ backgroundImage: gradient.css }}
            >
              <span className={styles.srOnly}>{gradient.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
