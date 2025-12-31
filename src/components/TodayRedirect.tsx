import DailyQuotes from './DailyQuotes';
import easyQuotes from '../../quotes-easy.json';

const getCurrentDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const TodayPage = () => {
  const today = getCurrentDayOfYear();
  const targetDay = Math.min(today, easyQuotes.length);

  return <DailyQuotes initialDay={targetDay} />;
};

export default TodayPage;
