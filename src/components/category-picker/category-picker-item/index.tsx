import cn from 'classnames';

import styles from './styles.module.css';

type Props = {
  name: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
};

export const CategoryPickerItem = ({ name, color, active = false, onClick }: Props) => {
  return (
    <button
      className={cn(styles.wrapper, { [styles.active]: active })}
      style={{ borderColor: color }}
      onClick={onClick}
    >
      <span className={styles.name}>{name}</span>

      <span
        className={cn(styles.indicator, { [styles.indicatorActive]: active })}
        style={{ borderColor: color, backgroundColor: active ? color : 'transparent' }}
      />
    </button>
  );
};
