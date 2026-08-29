import React from 'react';
import { useEditor } from '../../context/EditorContext';

export interface SaveStatusIndicatorProps {
  className?: string;
  onClick?: () => void;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  className = '',
  onClick,
}) => {
  const { saveStatus, saveStatusLabel } = useEditor();

  const isSaving =
    saveStatus === 'Saving...' ||
    saveStatus === 'saving' ||
    saveStatus === 'Editing...' ||
    saveStatus === 'editing';

  const isError = saveStatus === 'Error' || saveStatus === 'error';

  return (
    <span
      id="saveStatus"
      className={`save-status ${isSaving ? 'saving' : ''} ${isError ? 'error' : ''} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      title={isError ? 'Click or continue editing to retry save' : 'Autosave status'}
    >
      {saveStatusLabel}
    </span>
  );
};

export default SaveStatusIndicator;
