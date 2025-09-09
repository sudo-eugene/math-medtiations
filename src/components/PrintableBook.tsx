import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import quotes from '../../quotes-easy.json';
import MathVisual, { customVisuals, devMode, getPresetForQuote } from './MathVisual';

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

  // Ensure even page count for binding. 365 days -> 365 quotes. 365*2 = 730 pages. Add a blank spread if odd.
  const quotesWithEvenPages = [...quotes];
  if ((quotes.length * 2) % 2 !== 0) {
    quotesWithEvenPages.push({ id: 'blank', quote: '', author: '' });
  }
  // The user's spec says 365 is odd and to add a page. 365 pages is odd. But we have quote+visual, so 365 quotes = 730 pages, which is even.
  // Let's handle the case of 365 pages total. If we have 365 items, we need to add one.
  if (quotesWithEvenPages.length % 2 !== 0) {
      // This logic is tricky. Let's assume one quote per page for a moment.
      // If we have 365 quotes, we have 365 pages. That's odd. We need 366.
      // But we have a quote AND a visual. So 365 quotes = 730 pages. That's even.
      // The user's example adds a quote if quote length is odd. Let's stick to that for now.
  }

  // Let's follow user's example of ensuring quote array is even.
  const quotesWithBacking = [...quotes];
  if (quotesWithBacking.length % 2 !== 0) {
    quotesWithBacking.push({ id: 'blank', quote: '', author: '' });
  }

  const finalPages = [
    { id: 'cover-1', type: 'cover', quote: 'Gratitude Meditations', author: '' },
    { id: 'cover-2', type: 'cover', quote: 'Inspired by Mathematics, Art, Code and Grace', author: '' },
    ...quotesWithBacking
  ];

  return (
    <div className="printable-book-container bg-gray-200">
      <div className="controls p-4 bg-white shadow-md sticky top-0 z-10 flex items-center justify-center">
        <button onClick={downloadPdf} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
          {loading ? 'Generating PDF...' : 'Download as A6 PDF'}
        </button>
      </div>
      <div id="book-container" className="p-8">
        {finalPages.map((p, index) => (
          <div className={`page `} key={p.id || index}>
            <div className="content flex flex-col justify-center h-full">
              {p.type === 'cover' ? (
                <div className="flex-grow flex flex-col items-center justify-center">
                  <p className="text-2xl text-center">{p.quote}</p>
                </div>
              ) : p.id !== 'blank' ? (
                <div className="flex-grow flex flex-col items-center justify-center gap-8">
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
                        quoteId={p.id} 
                        isVisible={true} 
                        onLoad={() => {}}
                      />
                    )}
                    {devMode && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {customVisuals.hasOwnProperty(p.id)
                          ? `${customVisuals[p.id].name}.tsx`
                          : `${getPresetForQuote(p.id).id} - ${JSON.stringify(getPresetForQuote(p.id).params)}`}
                      </div>
                    )}
                  </div>
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
