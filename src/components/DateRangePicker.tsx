import { useState } from 'react';

interface DateRangePickerProps {
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
}

export const DateRangePicker = ({ onDateChange }: DateRangePickerProps) => {
  const [activeMonth, setActiveMonth] = useState<'current' | 'previous'>('current');

  const getCurrentMonthDates = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  };

  const getPreviousMonthDates = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start, end };
  };

  const handleMonthSelect = (month: 'current' | 'previous') => {
    setActiveMonth(month);
    const dates = month === 'current' ? getCurrentMonthDates() : getPreviousMonthDates();
    onDateChange(dates.start, dates.end);
  };

  const getMonthName = (offset: number = 0) => {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    return date.toLocaleString('de-DE', { month: 'long' });
  };

  return (
    <div className="flex space-x-3">
      <button
        className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
          activeMonth === 'previous'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => handleMonthSelect('previous')}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {getMonthName(-1)}
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
          activeMonth === 'current'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => handleMonthSelect('current')}
      >
        {getMonthName()}
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}; 