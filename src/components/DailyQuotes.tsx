import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import easyQuotes from '../../quotes-easy.json';
import advancedQuotes from '../../quotes-advanced.json';
import MathVisual from './MathVisual.tsx';
import SEO from './SEO.tsx';

const devMode = true;

const DailyQuotes = ({ initialDay }: { initialDay?: number }) => {
  const { day } = useParams();
  const navigate = useNavigate();
  const pageNumber = initialDay || parseInt(day, 10);
  const isProxied = !!initialDay;
  const scrollContainerRef = useRef(null);
  const sidebarRef = useRef(null);
  const pageLinkRefs = useRef({});
  const [visiblePage, setVisiblePage] = useState(pageNumber);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const [mathVisualLoaded, setMathVisualLoaded] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  
  const quotes = isAdvancedMode ? advancedQuotes : easyQuotes;

  if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > quotes.length) {
    return <Navigate to="/daily-quotes/1" replace />;
  }

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const targetPage = scrollContainer.children[pageNumber - 1];
    if (targetPage) {
      const targetScrollTop = targetPage.offsetTop;
      if (Math.abs(scrollContainer.scrollTop - targetScrollTop) > 1) {
        scrollContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      }
    }

    const handleScroll = () => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        const scrollTop = scrollContainer.scrollTop;
        const pageHeight = scrollContainer.clientHeight;
        const currentPage = Math.round(scrollTop / pageHeight) + 1;
        
        if (currentPage >= 1 && currentPage <= quotes.length) {
          setVisiblePage(currentPage);
          if (currentPage !== pageNumber && !isProxied) {
            navigate(`/daily-quotes/${currentPage}`, { replace: true });
          }
        }
      }, 150);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [pageNumber, navigate, quotes.length]);

  useEffect(() => {
    const activeLink = pageLinkRefs.current[pageNumber];
    if (activeLink) {
      activeLink.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [pageNumber]);

    
  return (
    <div className="flex h-[calc(100vh-57px)] bg-neutral-950 text-neutral-100 relative">
      <SEO 
        title="Daily Gratitude & Math Meditations | Generative Art Journey"
        description="Discover a daily sanctuary of mathematical beauty and gratitude. Experience unique generative art, meditative quotes, and interactive geometry to calm your mind."
        keywords="math art, generative art, gratitude journal, meditation, mindfulness, creative coding, fractal art, daily quotes"
      />
      {/* Toggle Switch - Top Left */}
      <div className="absolute top-4 left-16 z-10 flex items-center gap-2 lg:gap-3">
        <span className={`text-xs lg:text-sm font-medium transition-colors ${!isAdvancedMode ? 'text-white' : 'text-neutral-500'}`}>
          Easy Going
        </span>
        <button
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className={`relative inline-flex h-5 w-9 lg:h-6 lg:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-950 ${
            isAdvancedMode ? 'bg-red-600' : 'bg-neutral-600'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 lg:h-4 lg:w-4 transform rounded-full bg-white transition-transform ${
              isAdvancedMode ? 'translate-x-5 lg:translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-xs lg:text-sm font-medium transition-colors ${isAdvancedMode ? 'text-red-400' : 'text-neutral-500'}`}>
          God Mode
        </span>
      </div>

      {/* Today Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <Link
          to="/today"
          className="px-1.5 py-1 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-md border border-neutral-700 hover:border-neutral-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          Today
        </Link>
      </div>

      <div ref={sidebarRef} className="w-12 flex flex-col items-center py-8 bg-neutral-950 border-r border-neutral-900 overflow-y-auto no-scrollbar">
        {quotes.map((quote, index) => {
          const pageNum = index + 1;
          return (
            <Link
              key={index}
              ref={el => pageLinkRefs.current[pageNum] = el}
              to={`/daily-quotes/${pageNum}`}
              className={`my-1 text-neutral-500 hover:text-white transition ${pageNumber === pageNum ? 'font-bold text-white' : ''}`}>
              {pageNum}
            </Link>
          );
        })}
      </div>
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto no-scrollbar"
        style={{
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth'
        }}
      >
        {quotes.map((quote, index) => {
          const pageNum = index + 1;
          return (
            <div
              key={index}
              className="h-[calc(100vh-57px)] flex items-center justify-center p-8"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-x-16">
                <div className={`flex-1 order-1 lg:order-1 ${!devMode ? (visiblePage === pageNum ? 'animate-fade-in-quote' : 'opacity-0') : 'opacity-100'}`}>
                  <p className="text-xl lg:text-2xl font-serif text-neutral-200 text-center px-4 lg:px-0">{quote}</p>
                </div>
                <div className={`flex-none w-[80vmin] h-[80vmin] lg:w-[90vmin] lg:h-[90vmin] max-w-[320px] lg:max-w-[448px] max-h-[320px] lg:max-h-[448px] order-2 lg:order-2 ${!devMode ? (visiblePage === pageNum ? 'animate-fade-in-visual' : 'opacity-0') : 'opacity-100'}`}>
                  <div className="w-full h-full rounded-2xl overflow-hidden">
                    <MathVisual 
                      quoteIndex={index} 
                      isVisible={visiblePage === pageNum}
                      onLoad={(loaded) => {
                        if (loaded && visiblePage === pageNum) {
                          setMathVisualLoaded(true);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyQuotes;
