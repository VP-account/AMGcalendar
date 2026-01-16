'use client';

import { type User, type Booking, type Subscription } from '@/app/lib/storage';

interface DashboardStatsProps {
    user: User;
    bookings: Booking[];
    subscriptions: Subscription[];
}

export default function DashboardStats({ user, bookings, subscriptions }: DashboardStatsProps) {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const upcomingBookings = bookings.filter(b => b.status === 'booked');
    const pastBookings = bookings.filter(b => b.status === 'attended' || b.status === 'cancelled');

    // Знаходимо найближчий активний абонемент
    const activeSubscription = activeSubscriptions[0];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Активний абонемент */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Активний абонемент</h3>
                {activeSubscription ? (
                    <>
                        <p className="text-2xl font-bold mb-1">
                            {activeSubscription.remaining} / {activeSubscription.duration}
                        </p>
                        <p className="text-indigo-100 text-sm">
                            Залишок занять
                        </p>
                        {activeSubscription.endDate && (
                            <p className="text-indigo-200 text-xs mt-2">
                                Діє до: {new Date(activeSubscription.endDate).toLocaleDateString('uk-UA')}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-xl font-bold">Немає активного</p>
                )}
            </div>

            {/* Майбутні заняття */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Майбутні заняття</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{upcomingBookings.length}</p>
                <p className="text-gray-600 text-sm">Заплановано</p>
            </div>

            {/* Пройдені заняття */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Пройдені заняття</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{pastBookings.length}</p>
                <p className="text-gray-600 text-sm">В історії</p>
            </div>
        </div>
    );
}