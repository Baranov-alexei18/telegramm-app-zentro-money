import { Fragment, useState } from 'react';
import cn from 'classnames';

import { BackButton } from '@/components/back-button';
import { Header } from '@/components/header';
import { PeriodDateNavigator } from '@/components/period-date-navigator';
import { PeriodPicker } from '@/components/period-picker';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useLoadRoom } from '@/hooks/useLoadRoom';

import { StatisticView } from './statisctic-view';

import styles from './styles.module.css';

export const StatisticsPage = () => {
  useLoadRoom();

  const [viewType, setViewType] = useState<TRANSACTION_TYPE>(TRANSACTION_TYPE.EXPENSE);

  return (
    <Fragment>
      <Header>
        <BackButton />
      </Header>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Статистика</h1>
        <PeriodPicker />
        <PeriodDateNavigator />
        <div className={styles.tabs}>
          <button
            className={cn(styles.tab, viewType === TRANSACTION_TYPE.EXPENSE && styles.activeTab)}
            onClick={() => setViewType(TRANSACTION_TYPE.EXPENSE)}
          >
            Расходы
          </button>
          <button
            className={cn(styles.tab, viewType === TRANSACTION_TYPE.INCOME && styles.activeTab)}
            onClick={() => setViewType(TRANSACTION_TYPE.INCOME)}
          >
            Доходы
          </button>
        </div>

        <StatisticView viewType={viewType} />
      </div>
    </Fragment>
  );
};
