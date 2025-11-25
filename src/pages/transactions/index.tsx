import { Fragment, useState } from 'react';
import { useLocation } from 'react-router';

import { BackButton } from '@/components/back-button';
import { Header } from '@/components/header';
import { PeriodDateNavigator } from '@/components/period-date-navigator';
import { PeriodPicker } from '@/components/period-picker';
import { Tabs } from '@/components/shared/tabs';
import { TABS_TYPES, TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useLoadRoom } from '@/hooks/useLoadRoom';

import { CategoryList } from './category-list';

import styles from './styles.module.css';

export const TransactionsPage = () => {
  const location = useLocation();

  useLoadRoom();

  const { type } = location.state ?? {};

  const [viewType, setViewType] = useState<TRANSACTION_TYPE>(type);

  return (
    <Fragment>
      <Header>
        <BackButton />
      </Header>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Транзакции</h1>
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
        <CategoryList viewType={viewType} />
      </div>
    </Fragment>
  );
};
