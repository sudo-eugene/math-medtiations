import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import quotes from '../../quotes-easy.json';
import MathVisual, { customVisuals, devMode, getPresetForQuote } from './MathVisual';
import { useVisualBackgroundOverride } from '../utils/visualBackgroundOverride';

const formatVisualName = (rawName: string) => {
  const withoutExtension = rawName.replace(/\.tsx?$/i, '');
  const withSpacesAroundNumbers = withoutExtension.replace(/([a-zA-Z])(\d)/g, '$1 $2').replace(/(\d)([a-zA-Z])/g, '$1 $2');
  const withCamelCaseSpaces = withSpacesAroundNumbers.replace(/([a-z])([A-Z])/g, '$1 $2');
  return withCamelCaseSpaces.trim();
};

interface Page {
  id: string | number;
  type?: 'cover';
  quote: string;
  author: string;
  dedication?: string;
  imageUrl?: string;
  footnote?: boolean;
}

const PrintableBook = () => {
  const [loading, setLoading] = useState(false);
  useVisualBackgroundOverride('#ffffff');

  // Function to convert canvas to grayscale
  const convertToGrayscale = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;     // red
      data[i + 1] = gray; // green
      data[i + 2] = gray; // blue
      // data[i + 3] is alpha, leave it unchanged
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  const downloadPdf = async () => {
    setLoading(true);
    const bookElement = document.getElementById('book-container');
    if (!bookElement) {
      setLoading(false);
      return;
    }

    // Temporarily show all pages for rendering
    bookElement.classList.add('force-render-all');

    const pages = bookElement.querySelectorAll('.page');
    const CHUNK_SIZE = 20; // Process pages in smaller chunks to avoid memory issues
    
    let pdf: jsPDF | null = null;
    
    try {
      for (let chunkStart = 0; chunkStart < pages.length; chunkStart += CHUNK_SIZE) {
        const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, pages.length);
        
        console.log(`Processing pages ${chunkStart + 1} to ${chunkEnd} of ${pages.length}...`);
        
        // Process this chunk of pages
        for (let i = chunkStart; i < chunkEnd; i++) {
          const page = pages[i] as HTMLElement;
          
          // Create PDF on first page
          if (i === 0) {
            pdf = new jsPDF('portrait', 'mm', 'a6');
          }
          
          // HIGH QUALITY SETTINGS for sharp text
          const canvas = await html2canvas(page, {
            scale: 4, // Very high resolution for sharp text
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: false,
            removeContainer: true,
            windowWidth: page.scrollWidth,
            windowHeight: page.scrollHeight,
          });
          
          // Convert to grayscale
          const grayscaleCanvas = convertToGrayscale(canvas);
          
          // Use PNG for better text quality (lossless)
          const imgData = grayscaleCanvas.toDataURL('image/png');
          
          if (i > 0 && pdf) {
            pdf.addPage();
          }
          
          if (pdf) {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
          }
          
          // Force garbage collection hints
          canvas.width = 0;
          canvas.height = 0;
        }
        
        // Small delay between chunks to allow garbage collection
        if (chunkEnd < pages.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      if (pdf) {
        console.log('Saving PDF...');
        pdf.save('math-meditations-book.pdf');
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. The file may be too large. Try reducing the number of pages or contact support.');
    }

    // Restore original view
    bookElement.classList.remove('force-render-all');
    setLoading(false);
  };

  const MAX_QUOTES = 365;
  const limitedQuotes = quotes.slice(0, MAX_QUOTES);

  // Convert string array to objects with index-based IDs (starting from 1)
  const quotesWithIds = limitedQuotes.map((quote, index) => ({
    id: index + 1,
    quote: quote,
    author: ''
  }));

  // Calculate pages between covers (excluding front and back cover)
  // Structure: dedication + quotes + padding blanks + blank page before back
  const dedicationPage = {
    id: 'dedication',
    type: 'cover' as const,
    dedication: 'To ..,',
    quote: ``,
    author: '',
  };

  const dedicationFootnotePage = {
    id: 'dedication-footnote',
    quote: '',
    author: '',
    footnote: true,
  } as const;

  const interiorBasePages = quotesWithIds.length + 3; // dedication, footnote, blank before back
  const interiorRemainder = interiorBasePages % 4;
  const paddingPagesNeeded = interiorRemainder === 0 ? 0 : 4 - interiorRemainder;
  
  // Create padding blank pages
  const paddingPages = Array.from({ length: paddingPagesNeeded }, (_, i) => ({
    id: `padding-blank-${i + 1}`,
    quote: '',
    author: ''
  }));

  const finalPages: Page[] = [
    { id: 'cover-1', type: 'cover', quote: '', author: '', imageUrl: '/assets/covers/Cover.png' },
    dedicationPage,
    dedicationFootnotePage,
    ...quotesWithIds,
    ...paddingPages, // Add padding pages to keep interior page count divisible by 4
    { id: 'blank-before-back', quote: '', author: '' }, // Blank page before back cover
    { id: 'back-cover', type: 'cover', quote: '', author: '', imageUrl: '/assets/covers/Back.png' },
  ];

  return (
    <div className="printable-book-container bg-white font-serif">
      <div className="controls p-4 bg-white shadow-md sticky top-0 z-10 flex items-center justify-center">
        <button onClick={downloadPdf} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
          {loading ? 'Generating PDF...' : 'Download as A6 PDF'}
        </button>
      </div>
      <div id="book-container" className="p-8">
        {finalPages.map((p, index) => (
          <div className={`page relative ${p.imageUrl ? 'outer-page' : ''}`} key={p.id || index}>
            <div className="content flex flex-col justify-center h-full">
              {p.type === 'cover' ? (
                p.imageUrl ? (
                  <img src={p.imageUrl} alt="Cover Page" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col justify-center text-left h-full">
                    <p className="text-lg mb-4 text-center">An Artwork Inspired by<br /> Mathematics, Code and Grace</p>
                    <p className="text-sm italic text-gray-600 text-center max-w-md mx-auto my-6">Each visual in these pages emerged from pure code—algorithms breathing life into form, logic dancing into beauty. Where mathematics whispers its eternal truths, computation becomes brush and canvas, transforming the abstract into the visible, the calculated into the sublime.</p>
                    <p className="text-xs mt-6 text-gray-500 text-center">This book is a printed companion to the animated experience at <a href="https://gratitude.evenwel.me" className="underline" target="_blank" rel="noreferrer">https://gratitude.evenwel.me</a></p>
                  </div>
                )
              ) : p.footnote ? (
                <div className="flex-grow flex items-center justify-center">
                  <p className="text-xs text-gray-500 text-center max-w-xs">
                    {/* This page intentionally left blank  */}
                  </p>
                </div>
              ) : p.quote ? (
                <div className="flex-grow flex flex-col items-center justify-center gap-4">
                  <p className="quote-text text-center">{p.quote}</p>
                                    <div className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden border border-gray-200">
                    {typeof p.id === 'number' && customVisuals[p.id - 1] ? (
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
                      {typeof p.id === 'number'
                        ? customVisuals[p.id - 1]
                          ? `${formatVisualName(customVisuals[p.id - 1].name)}`
                          : `${getPresetForQuote(p.id).id} - ${JSON.stringify(getPresetForQuote(p.id).params)}`
                        : `${getPresetForQuote(p.id).id} - ${JSON.stringify(getPresetForQuote(p.id).params)}`}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            {typeof p.id === 'number' && (
              <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                {p.id}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintableBook;
