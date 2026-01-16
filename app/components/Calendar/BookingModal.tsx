'use client';

import { useState } from 'react';
import { storage, type Class } from '@/app/lib/storage';

interface BookingModalProps {
    classItem: Class;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BookingModal({ classItem, isOpen, onClose, onSuccess }: BookingModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notes, setNotes] = useState('');

    const user = storage.getUser();

    const handleBooking = () => {
        if (!user) {
            setError('Будь ласка, увійдіть в акаунт');
            return;
        }

        setLoading(true);
        setError('');

        // Перевірка активного абонементу
        const subscriptions = storage.getSubscriptionsByUser(user.id);
        const activeSubscription = subscriptions.find(
            sub => sub.status === 'active' && sub.remaining > 0
        );

        if (!activeSubscription) {
            setError('У вас немає активного абонементу');
            setLoading(false);
            return;
        }

        // Перевірка вільних місць
        if (classItem.currentBookings >= classItem.maxCapacity) {
            setError('На жаль, вільних місць немає');
            setLoading(false);
            return;
        }

        try {
            // Створення бронювання
            storage.saveBooking({
                userId: user.id,
                classId: classItem.id,
                status: 'booked',
                bookingDate: new Date().toISOString(),
                notes: notes.trim() || undefined
            });

            // Оновлення кількості бронювань
            storage.updateClass(classItem.id, {
                currentBookings: classItem.currentBookings + 1
            });

            // Оновлення абонементу
            const updatedSubscriptions = storage.getSubscriptions();
            const subIndex = updatedSubscriptions.findIndex(sub => sub.id === activeSubscription.id);
            if (subIndex !== -1) {
                updatedSubscriptions[subIndex].remaining -= 1;
                localStorage.setItem('pilates_subscriptions', JSON.stringify(updatedSubscriptions));
            }

            onSuccess();
            onClose();

            // Повідомлення про успіх
            alert('Ви успішно забронювали заняття!');
        } catch (err) {
            setError('Помилка при бронюванні');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Заголовок */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Бронювання заняття</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Деталі заняття */}
                    <div className="space-y-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-lg text-gray-800">{classItem.subtype}</h4>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                <div>
                                    <span className="text-gray-600">📅 Дата:</span>
                                    <p className="font-medium">{classItem.date}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">🕐 Час:</span>
                                    <p className="font-medium">{classItem.startTime} - {classItem.endTime}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">👩‍🏫 Тренер:</span>
                                    <p className="font-medium">{classItem.instructor}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">💰 Ціна:</span>
                                    <p className="font-medium text-indigo-600">{classItem.price}€</p>
                                </div>
                            </div>
                        </div>

                        {/* Інформація про користувача */}
                        {user && (
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <p className="font-medium">Ви бронюєте як:</p>
                                <p className="text-indigo-700">{user.name || user.email}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {(() => {
                                        const subscriptions = storage.getSubscriptionsByUser(user.id);
                                        const activeSub = subscriptions.find(sub => sub.status === 'active');
                                        return activeSub
                                            ? `Залишок занять: ${activeSub.remaining}`
                                            : 'Немає активного абонементу';
                                    })()}
                                </p>
                            </div>
                        )}

                        {/* Додаткові нотатки */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Додаткові нотатки (необов'язково)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                rows={3}
                                placeholder="Особливі потреби, травми тощо..."
                            />
                        </div>
                    </div>

                    {/* Помилка */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Кнопки */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Скасувати
                        </button>
                        <button
                            onClick={handleBooking}
                            disabled={loading || classItem.currentBookings >= classItem.maxCapacity}
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Бронювання...' : 'Забронювати'}
                        </button>
                    </div>

                    {/* Умови */}
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Скасування можливе за 24 години до початку заняття
                    </p>
                </div>
            </div>
        </div>
    );
}