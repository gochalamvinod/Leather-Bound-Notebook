import React from 'react';

export interface PageControlsProps {
  leftIndex: number;
  totalPages: number;
  isMobile?: boolean;
  isFlipping?: boolean;
  onAddPage: () => void;
  onDeletePage: () => void;
  className?: string;
}

export const PageControls: React.FC<PageControlsProps> = ({
  leftIndex,
  totalPages,
  isMobile = false,
  isFlipping = false,
  onAddPage,
  onDeletePage,
  className = '',
}) => {
  const handleDeleteClick = () => {
    if (totalPages <= 1 || isFlipping) return;
    if (window.confirm('Delete this page? This cannot be undone.')) {
      onDeletePage();
    }
  };

  const indicatorText = (() => {
    if (isMobile) {
      const currentPageNum = Math.min(totalPages, leftIndex + 1);
      return `Page ${currentPageNum} of ${Math.max(1, totalPages)}`;
    }
    const totalSpreads = Math.max(1, Math.ceil(totalPages / 2));
    const spreadNum = Math.floor(leftIndex / 2) + 1;
    const pageWord = totalPages === 1 ? 'page' : 'pages';
    return `Spread ${spreadNum} of ${totalSpreads} · ${totalPages} ${pageWord}`;
  })();

  return (
    <div className={`page-controls ${className}`}>
      <button
        type="button"
        id="addPageBtn"
        className="brass-link"
        disabled={isFlipping}
        onClick={onAddPage}
        title="Add a new page"
      >
        + Add page
      </button>

      <span id="pageIndicator" className="page-indicator">
        {indicatorText}
      </span>

      <button
        type="button"
        id="deletePageBtn"
        className="brass-link danger"
        disabled={totalPages <= 1 || isFlipping}
        onClick={handleDeleteClick}
        title={totalPages <= 1 ? 'Cannot delete the only page' : 'Delete this page'}
      >
        Delete page
      </button>
    </div>
  );
};

export default PageControls;
