// app/lib/storage.ts

export interface User {
    id: string;
    email: string;
    phone?: string;
    name?: string;
    surname?: string;
    birthDate?: string;
    gender?: string;
    goal?: string;
    experience?: string;
    comments?: string;
    preferredLang?: string;
    interfaceLang: string;
    registrationDate: string;
    status: 'active' | 'inactive';
    matrixExpiry?: string;
    photo?: string;
    role: 'user' | 'admin';
    remainingClasses?: number;
    subscriptionExpiry?: string;
    visits?: string[];
}

export interface Class {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: 'group' | 'private' | 'semiprivate';
    subtype: string;
    maxCapacity: number;
    currentBookings: number;
    instructor: string;
    location: string;
    address: string;
    price: number;
    description?: string;
    waitingList?: string[];
}

export interface Booking {
    id: string;
    userId: string;
    classId: string;
    status: 'booked' | 'attended' | 'cancelled' | 'no-show' | 'waiting';
    bookingDate: string;
    notes?: string;
    cancellationDeadline?: string;
}

export interface Subscription {
    id: string;
    userId: string;
    type: 'single' | 'membership' | 'gift';
    category: 'мат' | 'реформер' | 'персональні' | 'парні' | 'для трьох' | 'групові' | 'комбінований';
    duration: number;
    durationWeeks: number;
    price: number;
    purchaseDate: string;
    startDate?: string | null;
    endDate?: string | null;
    remaining: number;
    status: 'pending' | 'active' | 'expired' | 'used';
    hasMatrix: boolean;
    matrixPrice: number;
    matrixExpiry?: string;
}

