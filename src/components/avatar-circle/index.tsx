import styles from './styles.module.css';

type Props = {
  id: string;
  height: number;
  width: number;
};
export const AvatarCircle = ({ id, height, width }: Props) => (
  <img
    src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${id}`}
    style={{
      height: `${height}px`,
      width: `${width}px`,
    }}
    className={styles.avatar}
  />
);
