import React, { useEffect, useState } from 'react';

import { ChartExplorer } from '@/components/charts/explorer';
import { ChartPie } from '@/components/charts/pie';
import { Tabs } from '@/components/shared/tabs';
import { GranularityFields } from '@/constants/granularity';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useGranularityStore } from '@/store/granularityStore';
import { useRoomStore } from '@/store/roomStore';
import { formatSmartNumber } from '@/utils/formatSmartNumber';
import { getRandomColor } from '@/utils/getRandomColor';
import { groupTransactionsByPeriod } from '@/utils/groupTransactionsStatistics';
import { prepareVictoryData } from '@/utils/prepareVictoryData';

import { StatisticTable } from '../statistic-table';

import styles from './styles.module.css';

export type Props = {
  viewType: TRANSACTION_TYPE;
};

const tabs = [
  { key: 'date', label: 'По дате' },
  { key: 'categories', label: 'По категориям' },
  { key: 'people', label: 'По людям' },
];

export const StatisticView = ({ viewType }: Props) => {
  const { room, getFilteredTransactions, members, fetchMembers } = useRoomStore();
  const { period, type } = useGranularityStore();

  const [tab, setTab] = useState('date');

  useEffect(() => {
    const fetchUsersRoom = async () => {
      if (members.length > 0 || !room) return;

      try {
        fetchMembers(room);
      } catch (e) {
        console.error('Ошибка при загрузке комнаты или участников:', e);
      }
    };

    fetchUsersRoom();
  }, [fetchMembers, members.length, room]);

  const categoryList = room?.categories.filter((cat) => cat.type === viewType) ?? [];
  const filteredTransactions = getFilteredTransactions(viewType, period);

  const { labels, result } = groupTransactionsByPeriod(filteredTransactions, type);
  const victoryData = prepareVictoryData(labels, result, categoryList);

  const tableData = labels.flatMap((label) =>
    categoryList
      .map((cat) => ({
        id: `${label}-${cat.id}`,
        categoryName: cat.name,
        dateLabel: label,
        amount: result[label][cat.id] ?? 0,
        color: cat.color,
      }))
      .filter((row) => row.amount !== 0)
  );

  const categorySummary = categoryList.map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    amount: filteredTransactions
      .filter((t) => t.category.id === cat.id)
      .reduce((sum, t) => Number(formatSmartNumber(sum) || 0) + Number(t.amount), 0),
  }));

  const peopleSummary = members?.map((user) => ({
    id: user.id,
    name: (user.firstName || user.lastName) ?? user.email ?? 'Без имени',
    color: getRandomColor(),
    amount: filteredTransactions
      .filter((t) => t.userId === user.id)
      .reduce((sum, t) => Number(formatSmartNumber(sum) || 0) + Number(t.amount), 0),
  }));

  const hasData = tableData.length > 0;

  return (
    <div className={styles.wrapper}>
      <Tabs tabs={tabs} selected={tab} onChange={setTab} ariaLabel="Статистика с типами">
        <h3 className={styles.title}>
          {type === GranularityFields.WEEK && 'Траты по дням недели'}
          {type === GranularityFields.MONTH && 'Траты по дням месяца'}
          {type === GranularityFields.YEAR && 'Траты по месяцам'}
        </h3>

        {tab === 'date' && <ChartExplorer data={victoryData} labels={labels} hasData={hasData} />}
        {tab === 'categories' && <ChartPie data={categorySummary} />}
        {tab === 'people' && <ChartPie data={peopleSummary} />}
      </Tabs>

      {hasData && <StatisticTable data={tableData} />}
    </div>
  );
};
