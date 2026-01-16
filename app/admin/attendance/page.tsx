'use client';

import { useState, useEffect } from 'react';
import { storage, Class, Booking } from '@/app/lib/storage';
import Link from 'next/link';

export default function AttendancePage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'attended' | 'no-show'>>({});

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = () => {
        const allClasses = storage.getClasses();
        const allBookings = storage.getBookings();

        // Фільтруємо заняття на вибрану дату
        const todayClasses = allClasses.filter(cls => cls.date === selectedDate);

        setClasses(todayClasses);
        setBookings(allBookings);

        // Завантажуємо попередні записи про присутність
        const records: Record<string, 'attended' | 'no-show'> = {};
        allBookings.forEach(booking => {
            if (booking.status === 'attended' || booking.status === 'no-show') {
                records[booking.id] = booking.status;
            }
        });
        setAttendanceRecords(records);
    };

    const handleAttendanceChange = (bookingId: string, status: 'attended' | 'no-show') => {
        setAttendanceRecords(prev => ({
            ...prev,
            [bookingId]: status
        }));

        // Оновлюємо статус в storage
        storage.updateBooking(bookingId, { status });

        // Якщо присутність підтверджена, зменшуємо кількість занять у користувача
        if (status === 'attended') {
            const booking = bookings.find(b => b.id === bookingId);
            if (booking) {
                const user = storage.getUser();
                if (user && user.id === booking.userId) {
                    storage.updateUser({
                        remainingClasses: Math.max(0, (user.remainingClasses || 0) - 1),
                        visits: [...(user.visits || []), booking.classId]
                    });
                }
            }
        }
    };

    const saveAllAttendance = () => {
        alert('Успішно збережено!');
        loadData();
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Заголовок */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                    Підтвердження присутності
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    Відмічайте присутність клієнтів на заняттях
                </p>
            </div>

            {/* Вибір дати */}
            <div className="bg-[var(--color-surface)] rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                            Оберіть дату
                        </h2>
                        <p className="text-[var(--color-text-secondary)] text-sm">
                            Перегляньте заняття для відмітки присутності
                        </p>
                    </div>
                    <div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {classes.length === 0 ? (
                <div className="bg-[var(--color-surface)] rounded-xl shadow-lg p-8 text-center">
                    <div className="text-4xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                        Немає занять на цю дату
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                        Оберіть іншу дату або створіть нові заняття в розкладі
                    </p>
                    <Link
                        href="/admin/schedule"
                        className="inline-block bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                    >
                        Перейти до розкладу
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {classes.map(cls => {
                        const classBookings = bookings.filter(b => b.classId === cls.id && b.status === 'booked');
                        const attendedCount = classBookings.filter(b => attendanceRecords[b.id] === 'attended').length;

                        return (
                            <div key={cls.id} className="bg-[var(--color-surface)] rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                                                {cls.subtype}
                                            </h3>
                                            <p className="text-[var(--color-text-secondary)]">
                                                {formatTime(cls.startTime)} - {formatTime(cls.endTime)} | {cls.instructor} | {cls.location}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-[var(--color-text-secondary)]">
                                                Заброньовано
                                            </div>
                                            <div className="text-lg font-bold text-[var(--color-text-primary)]">
                                                {classBookings.length}/{cls.maxCapacity}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {classBookings.length === 0 ? (
                                        <div className="text-center py-8 text-[var(--color-text-secondary)]">
                                            Немає бронювань на це заняття
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                                {classBookings.map(booking => {
                                                    const isAttended = attendanceRecords[booking.id] === 'attended';
                                                    const isNoShow = attendanceRecords[booking.id] === 'no-show';

                                                    return (
                                                        <div
                                                            key={booking.id}
                                                            className={`border rounded-lg p-4 ${isAttended
                                                                    ? 'border-[var(--color-success)] bg-[var(--color-success-bg)]'
                                                                    : isNoShow
                                                                        ? 'border-[var(--color-error)] bg-[var(--color-error-bg)]'
                                                                        : 'border-[var(--color-border)] bg-white'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <div className="font-medium text-[var(--color-text-primary)]">
                                                                        Користувач #{booking.userId.slice(-6)}
                                                                    </div>
                                                                    <div className="text-sm text-[var(--color-text-secondary)]">
                                                                        Заброньовано: {new Date(booking.bookingDate).toLocaleTimeString('uk-UA', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm">
                                                                    {isAttended && (
                                                                        <span className="text-[var(--color-success)] font-medium">✅ Присутній</span>
                                                                    )}
                                                                    {isNoShow && (
                                                                        <span className="text-[var(--color-error)] font-medium">❌ Не прийшов</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleAttendanceChange(booking.id, 'attended')}
                                                                    className={`flex-1 py-2 rounded text-sm font-medium ${isAttended
                                                                            ? 'bg-[var(--color-success)] text-white'
                                                                            : 'bg-[var(--color-success-bg)] text-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white'
                                                                        } transition-colors`}
                                                                >
                                                                    Присутній
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAttendanceChange(booking.id, 'no-show')}
                                                                    className={`flex-1 py-2 rounded text-sm font-medium ${isNoShow
                                                                            ? 'bg-[var(--color-error)] text-white'
                                                                            : 'bg-[var(--color-error-bg)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white'
                                                                        } transition-colors`}
                                                                >
                                                                    Не прийшов
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
                                                <div className="text-sm text-[var(--color-text-secondary)]">
                                                    Підтверджено: {attendedCount} з {classBookings.length}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        // Автоматично відмітити всіх як присутніх
                                                        classBookings.forEach(booking => {
                                                            if (!attendanceRecords[booking.id]) {
                                                                handleAttendanceChange(booking.id, 'attended');
                                                            }
                                                        });
                                                    }}
                                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                                >
                                                    Відмітити всіх присутніми
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Кнопка збереження */}
                    <div className="sticky bottom-6">
                        <div className="bg-[var(--color-surface)] rounded-xl shadow-lg p-6 border border-[var(--color-border)]">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold text-[var(--color-text-primary)]">
                                        Зберегти зміни
                                    </h4>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        Збережіть всі зміни присутності
                                    </p>
                                </div>
                                <button
                                    onClick={saveAllAttendance}
                                    className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
                                >
                                    💾 Зберегти всі зміни
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Статистика за день */}
            <div className="mt-8 bg-[var(--color-surface)] rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                    Статистика за {new Date(selectedDate).toLocaleDateString('uk-UA')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-[var(--color-border)] rounded-lg">
                        <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                            {classes.length}
                        </div>
                        <div className="text-sm text-[var(--color-text-secondary)]">
                            Занять
                        </div>
                    </div>
                    <div className="text-center p-4 border border-[var(--color-border)] rounded-lg">
                        <div className="text-2xl font-bold text-[var(--color-success)]">
                            {Object.values(attendanceRecords).filter(s => s === 'attended').length}
                        </div>
                        <div className="text-sm text-[var(--color-text-secondary)]">
                            Підтверджених присутніх
                        </div>
                    </div>
                    <div className="text-center p-4 border border-[var(--color-border)] rounded-lg">
                        <div className="text-2xl font-bold text-[var(--color-error)]">
                            {Object.values(attendanceRecords).filter(s => s === 'no-show').length}
                        </div>
                        <div className="text-sm text-[var(--color-text-secondary)]">
                            Не прийшли
                        </div>
                    </div>
                </div>
            </div>
        </div> 
    );
}