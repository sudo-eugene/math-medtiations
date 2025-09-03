import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import quotes from '../../quotes.json';
import MathVisual from './MathVisual';

const BookPage = () => {
  const { day } = useParams();
  const navigate = useNavigate();
  const pageNumber = parseInt(day, 10);
  const scrollContainerRef = useRef(null);
  const sidebarRef = useRef(null);
  const pageLinkRefs = useRef({});
  const [visiblePage, setVisiblePage] = useState(pageNumber);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const [mathVisualLoaded, setMathVisualLoaded] = useState(false);

  if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > quotes.length) {
    return <Navigate to="/book/1" replace />;
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
          if (currentPage !== pageNumber) {
            navigate(`/book/${currentPage}`, { replace: true });
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
    <div className="flex h-[calc(100vh-57px)] bg-neutral-950 text-neutral-100">
      <div ref={sidebarRef} className="w-12 flex flex-col items-center py-8 bg-neutral-950 border-r border-neutral-900 overflow-y-auto no-scrollbar">
        {quotes.map((q) => (
          <Link
            key={q.id}
            ref={el => pageLinkRefs.current[q.id] = el}
            to={`/book/${q.id}`}
            className={`my-1 text-neutral-500 hover:text-white transition ${pageNumber === q.id ? 'font-bold text-white' : ''}`}>

            {q.id}
          </Link>
        ))}
      </div>
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto no-scrollbar"
        style={{
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth'
        }}
      >
        {quotes.map((quote, index) => (
          <div
            key={quote.id}
            className="h-[calc(100vh-57px)] flex items-center justify-center p-8"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="w-full max-w-5xl flex items-center justify-center gap-x-16">
              <div className={`flex-1 ${visiblePage === quote.id ? 'animate-fade-in-quote' : 'opacity-0'}`}>
                <p className="text-2xl font-serif text-neutral-200 text-center">{quote.quote}</p>
              </div>
              <div className={`flex-1 ${visiblePage === quote.id ? 'animate-fade-in-visual' : 'opacity-0'}`}>
                <div className="w-full aspect-square rounded-2xl overflow-hidden">
                  <MathVisual 
                    quoteId={quote.id} 
                    isVisible={visiblePage === quote.id}
                    onLoad={(loaded) => {
                      if (loaded && visiblePage === quote.id) {
                        setMathVisualLoaded(true);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookPage;
