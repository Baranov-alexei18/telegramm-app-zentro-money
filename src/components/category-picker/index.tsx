import React, { Fragment, useState } from 'react';
import { Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components';

import { useRoomAccess } from '@/hooks/useRoomAccess';
import { CategoryType } from '@/types/category';

import { Button } from '../shared/button';
import { Input } from '../shared/input';
import { CategoryPickerItem } from './category-picker-item';

import styles from './styles.module.css';

type Props = {
  categories: CategoryType[];
  onAddCategory: (name: string) => void;
  onSelectCategory: (category: CategoryType) => void;
  onDeleteCategory: (id: string) => void;
  onEditCategory: (id: string, newName: string) => void;
  activeCategoryId?: string;
};

export const CategoryPicker: React.FC<Props> = ({
  categories,
  onAddCategory,
  onSelectCategory,
  onDeleteCategory,
  onEditCategory,
  activeCategoryId,
}) => {
  const { canDeleteCategory, canCreateCategory, canModifyCategory } = useRoomAccess();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleEditStart = (category: CategoryType) => {
    setEditingId(category.id);
    setEditValue(category.name);
  };

  const handleEditSave = (id: string) => {
    if (onEditCategory && editValue.trim()) {
      onEditCategory(id, editValue.trim());
    }
    setEditingId(null);
  };

  const handleAddNewCategory = () => {
    if (!newCategory.trim()) {
      return;
    }

    onAddCategory(newCategory);

    setNewCategory('');
  };
  return (
    <div className={styles.container}>
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId;
        const isEditing = editingId === category.id;

        return (
          <Fragment key={category.id}>
            {isEditing ? (
              <div className={styles.editWrapper}>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(category.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className={styles.editInput}
                />
                <Button
                  onClick={() => handleEditSave(category.id)}
                  className={styles.saveButton}
                  type="button"
                >
                  💾
                </Button>
              </div>
            ) : (
              <div className={styles.categoryRow}>
                <CategoryPickerItem
                  key={category.id}
                  name={category.name}
                  color={category.color}
                  active={isActive}
                  onClick={() => onSelectCategory(category)}
                />

                {(canModifyCategory() || canDeleteCategory()) && (
                  <MenuTrigger>
                    <Button aria-label="Меню" className={styles.menuButton} type="button">
                      ⋮
                    </Button>
                    <Popover className={styles.popover}>
                      <Menu className={styles.menu}>
                        {canModifyCategory() && (
                          <MenuItem
                            onAction={() => handleEditStart(category)}
                            className={styles.menuItem}
                          >
                            ✏️ Переименовать
                          </MenuItem>
                        )}
                        {canDeleteCategory() && (
                          <MenuItem
                            onAction={() => onDeleteCategory?.(category.id)}
                            className={styles.menuItemDelete}
                          >
                            🗑️ Удалить
                          </MenuItem>
                        )}
                      </Menu>
                    </Popover>
                  </MenuTrigger>
                )}
              </div>
            )}
          </Fragment>
        );
      })}

      {canCreateCategory() && (
        <div className={styles.addCategoryRow}>
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Новая категория"
            className={styles.addInput}
          />
          <Button className={styles.addButton} onClick={handleAddNewCategory} type="button">
            ➕
          </Button>
        </div>
      )}
    </div>
  );
};
