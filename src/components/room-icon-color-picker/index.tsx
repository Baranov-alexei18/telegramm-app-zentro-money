import { Icon } from '@iconify/react';
import cn from 'classnames';

import { Button } from '@/components/shared/button';
import { ROOM_COVER_GRADIENTS } from '@/constants/room-cover-gradients';
import { ROOM_ICON_COLOR_MATCH_COVER } from '@/constants/room-icons';

import styles from './styles.module.css';

type Props = {
  value: string;
  coverCss: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const RoomIconColorPicker = ({ value, coverCss, onChange, disabled = false }: Props) => {
  const isMatchCover = value === ROOM_ICON_COLOR_MATCH_COVER;

  return (
    <div className={styles.wrapper} role="radiogroup" aria-label="Цвет иконки">
      <div className={styles.grid}>
        <Button
          className={cn(styles.swatch, { [styles.swatchSelected]: isMatchCover })}
          onClick={() => onChange(ROOM_ICON_COLOR_MATCH_COVER)}
          isDisabled={disabled}
          aria-label="Как обложка"
          aria-pressed={isMatchCover ? true : false}
          style={{ backgroundImage: coverCss }}
        >
          <Icon icon="mingcute:link-2-line" width={16} height={16} className={styles.matchIcon} />
        </Button>

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
