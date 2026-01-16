'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { uk, es, enUS } from 'date-fns/locale';

interface Class {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    subtype: string;
    maxCapacity: number;
    currentBookings: number;
    instructor: string;
    location: string;
    address?: string;
    price: number;
}

interface ClassCalendarProps {
    language: string;
}

export default function ClassCalendar({ language }: ClassCalendarProps) {
    const [date, setDate] = useState<Date>(new Date());
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchClasses();
    }, [date]);

    const getCalendarLocale = (): string => {
        switch (language) {
            case 'uk': return 'uk';
            case 'es': return 'es';
            default: return 'en-US';
        }
    };

    // Для date-fns (locale як об'єкт)
    const getDateFnsLocale = () => {
        switch (language) {
            case 'uk': return uk;
            case 'es': return es;
            default: return enUS;
        }
    };
    
    const fetchClasses = async () => {
        setIsLoading(true);
        const res = await fetch(`/api/classes?date=${date.toISOString()}`);
        const data = await res.json();
        setClasses(data);
        setIsLoading(false);
    };

    const getLocale = () => {
        switch (language) {
            case 'uk': return uk;
            case 'es': return es;
            default: return enUS;
        }
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dayClasses = classes.filter(c =>
                new Date(c.date).toDateString() === date.toDateString()
            );
            return dayClasses.length > 0 ? (
                <div className="flex justify-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
            ) : null;
        }
        return null;
    };

    const handleDateClick = async (value: Date) => {
        const res = await fetch(`/api/classes?date=${value.toISOString()}`);
        const dayClasses = await res.json();

        if (dayClasses.length > 0) {
            setSelectedClass(dayClasses[0]);
        }
    };

    return (
        <div className="p-4">
            <Calendar
                value={date}
                onChange={(value) => {
                    if (!value) return;

                    if (Array.isArray(value)) {
                        // Якщо масив або range, беремо першу дату
                        const first = value[0];
                        if (first instanceof Date) setDate(first);
                    } else if (value instanceof Date) {
                        setDate(value);
                    }
                }}
                locale={getCalendarLocale()} // <- рядок для Calendar
                tileContent={tileContent}
                onClickDay={handleDateClick}
            />

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">
                    {format(date, 'd MMMM yyyy', { locale: getDateFnsLocale() })}
                </h3>

                {isLoading ? (
                    <p>Завантаження...</p>
                ) : classes.length === 0 ? (
                    <p>На цей день немає занять</p>
                ) : (
                    <div className="space-y-4">
                        {classes.map((classItem) => (
                            <div
                                key={classItem.id}
                                className="p-4 border rounded-lg hover:shadow-md cursor-pointer"
                                onClick={() => setSelectedClass(classItem)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold">{classItem.type} - {classItem.subtype}</h4>
                                        <p className="text-gray-600">{classItem.startTime} - {classItem.endTime}</p>
                                        <p className="text-gray-600">{classItem.instructor}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{classItem.price}€</p>
                                        <p className="text-sm">{classItem.currentBookings}/{classItem.maxCapacity} місць</p>
                                        {classItem.currentBookings < classItem.maxCapacity ? (
                                            <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                                                Забронювати
                                            </button>
                                        ) : (
                                            <button className="mt-2 bg-gray-400 text-white px-4 py-1 rounded cursor-not-allowed">
                                                Заповнено
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedClass && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg max-w-md">
                        <h3 className="text-xl font-bold mb-4">Деталі заняття</h3>
                        <p><strong>Тип:</strong> {selectedClass.type}</p>
                        <p><strong>Підтип:</strong> {selectedClass.subtype}</p>
                        <p><strong>Час:</strong> {selectedClass.startTime} - {selectedClass.endTime}</p>
                        <p><strong>Тренер:</strong> {selectedClass.instructor}</p>
                        <p><strong>Локація:</strong> {selectedClass.location}</p>
                        <p><strong>Адреса:</strong> {selectedClass.address}</p>
                        <p><strong>Вартість:</strong> {selectedClass.price}€</p>
                        <p><strong>Вільні місця:</strong> {selectedClass.maxCapacity - selectedClass.currentBookings}</p>

                        <div className="mt-6 flex space-x-4">
                            <button
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                onClick={() => {/* Логіка бронювання */ }}
                            >
                                Записатись
                            </button>
                            <button
                                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                                onClick={() => setSelectedClass(null)}
                            >
                                Скасувати
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
