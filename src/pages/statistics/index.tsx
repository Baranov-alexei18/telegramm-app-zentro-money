import { Fragment, useState } from 'react';

import { BackButton } from '@/components/back-button';
import { Header } from '@/components/header';
import { PeriodDateNavigator } from '@/components/period-date-navigator';
import { PeriodPicker } from '@/components/period-picker';
import { Tabs } from '@/components/shared/tabs';
import { TABS_TYPES, TRANSACTION_TYPE } from '@/constants/transaction-type';
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

        <div className={styles.dateWrapper}>
          <PeriodPicker />

          <PeriodDateNavigator />
        </div>

        <Tabs
          tabs={TABS_TYPES}
          selected={viewType}
          onChange={(tab) => setViewType(tab as TRANSACTION_TYPE)}
          ariaLabel="Переключатель доходов/расходов"
        />

        <StatisticView viewType={viewType} />
      </div>
    </Fragment>
  );
};
