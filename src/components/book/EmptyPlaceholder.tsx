import React from 'react';

export interface EmptyPlaceholderProps {
  onAddPage: () => void;
  className?: string;
}

export const EmptyPlaceholder: React.FC<EmptyPlaceholderProps> = ({
  onAddPage,
  className = '',
}) => {
  return (
    <div id="rightEmpty" className={`page-empty ${className}`}>
      <span>The notebook ends here.</span>
      <button
        type="button"
        id="addPageInline"
        className="brass-link"
        onClick={onAddPage}
        title="Add a new blank page"
      >
        + Add a page
      </button>
    </div>
  );
};

export default EmptyPlaceholder;
