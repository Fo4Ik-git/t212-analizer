import { useCallback, useState } from 'react';
import { DIALOG_TITLES } from '../constants';
import { DialogData, DialogType } from '../types';

/**
 * Хук для управления диалогом
 */
export function useDialog() {
  const [dialogData, setDialogData] = useState<DialogData>({
    isOpen: false,
    type: null,
    title: ''
  });

  const openDialog = useCallback((type: DialogType) => {
    setDialogData({
      isOpen: true,
      type,
      title: DIALOG_TITLES[type]
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogData(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    dialogData,
    openDialog,
    closeDialog
  };
}
