import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import cn from 'classnames';

import { Input } from '@/components/shared/input';

import styles from './styles.module.css';

type Props = {
  value: string;
  onSave: (value: string) => Promise<void>;
  canEdit: boolean;
  className?: string;
  placeholder?: string;
  ariaLabel: string;
  minLength?: number;
};

export const EditableRoomField = ({
  value,
  onSave,
  canEdit,
  className,
  placeholder = '',
  ariaLabel,
  minLength = 0,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
      setError(undefined);
    }
  }, [isEditing, value]);

  const handleStartEdit = () => {
    if (!canEdit || isSaving) return;
    setDraft(value);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(value);
    setError(undefined);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const nextValue = draft.trim();

    if (minLength > 0 && nextValue.length < minLength) {
      setError(`Минимум ${minLength} символа`);
      return;
    }

    if (nextValue === value.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(nextValue);
      setIsEditing(false);
      setError(undefined);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Не удалось сохранить';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        value={draft}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        error={error}
        disabled={isSaving}
        aria-label={ariaLabel}
        autoFocus={true}
        className={styles.input}
      />
    );
  }

  const displayValue = value.trim() || placeholder;
  const textClassName = cn({ [styles.placeholder]: !value.trim() });

  if (!canEdit) {
    return (
      <p className={cn(styles.display, className)} title={displayValue}>
        {displayValue}
      </p>
    );
  }

  return (
    <button
      type="button"
      className={cn(styles.display, styles.editable, className)}
      onClick={handleStartEdit}
      aria-label={`Изменить: ${ariaLabel}`}
      title={displayValue}
    >
      <span className={cn(styles.truncate, textClassName)}>{displayValue}</span>
      <Icon icon="solar:pen-bold" width={14} height={14} className={styles.editIcon} />
    </button>
  );
};
