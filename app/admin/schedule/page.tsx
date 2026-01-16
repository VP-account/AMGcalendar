'use client';

import { useState, useEffect } from 'react';
import { storage, Class } from '@/app/lib/storage';
import Link from 'next/link';

// Реальні дані про тренера та студію
const STUDIO_INFO = {
    name: "AMG Pilates Studio",
    address: "Carrer de la Ciutat de Reus, 28, 43840 Salou, Tarragona",
    instructor: "AMG Pilates",
    maxCapacity: {
        group: 7,           // Груповий до 7 осіб
        semiprivate: 3,     // Напівприватний до 3 осіб
        private: 1          // Приватний 1 особа
    }
};

// Типи занять для студії AMG
const CLASS_TYPES = [
    { value: 'group_matwork', label: 'Grupos Pilates Matwork 7', type: 'group', max: 7, price: 10 },
    { value: 'group_7_1', label: 'Grupos 7\\1', type: 'group', max: 7, price: 10 },
    { value: 'group_spine', label: 'Grupos Spine Corrector 7', type: 'group', max: 7, price: 10 },
    { value: 'group_reformer', label: 'Grupos Reformer 3', type: 'semiprivate', max: 3, price: 35 },
    { value: 'private', label: 'Sesión en pareja o privada', type: 'private', max: 2, price: 50 },
    { value: 'duo_reformer', label: 'Reformer duo', type: 'semiprivate', max: 2, price: 50 },
    { value: 'reformer', label: 'Reformer', type: 'semiprivate', max: 3, price: 35 }
] as const;

