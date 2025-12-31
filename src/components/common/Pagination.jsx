import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalCount, 
  limit 
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 mx-1 rounded-md transition-colors ${
            currentPage === i
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-200 mt-4 gap-4">
      <div className="text-sm text-gray-700">
        {t('pagination.showing', 'Showing')} <span className="font-medium">{(currentPage - 1) * limit + 1}</span> {t('pagination.to', 'to')} <span className="font-medium">{Math.min(currentPage * limit, totalCount)}</span> {t('pagination.of', 'of')} <span className="font-medium">{totalCount}</span> {t('pagination.results', 'results')}
      </div>
      
      <div className="flex items-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-gray-100 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          aria-label="Previous Page"
        >
          {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        
        <div className="flex items-center mx-2">
          {renderPageNumbers()}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-gray-100 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          aria-label="Next Page"
        >
          {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
