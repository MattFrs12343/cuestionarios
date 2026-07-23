import { useState, useEffect, useRef } from 'react';

export default function BirthDateSelectInput({ 
    value, 
    onChange, 
    required = false, 
    error = null 
}) {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const isInternalChange = useRef(false);

    // Parsear valor inicial solo cuando viene del exterior
    useEffect(() => {
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }
        
        if (value) {
            const date = new Date(value + 'T00:00:00');
            if (!isNaN(date.getTime())) {
                setDay(String(date.getDate()).padStart(2, '0'));
                setMonth(String(date.getMonth() + 1).padStart(2, '0'));
                setYear(String(date.getFullYear()));
            }
        } else {
            setDay('');
            setMonth('');
            setYear('');
        }
    }, [value]);

    // Función para actualizar el valor
    const updateValue = (newDay, newMonth, newYear) => {
        if (newDay && newMonth && newYear && newYear.length === 4) {
            const dateString = `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`;
            isInternalChange.current = true;
            onChange(dateString);
        } else if (!newDay && !newMonth && !newYear) {
            isInternalChange.current = true;
            onChange('');
        }
    };

    const handleDayChange = (newDay) => {
        setDay(newDay);
        updateValue(newDay, month, year);
    };

    const handleMonthChange = (newMonth) => {
        setMonth(newMonth);
        updateValue(day, newMonth, year);
    };

    const handleYearChange = (newYear) => {
        setYear(newYear);
        updateValue(day, month, newYear);
    };

    // Siempre usar los 3 selectores en todos los dispositivos
    const currentYear = new Date().getFullYear();

    const months = [
        { value: '01', label: 'Janeiro' },
        { value: '02', label: 'Fevereiro' },
        { value: '03', label: 'Março' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Maio' },
        { value: '06', label: 'Junho' },
        { value: '07', label: 'Julho' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Setembro' },
        { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' },
        { value: '12', label: 'Dezembro' }
    ];

    const getDaysInMonth = (m, y) => {
        if (!m || !y) return 31;
        return new Date(parseInt(y), parseInt(m), 0).getDate();
    };

    // Generar años desde 1900 hasta el año actual
    const years = [];
    for (let y = currentYear; y >= 1900; y--) {
        years.push(y);
    }

    return (
        <div className="grid grid-cols-3 gap-2">
            {/* Día */}
            <select
                value={day}
                onChange={(e) => handleDayChange(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 text-sm py-2"
                required={required}
            >
                <option value="">Dia</option>
                {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => {
                    const dayNum = String(i + 1).padStart(2, '0');
                    return (
                        <option key={dayNum} value={dayNum}>
                            {dayNum}
                        </option>
                    );
                })}
            </select>

            {/* Mes */}
            <select
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 text-sm py-2"
                required={required}
            >
                <option value="">Mês</option>
                {months.map(m => (
                    <option key={m.value} value={m.value}>
                        {m.label}
                    </option>
                ))}
            </select>

            {/* Año */}
            <select
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition-colors duration-200 text-sm py-2"
                required={required}
            >
                <option value="">Ano</option>
                {years.map(y => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );
}