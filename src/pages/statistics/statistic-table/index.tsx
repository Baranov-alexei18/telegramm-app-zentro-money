import React from 'react';
import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

import styles from './styles.module.css';

export type Props = {
  data: {
    id: string;
    categoryName: string;
    dateLabel: string;
    amount: number;
    color: string;
  }[];
};

export const StatisticTable = ({ data }: Props) => {
  return (
    <div className={styles.tableWrapper}>
      <Table aria-label="Статистика по категориям">
        <TableHeader>
          <Column>Date</Column>
          <Column>Category</Column>
          <Column>Amount</Column>
        </TableHeader>

        <TableBody>
          {data?.map((row) => (
            <Row key={row.id} style={{ color: row.color }}>
              <Cell>{row.dateLabel}</Cell>
              <Cell>{row.categoryName}</Cell>
              <Cell>{row.amount}</Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
