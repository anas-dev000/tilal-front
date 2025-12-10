import { X } from 'lucide-react';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    large: 'max-w-5xl'
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ pointerEvents: 'auto' }}>
      {/* Background overlay - شفاف بدون لون أسود */}
      <div
        className="fixed inset-0 bg-gray-900/20 backdrop-blur-[2px] transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
        style={{ pointerEvents: 'auto' }}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        {/* Modal panel */}
        <div 
          className={`relative bg-white rounded-lg shadow-2xl transform transition-all w-full ${sizes[size]} max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-4">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none flex-shrink-0"
              type="button"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;