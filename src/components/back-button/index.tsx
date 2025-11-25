import { useNavigate } from 'react-router';

import { ArrowLeftIcon } from '../icons/arrow-left-icon';
import { Button } from '../shared/button';

import styles from './styles.module.css';

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button className={styles.backBtn} onClick={() => navigate(-1)}>
      <ArrowLeftIcon height={12} width={12} />
    </Button>
  );
};
