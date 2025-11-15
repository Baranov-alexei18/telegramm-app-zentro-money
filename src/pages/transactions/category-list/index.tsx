import { Fragment, useState } from 'react';

import { ArrowDownIcon } from '@/components/icons/arrow-down-icon';
import { ArrowUpIcon } from '@/components/icons/arrow-up-icon';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useGranularityStore } from '@/store/granularityStore';
import { useRoomStore } from '@/store/roomStore';

import { TransactionsList } from '../transactions-list';

import styles from './styles.module.css';

export type Props = {
  viewType: TRANSACTION_TYPE;
};

export const CategoryList = ({ viewType }: Props) => {
  const { room, getFilteredTransactions } = useRoomStore();
  const { period } = useGranularityStore();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const categoryList = room?.categories.filter((cat) => cat.type === viewType);

  const filteredTransactions = getFilteredTransactions(viewType, period);

  return (
    <Fragment>
      {categoryList?.map((category) => {
        const isOpen = expandedCategory === category.id;

        const transactions = filteredTransactions?.filter((t) => t.category.id === category.id);

        if (!transactions?.length) {
          return null;
        }

        const categoryTotal = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

        return (
          <div key={category.id} className={styles.categoryCard}>
            <div
              className={styles.categoryHeader}
              onClick={() => handleToggleCategory(category.id)}
              style={{
                borderBottom: isOpen ? `1px solid ${category.color}` : 'none',
              }}
            >
              <div className={styles.categoryInfo}>
                <div
                  className={styles.categoryColor}
                  style={{
                    backgroundColor: category.color,
                  }}
                />
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categorySum}>
                  {viewType === TRANSACTION_TYPE.EXPENSE ? '-' : '+'}
                  {categoryTotal} у.е.
                </span>
              </div>
              <span className={styles.arrow}>{isOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}</span>
            </div>

            {isOpen && <TransactionsList transactions={transactions} viewType={viewType} />}
          </div>
        );
      })}
    </Fragment>
  );
};
