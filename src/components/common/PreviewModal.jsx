import React from 'react';
import { createPortal } from "react-dom";
import { FileText, X, ExternalLink } from "lucide-react";

const PreviewModal = ({ isOpen, onClose, type, url, title }) => {
  if (!isOpen) return null;

  const getSafePdfUrl = (url) => {
    if (!url) return null;
    let safeUrl = url;
    if (url.includes('cloudinary.com')) {
      if (url.includes('/image/upload/')) {
        if (!url.toLowerCase().endsWith('.pdf')) {
          safeUrl = `${url}.pdf`;
        }
        safeUrl = safeUrl.replace('/upload/', '/upload/f_auto,q_auto/');
      }
    }
    if (safeUrl.toLowerCase().endsWith('.pdf') && !safeUrl.includes('#view=')) {
      safeUrl = `${safeUrl}#view=FitH`;
    }
    return safeUrl;
  };

  return createPortal(
    <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-4">
           <h3 className="text-lg font-semibold truncate flex-1">{title}</h3>
           <div className="flex items-center gap-2">
             <a 
               href={url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
               title="Open in new tab / Download"
             >
                <ExternalLink className="w-6 h-6" />
             </a>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
             </button>
           </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-black/50 rounded-lg overflow-hidden flex items-center justify-center border border-white/10 relative">
           {type === 'image' ? (
              <img src={url} alt={title} className="max-w-full max-h-full object-contain" />
           ) : type === 'pdf' ? (
               <iframe
                 src={getSafePdfUrl(url)}
                 className="w-full h-full bg-white"
                 title={title}
               />
           ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                 <div className="bg-white/10 p-6 rounded-full mb-4 ring-1 ring-white/20">
                    <FileText className="w-16 h-16 text-white" />
                 </div>
                 <h4 className="text-xl font-medium text-white mb-2 max-w-md truncate px-4">{title}</h4>
                 <p className="text-gray-400 mb-6 max-w-md">
                    Click below to view this document.
                 </p>
                 <a 
                   href={url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                 >
                    <ExternalLink className="w-5 h-5" />
                    Open Document
                 </a>
              </div>
           )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PreviewModal;
