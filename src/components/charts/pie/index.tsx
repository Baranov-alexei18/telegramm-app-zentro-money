import { useState } from 'react';
import { VictoryLabel, VictoryPie, VictoryTheme } from 'victory';

import { formatSmartNumber } from '@/utils/formatSmartNumber';

import styles from './styles.module.css';

export type PieDataItem = {
  id: string;
  name: string;
  color: string;
  amount: number;
};

type Props = {
  data: PieDataItem[];
};

export const ChartPie = ({ data }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);

  const validData = data.filter((d) => d.amount > 0);

  const totalAmount = validData.reduce((s, d) => Number(formatSmartNumber(s || 0)) + d.amount, 0);

  const handleClick = (_: any, props: any) => {
    const id = props.datum.id;
    setSelected((prev) => (prev === id ? null : id));
  };

  if (!validData.length) {
    return (
      <svg viewBox="0 0 280 280">
        <VictoryPie
          standalone={false}
          width={280}
          height={220}
          data={[{ x: ' ', y: 10 }]}
          innerRadius={50}
          labelRadius={40}
          theme={VictoryTheme.grayscale}
        />
        <VictoryLabel
          textAnchor="middle"
          style={{ fontSize: 12 }}
          x={140}
          y={110}
          text="Нет данных"
        />
      </svg>
    );
  }
  return (
    <div className={styles.wrapper}>
      <svg viewBox="0 0 280 280" width="100%" height="280">
        <VictoryPie
          standalone={false}
          width={280}
          height={280}
          data={validData}
          x="name"
          y="amount"
          innerRadius={50}
          padAngle={5}
          theme={VictoryTheme.clean}
          colorScale={validData.map((d) => d.color)}
          style={{
            data: {
              opacity: ({ datum }) => (selected && selected !== datum.id ? 0.4 : 1),
              transformOrigin: 'center center',
              transition: 'all 0.2s ease',
            },
          }}
          events={[
            {
              target: 'data',
              eventHandlers: {
                onPress: handleClick,
                onClick: handleClick,
              },
            },
          ]}
        />

        <VictoryLabel
          textAnchor="middle"
          className={styles.label}
          x={140}
          y={130}
          text={
            selected
              ? formatSmartNumber(validData.find((d) => d.id === selected)?.amount ?? '')
              : `${formatSmartNumber(totalAmount)}`
          }
        />

        <VictoryLabel
          textAnchor="middle"
          className={styles.labelSmall}
          x={140}
          y={150}
          text={selected ? validData.find((d) => d.id === selected)?.name : 'Всего'}
        />
      </svg>
    </div>
  );
};
