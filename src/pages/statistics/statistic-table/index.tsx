import React, { useState } from 'react';
import { Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

import { ArrowDownIcon } from '@/components/icons/arrow-down-icon';
import { TransactionProps } from '@/types/transaction';

import styles from './styles.module.css';

export type ExpandableRow = {
  id: string;
  label: string;
  total: number;
  color?: string;
  transactions: TransactionProps[];
};

export type Props = {
  data: ExpandableRow[];
};

export const StatisticTable = ({ data }: Props) => {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className={styles.tableWrapper}>
      <Table aria-label="Статистика">
        <TableHeader>
          <Column>Тип</Column>
          <Column>Всего</Column>
          <Column></Column>
        </TableHeader>

        <TableBody>
          {data.map((row) => (
            <React.Fragment key={row.id}>
              <Row className={styles.mainRow} style={{ color: row.color || 'inherit' }}>
                <Cell>{row.label}</Cell>
                <Cell>{row.total}</Cell>
                <Cell>
                  <Button
                    className={`${styles.toggleBtn} ${openRows[row.id] ? styles.open : ''}`}
                    onClick={() => toggle(row.id)}
                  >
                    <ArrowDownIcon height={16} width={16} />
                  </Button>
                </Cell>
              </Row>

              <Row>
                <Cell colSpan={3} className={styles.expandCell}>
                  <div className={`${styles.expandContent} ${openRows[row.id] ? styles.open : ''}`}>
                    <ul className={styles.list}>
                      {row.transactions?.map((t) => (
                        <li key={t.transactionId} className={styles.itemWrapper}>
                          <span className={styles.date}>
                            {t.date?.toDate?.().toLocaleDateString?.() ?? '—'}
                          </span>
                          <span className={styles.description}>{t.description}</span>
                          <span className={styles.amount}>{t.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Cell>
              </Row>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
