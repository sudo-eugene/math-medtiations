import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import quotes from '../../quotes-easy.json';
import MathVisual, { customVisuals, devMode, getPresetForQuote } from './MathVisual';

interface Page {
  id: string | number;
  type?: 'cover';
  quote: string;
  author: string;
  dedication?: string;
  imageUrl?: string;
}

const PrintableBook = () => {
  const [loading, setLoading] = useState(false);

  const downloadPdf = async () => {
    setLoading(true);
    const bookElement = document.getElementById('book-container');
    if (!bookElement) {
      setLoading(false);
      return;
    }

    // Temporarily show all pages for rendering
    bookElement.classList.add('force-render-all');

    const pdf = new jsPDF('portrait', 'mm', 'a6');
    const pages = bookElement.querySelectorAll('.page');

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;
      const canvas = await html2canvas(page, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');

      if (i > 0) {
        pdf.addPage();
      }

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    }

    pdf.save('math-meditations-book.pdf');

    // Restore original view
    bookElement.classList.remove('force-render-all');
    setLoading(false);
  };

  // Convert string array to objects with index-based IDs (starting from 1)
  const quotesWithIds = quotes.map((quote, index) => ({
    id: index + 1,
    quote: quote,
    author: ''
  }));

  // Ensure even page count for binding
  const quotesWithBacking = [...quotesWithIds];
  if (quotesWithBacking.length % 2 !== 0) {
    quotesWithBacking.push({ id: 'blank', quote: '', author: '' });
  }

  const finalPages: Page[] = [
    { id: 'cover-1', type: 'cover', quote: '', author: '', imageUrl: '/assets/covers/Cover.png' },
    {
      id: 'cover-2',
      type: 'cover',
      dedication: 'To ..,',
      quote: ``,
      author: '',
    },
    ...quotesWithBacking,
    { id: 'back-cover', type: 'cover', quote: '', author: '', imageUrl: '/assets/covers/Back.png' },
  ];

  return (
    <div className="printable-book-container bg-gray-200 font-serif">
      <div className="controls p-4 bg-white shadow-md sticky top-0 z-10 flex items-center justify-center">
        <button onClick={downloadPdf} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
          {loading ? 'Generating PDF...' : 'Download as A6 PDF'}
        </button>
      </div>
      <div id="book-container" className="p-8">
        {finalPages.map((p, index) => (
          <div className={`page ${p.imageUrl ? 'outer-page' : ''}`} key={p.id || index}>
            <div className="content flex flex-col justify-center h-full">
              {p.type === 'cover' ? (
                p.imageUrl ? (
                  <img src={p.imageUrl} alt="Cover Page" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex-grow flex flex-col text-left">
                    <p className="text-lg mb-4">Inspired by Mathematics, Art, Code and Grace</p>
                    {p.dedication && <p className="text-lg mb-4">{p.dedication}</p>}
                    <p className="text-sm">A quiet blessing for your beginning: may your days find their centre in gratitude, your steps trace patterns of wonder, and your love hold steady like a star.</p>
                    <p className="text-sm">May your life together be beautifully designed—precise yet playful, simple yet profound.</p>
                    <p className="text-sm">With love and warmest wishes.</p>
                    <p className="text-lg mt-4">from</p>
                  </div>
                )
              ) : p.id !== 'blank' ? (
                <div className="flex-grow flex flex-col items-center justify-center gap-4">
                  <p className="quote-text text-center">{p.quote}</p>
                                    <div className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden border border-gray-300">
                    {customVisuals.hasOwnProperty(p.id) ? (
                      <img 
                        src={`/assets/visuals/${p.id}.png`} 
                        alt={`Visual for quote ${p.id}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MathVisual 
                        quoteIndex={p.id} 
                        isVisible={true} 
                        onLoad={() => {}}
                      />
                    )}
                  </div>
                  {devMode && (
                    <div className="text-center text-xs text-gray-500 -mt-2">
                      {customVisuals.hasOwnProperty(p.id)
                        ? `${customVisuals[p.id].name}.tsx`
                        : `${getPresetForQuote(p.id).id} - ${JSON.stringify(getPresetForQuote(p.id).params)}`}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintableBook;
