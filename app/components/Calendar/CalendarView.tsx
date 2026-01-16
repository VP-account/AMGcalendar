'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parseISO, isToday, isPast, addDays } from 'date-fns';
import { uk } from 'date-fns/locale';
import { storage, type Class } from '@/app/lib/storage';
import BookingModal from './BookingModal';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarView() {
    const [date, setDate] = useState<Value>(new Date());
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Завантажуємо заняття на наступні 14 днів
        const allClasses = storage.getClasses();
        const futureClasses = allClasses.filter(cls => {
            const classDate = parseISO(cls.date);
            return !isPast(addDays(classDate, 1)); // +1 день для сьогоднішніх занять
        });
        setClasses(futureClasses);
    }, []);

    const getClassesForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return classes.filter(cls => cls.date === dateStr);
    };

    const handleDateClick = (value: Date) => {
        const dateClasses = getClassesForDate(value);
        if (dateClasses.length > 0) {
            setSelectedClass(dateClasses[0]);
            setShowModal(true);
        }
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dateClasses = getClassesForDate(date);
            const availableClasses = dateClasses.filter(cls => cls.currentBookings < cls.maxCapacity);

            if (dateClasses.length > 0) {
                return (
                    <div className="mt-1 flex justify-center">
                        <div className={`w-2 h-2 rounded-full ${availableClasses.length > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                    </div>
                );
            }
        }
        return null;
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            if (isToday(date)) return 'bg-indigo-50 !text-indigo-700 font-bold';

            const dateClasses = getClassesForDate(date);
            if (dateClasses.length > 0) {
                const hasAvailable = dateClasses.some(cls => cls.currentBookings < cls.maxCapacity);
                return hasAvailable ? 'hover:bg-green-50 cursor-pointer' : 'opacity-60';
            }
        }
        return '';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Календар */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <Calendar
                    onChange={setDate}
                    value={date}
                    locale="uk-UA"
                    tileContent={tileContent}
                    tileClassName={tileClassName}
                    onClickDay={handleDateClick}
                    minDate={new Date()}
                    className="!w-full !border-0"
                />
            </div>

            {/* Список занять на обраний день */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4">
                    {date instanceof Date ? format(date, 'd MMMM yyyy', { locale: uk }) : 'Оберіть дату'}
                </h3>

                {date instanceof Date ? (
                    <div className="space-y-4">
                        {(() => {
                            const dateClasses = getClassesForDate(date);

                            if (dateClasses.length === 0) {
                                return (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>На цей день немає занять</p>
                                    </div>
                                );
                            }

                            return dateClasses.map((cls) => (
                                <div
                                    key={cls.id}
                                    className={`p-4 rounded-lg border ${cls.currentBookings >= cls.maxCapacity
                                            ? 'border-red-200 bg-red-50'
                                            : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                                        }`}
                                    onClick={() => {
                                        setSelectedClass(cls);
                                        setShowModal(true);
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{cls.subtype}</h4>
                                            <p className="text-sm text-gray-600">
                                                🕐 {cls.startTime} - {cls.endTime}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                👩‍🏫 {cls.instructor}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-indigo-600">{cls.price}€</p>
                                            <p className={`text-sm ${cls.currentBookings >= cls.maxCapacity
                                                    ? 'text-red-600'
                                                    : 'text-green-600'
                                                }`}>
                                                {cls.currentBookings}/{cls.maxCapacity} місць
                                            </p>
                                        </div>
                                    </div>

                                    {cls.currentBookings >= cls.maxCapacity && (
                                        <div className="mt-2 text-sm text-red-600">
                                            ⚠️ Заповнено
                                        </div>
                                    )}
                                </div>
                            ));
                        })()}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>Оберіть дату в календарі</p>
                    </div>
                )}
            </div>

            {/* Модалка бронювання */}
            {selectedClass && (
                <BookingModal
                    classItem={selectedClass}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        // Оновлюємо список занять після бронювання
                        const updatedClasses = storage.getClasses();
                        setClasses(updatedClasses.filter(cls => {
                            const classDate = parseISO(cls.date);
                            return !isPast(addDays(classDate, 1));
                        }));
                    }}
                />
            )}
        </div>
    );
}