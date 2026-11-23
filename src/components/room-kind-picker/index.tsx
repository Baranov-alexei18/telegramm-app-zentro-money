import cn from 'classnames';

import { Button } from '@/components/shared/button';
import {
  ROOM_KIND_HINT,
  ROOM_KIND_LABEL,
  ROOM_KIND_OPTIONS,
  RoomKind,
} from '@/constants/room-kind';

import styles from './styles.module.css';

type Props = {
  value: RoomKind;
  onChange: (kind: RoomKind) => void;
  disabled?: boolean;
  canSelectSingle?: boolean;
  singleBlockedHint?: string;
  showLabel?: boolean;
};

export const RoomKindPicker = ({
  value,
  onChange,
  disabled = false,
  canSelectSingle = true,
  singleBlockedHint,
  showLabel = true,
}: Props) => {
  return (
    <div className={styles.wrapper} role="radiogroup" aria-label="Тип комнаты">
      {showLabel && <span className={styles.label}>Тип комнаты</span>}
      {ROOM_KIND_OPTIONS.map((kind) => {
        const isSelected = value === kind;
        const isBlocked = kind === RoomKind.SINGLE_PERSON && !canSelectSingle;

        return (
          <Button
            key={kind}
            className={cn(styles.option, {
              [styles.optionSelected]: isSelected,
              [styles.optionBlocked]: isBlocked,
            })}
            onClick={() => onChange(kind)}
            isDisabled={disabled}
            aria-pressed={isSelected ? true : false}
          >
            <span className={styles.optionTitle}>{ROOM_KIND_LABEL[kind]}</span>
            <span className={styles.optionHint}>
              {isBlocked ? singleBlockedHint : ROOM_KIND_HINT[kind]}
            </span>
          </Button>
        );
      })}
    </div>
  );
};
