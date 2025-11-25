import { ReactNode } from 'react';
import { Button, Tabs as TabsArea } from 'react-aria-components';

import styles from './styles.module.css';

type TabItem = {
  key: string;
  label: string;
};

type TabsProps = {
  tabs: TabItem[];
  selected: string;
  ariaLabel: string;
  onChange: (key: string) => void;
};

export const Tabs = ({ tabs, selected, ariaLabel, onChange }: TabsProps) => {
  return (
    <div className={styles.tabsWrapper} aria-label={ariaLabel}>
      <TabsArea className={styles.tabList}>
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            className={`${styles.tabButton} ${selected === tab.key ? styles.active : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </TabsArea>
    </div>
  );
};
