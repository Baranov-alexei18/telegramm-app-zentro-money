import React from 'react';
import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

import styles from './styles.module.css';

export type Props = {
  data: {
    id: string;
    label: string;
    dateLabel: string;
    total: number;
    color: string;
  }[];
};

export const StatisticTableByDate = ({ data }: Props) => {
  return (
    <div className={styles.tableWrapper}>
      <Table aria-label="Статистика по категориям">
        <TableHeader>
          <Column>Дата</Column>
          <Column>Категория</Column>
          <Column>Всего</Column>
        </TableHeader>

        <TableBody>
          {data?.map((row) => (
            <Row key={row.id} style={{ color: row.color }}>
              <Cell>{row.dateLabel}</Cell>
              <Cell>{row.label}</Cell>
              <Cell className={styles.cellTotal}>{row.total}</Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