export default function SchedulePage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');

    // Форма даних з реальними значеннями за замовчуванням
    const [formData, setFormData] = useState({
        dayOfWeek: 'monday',
        startTime: '09:30',
        endTime: '10:30',
        classType: 'group_matwork',
        maxCapacity: 7,
        currentBookings: 0,
        instructor: STUDIO_INFO.instructor,
        location: STUDIO_INFO.name,
        address: STUDIO_INFO.address,
        price: 10,
        description: ''
    });

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = () => {
        const loadedClasses = storage.getClasses();

        // Сортуємо за днем тижня та часом
        const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const sortedClasses = loadedClasses.sort((a, b) => {
            const dayA = weekDays.indexOf(a.date.split('-')[0] || '');
            const dayB = weekDays.indexOf(b.date.split('-')[0] || '');
            if (dayA !== dayB) return dayA - dayB;
            return a.startTime.localeCompare(b.startTime);
        });

        setClasses(sortedClasses);
        setIsLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Оновлюємо maxCapacity при зміні типу заняття
        if (name === 'classType') {
            const selectedClassType = CLASS_TYPES.find(c => c.value === value);
            if (selectedClassType) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    maxCapacity: selectedClassType.max,
                    price: selectedClassType.price
                }));
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: name === 'maxCapacity' || name === 'currentBookings' || name === 'price'
                ? parseInt(value) || 0
                : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Валідація
        if (!formData.startTime || !formData.endTime) {
            alert('Заповніть час початку та закінчення');
            return;
        }

        // Обираємо тип заняття
        const selectedClassType = CLASS_TYPES.find(c => c.value === formData.classType);
        if (!selectedClassType) {
            alert('Оберіть тип заняття');
            return;
        }

        // Формуємо ID з днем тижня та часом
        const classId = `${formData.dayOfWeek}-${formData.startTime.replace(':', '')}-${Date.now().toString().slice(-4)}`;

        const newClass: Class = {
            id: editingClass ? editingClass.id : classId,
            date: formData.dayOfWeek, // Зберігаємо день тижня як дату для сортування
            startTime: formData.startTime,
            endTime: formData.endTime,
            type: selectedClassType.type as 'group' | 'private' | 'semiprivate',
            subtype: selectedClassType.label,
            maxCapacity: formData.maxCapacity,
            currentBookings: formData.currentBookings,
            instructor: formData.instructor,
            location: formData.location,
            address: formData.address,
            price: formData.price,
            description: formData.description,
            waitingList: []
        };

        if (editingClass) {
            storage.updateClass(newClass.id, newClass);
        } else {
            const allClasses = [...classes, newClass];
            storage.saveClasses(allClasses);
        }

        loadClasses();
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            dayOfWeek: 'monday',
            startTime: '09:30',
            endTime: '10:30',
            classType: 'group_matwork',
            maxCapacity: 7,
            currentBookings: 0,
            instructor: STUDIO_INFO.instructor,
            location: STUDIO_INFO.name,
            address: STUDIO_INFO.address,
            price: 10,
            description: ''
        });
        setEditingClass(null);
        setShowForm(false);
    };

    const editClass = (cls: Class) => {
        const classType = CLASS_TYPES.find(c => c.label === cls.subtype) || CLASS_TYPES[0];

        setFormData({
            dayOfWeek: cls.date,
            startTime: cls.startTime,
            endTime: cls.endTime,
            classType: classType.value,
            maxCapacity: cls.maxCapacity,
            currentBookings: cls.currentBookings,
            instructor: cls.instructor,
            location: cls.location,
            address: cls.address,
            price: cls.price,
            description: cls.description || ''
        });
        setEditingClass(cls);
        setShowForm(true);
    };

    const deleteClass = (id: string) => {
        if (confirm('Ви впевнені, що хочете видалити це заняття?')) {
            const updatedClasses = classes.filter(cls => cls.id !== id);
            storage.saveClasses(updatedClasses);
            loadClasses();
        }
    };

    const duplicateClass = (cls: Class) => {
        const newClass = {
            ...cls,
            id: `${cls.date}-${cls.startTime.replace(':', '')}-${Date.now().toString().slice(-4)}`,
            currentBookings: 0,
            waitingList: []
        };

        const allClasses = [...classes, newClass];
        storage.saveClasses(allClasses);
        loadClasses();
    };

    // Фільтрація
    const filteredClasses = classes.filter(cls => {
        if (selectedDay !== 'all' && cls.date !== selectedDay) return false;
        if (selectedType !== 'all') {
            const classType = CLASS_TYPES.find(c => c.label === cls.subtype);
            if (!classType || classType.type !== selectedType) return false;
        }
        return true;
    });

    // Статистика
    const stats = {
        total: classes.length,
        group: classes.filter(c => c.type === 'group').length,
        private: classes.filter(c => c.type === 'private').length,
        semiprivate: classes.filter(c => c.type === 'semiprivate').length,
        bookedSeats: classes.reduce((sum, c) => sum + c.currentBookings, 0),
        totalSeats: classes.reduce((sum, c) => sum + c.maxCapacity, 0),
        estimatedRevenue: classes.reduce((sum, c) => sum + (c.price * c.currentBookings), 0)
    };

    // Дні тижня
    const weekDays = [
        { value: 'monday', label: 'Понеділок' },
        { value: 'tuesday', label: 'Вівторок' },
        { value: 'wednesday', label: 'Середа' },
        { value: 'thursday', label: 'Четвер' },
        { value: 'friday', label: 'П\'ятниця' }
    ];

    const getDayLabel = (dayValue: string) => {
        const day = weekDays.find(d => d.value === dayValue);
        return day ? day.label : dayValue;
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-[var(--color-text-secondary)]">
                    Завантаження розкладу...
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Заголовок з інфо студії */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                    Розклад AMG Pilates Studio
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    {STUDIO_INFO.address} | Тренер: {STUDIO_INFO.instructor}
                </p>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow">
                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">Всього занять</div>
                    <div className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</div>
                </div>
                <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow">
                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">Заброньовано</div>
                    <div className="text-2xl font-bold text-[var(--color-success)]">
                        {stats.bookedSeats}/{stats.totalSeats}
                    </div>
                </div>
                <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow">
                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">Групові (до 7)</div>
                    <div className="text-2xl font-bold text-[var(--color-primary)]">{stats.group}</div>
                </div>
                <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow">
                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">Очікуваний дохід</div>
                    <div className="text-2xl font-bold text-[var(--color-accent)]">{stats.estimatedRevenue}€</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Бічна панель */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Фільтри */}
                    <div className="bg-[var(--color-surface)] rounded-xl shadow-lg p-6">
                        <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Фільтри</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                    День тижня
                                </label>
                                <select
                                    value={selectedDay}
                                    onChange={(e) => setSelectedDay(e.target.value)}
                                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                >
                                    <option value="all">Всі дні</option>
                                    {weekDays.map(day => (
                                        <option key={day.value} value={day.value}>
                                            {day.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                    Тип заняття
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                >
                                    <option value="all">Всі типи</option>
                                    <option value="group">Групові (до 7)</option>
                                    <option value="private">Приватні</option>
                                    <option value="semiprivate">Напівприватні (2-3)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Форма */}
                    <div className="bg-[var(--color-surface)] rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-[var(--color-text-primary)]">
                                {editingClass ? 'Редагувати заняття' : 'Нове заняття'}
                            </h3>
                            {showForm && (
                                <button
                                    onClick={resetForm}
                                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {!showForm ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full bg-[var(--color-primary)] text-[var(--color-text-on-primary)] py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
                            >
                                + Додати заняття
                            </button>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                        День тижня *
                                    </label>
                                    <select
                                        name="dayOfWeek"
                                        value={formData.dayOfWeek}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                        required
                                    >
                                        {weekDays.map(day => (
                                            <option key={day.value} value={day.value}>
                                                {day.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                            Початок *
                                        </label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                            Кінець *
                                        </label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                        Тип заняття *
                                    </label>
                                    <select
                                        name="classType"
                                        value={formData.classType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                        required
                                    >
                                        {CLASS_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label} ({type.max} осіб) - {type.price}€
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                        Заброньовано місць
                                    </label>
                                    <input
                                        type="number"
                                        name="currentBookings"
                                        value={formData.currentBookings}
                                        onChange={handleInputChange}
                                        min="0"
                                        max={formData.maxCapacity}
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                        Ціна (€) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="5"
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                        Опис
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="Додатковий опис..."
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-[var(--color-primary)] text-[var(--color-text-on-primary)] py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
                                    >
                                        {editingClass ? 'Оновити заняття' : 'Додати заняття'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Основна таблиця */}
                <div className="lg:col-span-3">
                    <div className="bg-[var(--color-surface)] rounded-xl shadow-lg overflow-hidden mb-6">
                        <div className="p-6 border-b border-[var(--color-border)]">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                    Розклад занять
                                </h2>
                                <span className="text-sm text-[var(--color-text-secondary)]">
                                    {filteredClasses.length} занять
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {filteredClasses.length === 0 ? (
                                <div className="p-8 text-center text-[var(--color-text-secondary)]">
                                    Занять не знайдено
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-[var(--color-background)]">
                                        <tr>
                                            <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                                День
                                            </th>
                                            <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                                Час
                                            </th>
                                            <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                                Заняття
                                            </th>
                                            <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                                Місця
                                            </th>
                                            <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                                Ціна
                                            </th>
                                            <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                                Дії
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClasses.map(cls => {
                                            const classType = CLASS_TYPES.find(c => c.label === cls.subtype);
                                            const isFull = cls.currentBookings >= cls.maxCapacity;

                                            return (
                                                <tr
                                                    key={cls.id}
                                                    className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-primary-bg)]"
                                                >
                                                    <td className="p-4">
                                                        <div className="font-medium text-[var(--color-text-primary)]">
                                                            {getDayLabel(cls.date)}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-[var(--color-text-primary)] font-medium">
                                                            {cls.startTime} - {cls.endTime}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-[var(--color-text-primary)]">
                                                            {cls.subtype}
                                                        </div>
                                                        <div className="text-sm text-[var(--color-text-secondary)]">
                                                            {cls.instructor}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center">
                                                            <div className="w-24 bg-[var(--color-border-light)] rounded-full h-2 mr-3">
                                                                <div
                                                                    className={`h-2 rounded-full ${isFull
                                                                            ? 'bg-[var(--color-error)]'
                                                                            : cls.currentBookings > cls.maxCapacity * 0.7
                                                                                ? 'bg-[var(--color-warning)]'
                                                                                : 'bg-[var(--color-success)]'
                                                                        }`}
                                                                    style={{
                                                                        width: `${Math.min((cls.currentBookings / cls.maxCapacity) * 100, 100)}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className={`text-sm font-medium ${isFull ? 'text-[var(--color-error)]' : 'text-[var(--color-text-primary)]'}`}>
                                                                {cls.currentBookings}/{cls.maxCapacity}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-[var(--color-text-primary)]">
                                                            {cls.price}€
                                                        </div>
                                                        {isFull && (
                                                            <div className="text-xs text-[var(--color-error)]">
                                                                Заповнено
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => editClass(cls)}
                                                                className="px-3 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded text-sm hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                                            >
                                                                Редагувати
                                                            </button>
                                                            <button
                                                                onClick={() => duplicateClass(cls)}
                                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                                                            >
                                                                Копіювати
                                                            </button>
                                                            <button
                                                                onClick={() => deleteClass(cls.id)}
                                                                className="px-3 py-1 bg-[var(--color-error-bg)] text-[var(--color-error)] rounded text-sm hover:bg-[var(--color-error)] hover:text-white transition-colors"
                                                            >
                                                                Видалити
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Інформація про прайси */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="font-semibold text-blue-800 mb-3">💰 Прайс-лист AMG Pilates Studio</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-blue-700 mb-2">Одноразові:</h4>
                                <ul className="text-blue-600 text-sm space-y-1">
                                    <li>• Персональне (1 особа): 30€</li>
                                    <li>• Дует (2 особи): 50€</li>
                                    <li>• Тріо (3 особи): 70€</li>
                                    <li>• Групове заняття: 10€</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-700 mb-2">Абонементи:</h4>
                                <ul className="text-blue-600 text-sm space-y-1">
                                    <li>• 4 групові заняття: 35€ (5 тижнів)</li>
                                    <li>• 8 групових занять: 60€ (5 тижнів)</li>
                                    <li>• 12 групових занять: 85€ (5 тижнів)</li>
                                    <li>• Реєстраційний внесок: 35€</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}