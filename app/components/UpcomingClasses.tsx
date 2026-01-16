'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage, type Booking, type Class } from '@/app/lib/storage';

interface UpcomingClassesProps {
    bookings: Booking[];
}

export default function UpcomingClasses({ bookings }: UpcomingClassesProps) {
    const [upcomingBookings, setUpcomingBookings] = useState<Array<Booking & { classDetails?: Class }>>([]);

    useEffect(() => {
        const activeBookings = bookings
            .filter(b => b.status === 'booked')
            .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
            .slice(0, 3);

        const enrichedBookings = activeBookings.map(booking => {
            const classes = storage.getClasses();
            const classDetails = classes.find(c => c.id === booking.classId);
            return { ...booking, classDetails };
        }).filter(b => b.classDetails);

        setUpcomingBookings(enrichedBookings);
    }, [bookings]);

    const handleCancelBooking = (bookingId: string) => {
        if (confirm('Ви впевнені, що хочете скасувати бронювання?')) {
            storage.updateBooking(bookingId, { status: 'cancelled' });

            // Оновлюємо список
            const updatedBookings = bookings.filter(b => b.id !== bookingId);
            setUpcomingBookings(upcomingBookings.filter(b => b.id !== bookingId));

            alert('Бронювання скасовано');
        }
    };

    if (upcomingBookings.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Майбутні заняття</h2>
                    <Link
                        href="/calendar"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                        Забронювати заняття →
                    </Link>
                </div>
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">📅</div>
                    <p className="text-gray-600">У вас немає майбутніх занять</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Майбутні заняття</h2>
                <Link
                    href="/calendar"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                    Всі заняття →
                </Link>
            </div>

            <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="bg-indigo-50 p-3 rounded-lg">
                                <div className="text-indigo-600 font-bold">
                                    {booking.classDetails?.date.split('-')[2]}
                                </div>
                                <div className="text-indigo-600 text-xs">
                                    {new Date(booking.classDetails?.date || '').toLocaleDateString('uk-UA', { month: 'short' })}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800">
                                    {booking.classDetails?.subtype}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="inline-block mr-3">🕐 {booking.classDetails?.startTime}</span>
                                    <span className="inline-block">👩‍🏫 {booking.classDetails?.instructor}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Заброньовано: {new Date(booking.bookingDate).toLocaleDateString('uk-UA')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className="font-bold text-indigo-600">
                                {booking.classDetails?.price}€
                            </span>
                            <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Скасувати
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}