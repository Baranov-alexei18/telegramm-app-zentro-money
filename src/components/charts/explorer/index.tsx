import { VictoryAxis, VictoryBar, VictoryChart, VictoryStack } from 'victory';

import styles from './styles.module.css';

export type ExplorerDataItem = {
  x: string;
  y: number | string;
  color?: string;
};

type Props = {
  data: ExplorerDataItem[][];
  labels: string[];
  hasData: boolean;
};

export const ChartExplorer = ({ data, labels, hasData }: Props) => {
  return (
    <div className={styles.chartContainer}>
      <VictoryChart domainPadding={20} height={280}>
        <VictoryAxis
          tickValues={labels}
          style={{
            grid: {
              stroke: 'rgba(0,0,0,0.06)',
              strokeDasharray: '4,4',
            },
            tickLabels: { fontSize: 10 },
          }}
        />

        <VictoryAxis
          dependentAxis
          style={{
            grid: {
              stroke: 'rgba(0,0,0,0.06)',
              strokeDasharray: '4,4',
            },
            tickLabels: { fontSize: 10 },
          }}
        />

        <VictoryStack>
          {data.map((catData, i) => (
            <VictoryBar
              key={i}
              data={catData}
              style={{
                data: {
                  fill: data[i][i]?.color || '#888',
                },
              }}
            />
          ))}
        </VictoryStack>
      </VictoryChart>

      {!hasData && <div className={styles.noDataOverlay}>Нет данных</div>}
    </div>
  );
};
