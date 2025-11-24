import { ReactNode } from 'react';
import { Button } from 'react-aria-components';

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
  children: ReactNode;
};

export const Tabs = ({ tabs, selected, ariaLabel, onChange, children }: TabsProps) => {
  return (
    <div className={styles.tabsWrapper} aria-label={ariaLabel}>
      <div className={styles.tabList}>
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            className={`${styles.tabButton} ${selected === tab.key ? styles.active : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className={styles.tabPanel}>{children}</div>
    </div>
  );
};
