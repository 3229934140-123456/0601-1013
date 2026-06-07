import type { TrendData } from '@/types';

const generateTrendData = (days: number): TrendData[] => {
  const data: TrendData[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 800) + 400,
      favorites: Math.floor(Math.random() * 80) + 20,
    });
  }
  return data;
};

export const trendData7Days = generateTrendData(7);
export const trendData30Days = generateTrendData(30);
