import React, { useState } from 'react';

import { CategoryType } from '@/types/category';

import { Button } from '../shared/button';
import { CategoryPickerItem } from './category-picker-item';

import styles from './styles.module.css';

type Props = {
  categories: CategoryType[];
  onAddCategory: () => void;
  onSelectCategory: (category: CategoryType) => void;
  activeCategoryId?: string;
};

export const CategoryPicker: React.FC<Props> = ({
  categories,
  onAddCategory,
  onSelectCategory,
  activeCategoryId,
}) => {
  return (
    <div className={styles.container}>
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId;

        return (
          <CategoryPickerItem
            key={category.id}
            name={category.name}
            color={category.color}
            active={isActive}
            onClick={() => onSelectCategory(category)}
          />
        );
      })}

      <Button className={styles.addButton} onClick={onAddCategory}>
        + Добавить категорию
      </Button>
    </div>
  );
};
