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
import { getUsername } from '@/utils/getUsername';
import { groupTransactionsByPeriod } from '@/utils/groupTransactionsStatistics';
import { prepareVictoryData } from '@/utils/prepareVictoryData';

import { StatisticTable } from '../statistic-table';
import { StatisticTableByDate } from '../statistic-table-date';

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

  const [tab, setTab] = useState<keyof typeof COMPONENTS>('date');

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

  const categoryList = room?.categories?.filter((cat) => cat.type === viewType) ?? [];
  const filteredTransactions = getFilteredTransactions(viewType, period);

  const { labels, result } = groupTransactionsByPeriod(filteredTransactions, type);
  const victoryData = prepareVictoryData(labels, result, categoryList);

  const tableByDate = labels.flatMap((label) =>
    categoryList
      .map((cat) => ({
        id: `${label}-${cat.id}`,
        label: cat.name,
        dateLabel: label,
        total: result[label]?.[cat.id] ?? 0,
        color: cat.color,
      }))
      .filter((row) => row.total !== 0)
  );

  const tableByCategory = categoryList
    .map((cat) => {
      const tx = filteredTransactions.filter((t) => t.category.id === cat.id);

      const total = tx.reduce((s, t) => Number(formatSmartNumber(s) || 0) + Number(t.amount), 0);

      return {
        id: cat.id,
        label: cat.name,
        color: cat.color,
        total,
        transactions: tx,
      };
    })
    .filter((row) => row.total !== 0);

  const tableByPeople = members
    .map((user) => {
      const tx = filteredTransactions.filter((t) => t.userId === user.id);

      const total = tx.reduce((s, t) => Number(formatSmartNumber(s) || 0) + Number(t.amount), 0);

      return {
        id: user.id,
        color: getRandomColor(),
        label: getUsername(user) || user.email || 'Нет имени',
        total,
        transactions: tx,
      };
    })
    .filter((row) => row.total !== 0);

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

  const COMPONENTS = {
    date: {
      chart: <ChartExplorer data={victoryData} labels={labels} hasData={tableByDate.length > 0} />,
      table: tableByDate.length > 0 ? <StatisticTableByDate data={tableByDate} /> : null,
    },
    categories: {
      chart: <ChartPie data={categorySummary} />,
      table: tableByCategory.length > 0 ? <StatisticTable data={tableByCategory} /> : null,
    },
    people: {
      chart: <ChartPie data={peopleSummary} />,
      table: tableByPeople.length > 0 ? <StatisticTable data={tableByPeople} /> : null,
    },
  };

  return (
    <div className={styles.wrapper}>
      <Tabs
        tabs={tabs}
        selected={tab}
        onChange={(key: string) => setTab(key as keyof typeof COMPONENTS)}
        ariaLabel="Статистика с типами"
      />

      {tab === 'date' && (
        <h3 className={styles.title}>
          {type === GranularityFields.WEEK && 'Траты по дням недели'}
          {type === GranularityFields.MONTH && 'Траты по дням месяца'}
          {type === GranularityFields.YEAR && 'Траты по месяцам'}
        </h3>
      )}

      {COMPONENTS[tab].chart}

      {COMPONENTS[tab].table}
    </div>
  );
};
