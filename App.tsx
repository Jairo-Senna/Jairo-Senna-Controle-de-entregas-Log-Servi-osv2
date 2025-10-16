import React, { useState, useMemo } from 'react';

type DailyEntry = {
  deliveries: number;
  earnings: number;
};

// Funções utilitárias internas
const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`;
const getQuinzena = (date: Date) => (date.getDate() <= 15 ? 1 : 2);
const calculatePeriodTotals = (entries: DailyEntry[]) => {
  return entries.reduce(
    (acc, entry) => {
      acc.deliveries += entry.deliveries;
      acc.earnings += entry.earnings;
      return acc;
    },
    { deliveries: 0, earnings: 0 }
  );
};

const App: React.FC = () => {
  const [selectedDate] = useState(new Date());
  const [data] = useState<{ [monthKey: string]: { [day: number]: DailyEntry } }>({
    '2025-10': {
      1: { deliveries: 5, earnings: 50 },
      2: { deliveries: 3, earnings: 30 },
    },
  });

  const { quinzenaTotals, monthlyTotals } = useMemo(() => {
    const monthKey = getMonthKey(selectedDate);
    const monthData = data[monthKey] || {};
    const currentQuinzena = getQuinzena(selectedDate);

    const quinzenaEntries: DailyEntry[] = [];
    const monthlyEntries: DailyEntry[] = [];

    Object.entries(monthData).forEach(([day, entry]: any) => {
      monthlyEntries.push(entry);
      const dayNum = parseInt(day, 10);
      if (currentQuinzena === 1 && dayNum <= 15) quinzenaEntries.push(entry);
      if (currentQuinzena === 2 && dayNum > 15) quinzenaEntries.push(entry);
    });

    return {
      quinzenaTotals: calculatePeriodTotals(quinzenaEntries),
      monthlyTotals: calculatePeriodTotals(monthlyEntries),
    };
  }, [selectedDate, data]);

  return (
    <div className="min-h-screen p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-4">Controle de Entregas</h1>
      <p>Quinzena: {JSON.stringify(quinzenaTotals)}</p>
      <p>Mês: {JSON.stringify(monthlyTotals)}</p>
    </div>
  );
};

export default App;

