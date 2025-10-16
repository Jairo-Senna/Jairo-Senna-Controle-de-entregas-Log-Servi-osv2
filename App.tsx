import React, { useState, useMemo, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import useTheme from './hooks/useTheme';
import { getMonthKey, getQuinzena } from './utils/dateUtils';
import { calculatePeriodTotals } from './utils/calculationUtils';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useLocalStorage('deliveryData', {});
  const [expenses, setExpenses] = useLocalStorage('fuelExpenses', {});
  const [theme, toggleTheme] = useTheme();

  // Exemplo de cálculo mínimo
  const { quinzenaTotals, monthlyTotals } = useMemo(() => {
    const today = new Date();
    const monthKey = getMonthKey(today);
    const monthData = data[monthKey] || {};
    const currentQuinzena = getQuinzena(today);
    const startDay = currentQuinzena === 1 ? 1 : 16;
    const endDay = currentQuinzena === 1 ? 15 : 31;

    const quinzenaEntries = [];
    const monthlyEntries = [];

    Object.entries(monthData).forEach(([day, entry]: any) => {
      monthlyEntries.push(entry);
      const dayNum = parseInt(day, 10);
      if (dayNum >= startDay && dayNum <= endDay) {
        quinzenaEntries.push(entry);
      }
    });

    return { 
      quinzenaTotals: calculatePeriodTotals(quinzenaEntries),
      monthlyTotals: calculatePeriodTotals(monthlyEntries),
    };
  }, [data]);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Controle de Entregas</h1>
      <p>Dados carregados: {Object.keys(data).length} dias</p>
      <p>Total quinzena: {JSON.stringify(quinzenaTotals)}</p>
      <p>Total mês: {JSON.stringify(monthlyTotals)}</p>
      <button onClick={toggleTheme}>
        Mudar tema (atual: {theme})
      </button>
    </div>
  );
};

export default App;
