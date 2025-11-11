import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { CategoryPicker } from '@/components/category-picker';
import { CategoryPickerItem } from '@/components/category-picker/category-picker-item';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { Button as AppButton } from '@/components/shared/button';
import { DatePicker } from '@/components/shared/date-picker';
import { Input } from '@/components/shared/input';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { useAppStore } from '@/store/appStore';
import { useRoomStore } from '@/store/roomStore';
import { CategoryType } from '@/types/category';
import { TransactionFormValues, TransactionProps } from '@/types/transaction';
import { dateValueToDate } from '@/utils/dateValueToDate';

import styles from './styles.module.css';

type TransactionFormProps = {
  type: TRANSACTION_TYPE.INCOME | TRANSACTION_TYPE.EXPENSE;
  categories?: CategoryType[];
  onSubmit: (data: TransactionFormValues) => Promise<void> | void;
  values?: TransactionProps;
};

export const TransactionForm = ({ type, categories, onSubmit, values }: TransactionFormProps) => {
  const { closeTopBottomSheet } = useAppStore();
  const { addCategory, updateCategory, deleteCategory, room } = useRoomStore();

  const [isLoading, setIsLoading] = useState(false);

  const valuesForm = useMemo(
    () =>
      values || {
        date: new Date(),
        category: categories?.[0],
        amount: undefined,
        description: '',
      },
    [categories, values]
  );

  const { control, handleSubmit, reset } = useForm<TransactionFormValues>({
    defaultValues: valuesForm,
  });

  const handleFormSubmit = async (data: TransactionFormValues) => {
    try {
      setIsLoading(true);

      await onSubmit(data);

      reset();
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      alert('Произошла ошибка ❌');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = (name: string) => {
    const data = {
      name,
      type,
    };

    addCategory(data);
  };

  const handleUpdateCategory = (id: string, value: string) => {
    const category = room?.categories.find((cat) => cat.id === id);

    if (!category) {
      return;
    }

    const data = {
      ...category,
      name: value,
    };

    updateCategory(data);
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
  };
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.formWrapper}>
      <Controller
        name="date"
        control={control}
        rules={{
          required: 'Введите дату',
        }}
        render={({ field }) => (
          <DatePicker
            value={field.value}
            onChange={(value) => {
              const validDate = dateValueToDate(value);

              field.onChange(validDate);
            }}
          />
        )}
      />

      <Controller
        name="category"
        control={control}
        rules={{
          required: 'Выберите категорию',
        }}
        render={({ field }) => (
          <BottomSheet
            classNameWrapperTrigger={styles.triggerBottomSheet}
            triggerComponent={
              <CategoryPickerItem
                key={field?.value.id || ''}
                name={field?.value?.name || 'Категория'}
                color={field?.value?.color || 'black'}
                active={true}
              />
            }
            id={`choose-category`}
          >
            <CategoryPicker
              categories={categories!}
              activeCategoryId={field?.value.id}
              onSelectCategory={(category) => {
                field.onChange(category);

                closeTopBottomSheet();
              }}
              onEditCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddCategory={handleAddCategory}
              key={`category-${values?.transactionId}`}
            />
          </BottomSheet>
        )}
      />

      <Controller
        name="amount"
        control={control}
        rules={{
          required: 'Введите сумму',
          min: { value: 0.01, message: 'Минимум 0.01' },
        }}
        render={({ field, fieldState }) => (
          <Input
            type="number"
            value={field.value}
            onChange={field.onChange}
            placeholder="Сумма"
            error={fieldState.error?.message}
            disabled={isLoading}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Input
            value={field.value}
            onChange={field.onChange}
            placeholder="Описание"
            disabled={isLoading}
          />
        )}
      />
      <AppButton type="submit" isDisabled={isLoading}>
        {isLoading
          ? 'Сохранение...'
          : type === TRANSACTION_TYPE.INCOME
            ? 'Добавить доход'
            : 'Добавить расход'}
      </AppButton>
    </form>
  );
};