// Розклад AMG Pilates
const AMG_SCHEDULE = {
    monday: [
        { time: '09:30', duration: 60, type: 'group' as const, subtype: 'Grupos Spine Corrector 7', max: 7, price: 10 },
        { time: '11:00', duration: 60, type: 'group' as const, subtype: 'Grupos 7\\1', max: 7, price: 10 },
        { time: '12:30', duration: 60, type: 'group' as const, subtype: 'Grupos 7\\1', max: 7, price: 10 },
        { time: '14:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '15:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '16:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '17:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '18:30', duration: 60, type: 'group' as const, subtype: 'Grupos Spine Corrector 7', max: 7, price: 10 },
    ],
    tuesday: [
        { time: '11:30', duration: 60, type: 'semiprivate' as const, subtype: 'Grupos Reformer 3', max: 3, price: 35 },
        { time: '13:00', duration: 60, type: 'semiprivate' as const, subtype: 'Reformer', max: 3, price: 35 },
        { time: '14:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '15:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '16:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '17:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '18:30', duration: 60, type: 'group' as const, subtype: 'Grupos Spine Corrector 7', max: 7, price: 10 },
    ],
    wednesday: [
        { time: '09:30', duration: 60, type: 'group' as const, subtype: 'Grupos Pilates Matwork 7', max: 7, price: 10 },
        { time: '11:00', duration: 60, type: 'group' as const, subtype: 'Grupos Pilates 7', max: 7, price: 10 },
        { time: '12:00', duration: 60, type: 'semiprivate' as const, subtype: 'Reformer duo', max: 2, price: 50 },
        { time: '14:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '15:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '16:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '17:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '18:30', duration: 60, type: 'group' as const, subtype: 'Grupos Spine Corrector 7', max: 7, price: 10 },
    ],
    thursday: [
        { time: '11:30', duration: 60, type: 'group' as const, subtype: 'Grupos 7\\1', max: 7, price: 10 },
        { time: '14:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '15:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '16:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '17:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '18:30', duration: 60, type: 'group' as const, subtype: 'Grupos Spine Corrector 7', max: 7, price: 10 },
    ],
    friday: [
        { time: '09:30', duration: 60, type: 'group' as const, subtype: 'Grupos Pilates 7', max: 7, price: 10 },
        { time: '11:00', duration: 60, type: 'group' as const, subtype: 'Grupos 7\\1', max: 7, price: 10 },
        { time: '12:00', duration: 60, type: 'semiprivate' as const, subtype: 'Reformer duo', max: 2, price: 50 },
        { time: '14:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '15:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '16:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '17:00', duration: 60, type: 'private' as const, subtype: 'Sesión en pareja o privada', max: 2, price: 50 },
        { time: '18:30', duration: 60, type: 'group' as const, subtype: 'Grupos Spine Corrector 7', max: 7, price: 10 },
    ],
};

// Сервіс для роботи з LocalStorage
class StorageService {
    private readonly KEYS = {
        USER: 'pilates_user',
        USERS: 'pilates_users', // 👈 ДОДАТИ
        CLASSES: 'pilates_classes',
        BOOKINGS: 'pilates_bookings',
        SUBSCRIPTIONS: 'pilates_subscriptions',
    };

    // Метод для отримання підписок конкретного користувача
    getSubscriptionsByUser(userId: string): Subscription[] {
        return this.getSubscriptions().filter(sub => sub.userId === userId);
    }

    // Користувачі
    // В storage.ts - замініть метод saveUser:
    saveUser(user: User): User {
        console.log('=== SAVE USER CALLED ===');
        console.log('Saving user:', user);
    
        try {
            // 1. Зберігаємо активного користувача
            localStorage.setItem(this.KEYS.USER, JSON.stringify(user));
            console.log('Active user saved to:', this.KEYS.USER);
        
            // 2. Додаємо/оновлюємо в списку всіх користувачів
            const users = this.getAllUsers();
            console.log('Existing users:', users);
        
            const existingIndex = users.findIndex(u => u.id === user.id);
            
            if (existingIndex >= 0) {
                users[existingIndex] = user;
                console.log('Updated existing user at index:', existingIndex);
            } else {
                users.push(user);
                console.log('Added new user, total users:', users.length);
            }
        
            localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
            console.log('Users list saved to:', this.KEYS.USERS);
        
            // 3. Перевіряємо, що все збережено
            const verifyUser = localStorage.getItem(this.KEYS.USER);
            const verifyUsers = localStorage.getItem(this.KEYS.USERS);
            console.log('Verification - active user exists:', !!verifyUser);
            console.log('Verification - users list exists:', !!verifyUsers);
            
            return user;
        
        } catch (error) {
            console.error('Error in saveUser:', error);
            throw error;
        }
    }
    
    saveAllUsers(users: any[]) {
        if (typeof window === "undefined") return;
        localStorage.setItem("users", JSON.stringify(users));
    }

    getUser(): User | null {
        const data = localStorage.getItem(this.KEYS.USER);
        return data ? JSON.parse(data) : null;
    }

    getAllUsers(): User[] {
        const data = localStorage.getItem(this.KEYS.USERS);
        return data ? JSON.parse(data) : [];
    }

    getUserById(userId: string): User | null {
        const users = this.getAllUsers();
        return users.find(user => user.id === userId) || null;
    }

    getUserByEmail(email: string): User | null {
        const users = this.getAllUsers();
        return users.find(user => user.email === email) || null;
    }
    
    updateUser(updates: Partial<User>): User | null {
        const user = this.getUser();
        if (!user) return null;

        const updatedUser = { ...user, ...updates };
        localStorage.setItem(this.KEYS.USER, JSON.stringify(updatedUser));
        return updatedUser;
    }
    logout(): void {
        localStorage.removeItem(this.KEYS.USER);
    }

    // Заняття
    getClasses(): Class[] {
        const data = localStorage.getItem(this.KEYS.CLASSES);
        if (data) return JSON.parse(data);

        const demoClasses = this.generateAMGSchedule();
        this.saveClasses(demoClasses);
        return demoClasses;
    }

    saveClasses(classes: Class[]): void {
        localStorage.setItem(this.KEYS.CLASSES, JSON.stringify(classes));
    }

    updateClass(classId: string, updates: Partial<Class>): void {
        const classes = this.getClasses();
        const updatedClasses = classes.map(cls =>
            cls.id === classId ? { ...cls, ...updates } : cls
        );
        this.saveClasses(updatedClasses);
    }

    // Бронювання
    getBookings(): Booking[] {
        const data = localStorage.getItem(this.KEYS.BOOKINGS);
        return data ? JSON.parse(data) : [];
    }

    saveBooking(booking: Omit<Booking, 'id'>): Booking {
        const bookings = this.getBookings();
        const newBooking: Booking = {
            id: Date.now().toString(),
            ...booking,
            cancellationDeadline: new Date(
                new Date(booking.bookingDate).getTime() - 24 * 60 * 60 * 1000
            ).toISOString()
        };

        bookings.push(newBooking);
        localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(bookings));
        return newBooking;
    }

    updateBooking(bookingId: string, updates: Partial<Booking>): Booking | null {
        const bookings = this.getBookings();

        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return null;

        bookings[index] = {
            ...bookings[index],
            ...updates
        };

        localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(bookings));
        return bookings[index];
    }

    // Абонементи
    getSubscriptions(): Subscription[] {
        const data = localStorage.getItem(this.KEYS.SUBSCRIPTIONS);
        return data ? JSON.parse(data) : [];
    }

    getActiveSubscription(userId: string): Subscription | null {
        const subscriptions = this.getSubscriptions();
        const userSubscriptions = subscriptions.filter(s => s.userId === userId);

        // Знаходимо перший активний або очікуючий абонемент
        return userSubscriptions.find(s => s.status === 'active' || s.status === 'pending') || null;
    }

    saveSubscription(subscription: Omit<Subscription, 'id'> & { userId: string }): Subscription {
        const subscriptions = this.getSubscriptions();
        let newSubscription: Subscription;
        const now = new Date().toISOString();

        // Перевіряємо, чи користувач вже має абонемент
        const existing = subscriptions.find(sub => sub.userId === subscription.userId);

        if (existing) {
            // Користувач вже має абонемент — додаємо тижні та відвідування
            newSubscription = {
                ...existing,
                durationWeeks: (existing.durationWeeks || 0) + 5,
                remaining: (existing.remaining || 0) + 10,
                startDate: existing.startDate ?? null,
                endDate: existing.endDate ?? null,
                status: 'active',
                purchaseDate: existing.purchaseDate ?? now,
                type: existing.type,
                category: existing.category,
                duration: existing.duration,
                price: existing.price,
                hasMatrix: existing.hasMatrix,
                matrixPrice: existing.matrixPrice,
                matrixExpiry: existing.matrixExpiry ?? undefined,
            };

            // Замінюємо старий абонемент на оновлений
            const index = subscriptions.findIndex(sub => sub.id === existing.id);
            subscriptions[index] = newSubscription;
        } else {
            // Новий абонемент
            newSubscription = {
                id: Date.now().toString(),
                userId: subscription.userId,
                type: 'membership',           // дефолтний тип
                category: 'групові',          // дефолтна категорія
                duration: 5,                  // дефолтна кількість тижнів
                durationWeeks: 5,
                price: 50,                    // дефолтна ціна
                purchaseDate: now,
                startDate: null,
                endDate: null,
                remaining: 10,                // дефолтні відвідування
                status: 'pending',
                hasMatrix: false,
                matrixPrice: 0,
                matrixExpiry: undefined,
            };

            subscriptions.push(newSubscription);
        }

        // Зберігаємо в localStorage
        localStorage.setItem(this.KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));

        return newSubscription;
    }




    // Генерація розкладу AMG
    private generateAMGSchedule(): Class[] {
        const classes: Class[] = [];
        const today = new Date();
        const DAYS_AHEAD = 35; // 5 тижнів

        for (let i = 0; i < DAYS_AHEAD; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();

            // Пропускаємо суботу та неділю
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;

            // Визначаємо день тижня для розкладу
            let schedule: any[] = [];
            switch (dayOfWeek) {
                case 1: // Понеділок
                    schedule = AMG_SCHEDULE.monday;
                    break;
                case 2: // Вівторок
                    schedule = AMG_SCHEDULE.tuesday;
                    break;
                case 3: // Середа
                    schedule = AMG_SCHEDULE.wednesday;
                    break;
                case 4: // Четвер
                    schedule = AMG_SCHEDULE.thursday;
                    break;
                case 5: // П'ятниця
                    schedule = AMG_SCHEDULE.friday;
                    break;
                default:
                    continue;
            }

            // Створюємо заняття для цього дня
            schedule.forEach((item, idx) => {
                const endTime = this.addMinutes(item.time, item.duration);

                classes.push({
                    id: `${dateStr}-${dayOfWeek}-${idx}`,
                    date: dateStr,
                    startTime: item.time,
                    endTime: endTime,
                    type: item.type,
                    subtype: item.subtype,
                    maxCapacity: item.max,
                    currentBookings: 0,
                    instructor: "AMG Pilates",
                    location: "AMG Pilates Studio",
                    address: "Carrer de la Ciutat de Reus, 28, 43840 Salou, Tarragona",
                    price: item.price,
                    description: '',
                    waitingList: []
                });
            });
        }

        return classes;
    }

    private addMinutes(time: string, minutes: number): string {
        const [hours, mins] = time.split(':').map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    }
}

export const storage = new StorageService();
