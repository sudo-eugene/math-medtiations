import { Navigate } from 'react-router-dom';
import easyQuotes from '../../quotes-easy.json';

const TodayRedirect = () => {
  const getCurrentDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const today = getCurrentDayOfYear();
  const targetDay = Math.min(today, easyQuotes.length);

  return <Navigate to={`/daily-quotes/${targetDay}`} replace />;
};

export default TodayRedirect;
