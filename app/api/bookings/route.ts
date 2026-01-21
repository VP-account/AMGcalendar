export const runtime = 'nodejs';
// trigger redeploy
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from '@/app/lib/db';


// Розширюємо тип сесії, щоб TypeScript бачив user.id
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { classId } = await req.json();

        // Перевірка активного абонементу
        const activeSubscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: "active",
                remaining: { gt: 0 },
                OR: [
                    { endDate: null },
                    { endDate: { gt: new Date() } }
                ]
            }
        });

        if (!activeSubscription) {
            return NextResponse.json({ error: "No active subscription" }, { status: 400 });
        }

        // Перевірка вільних місць
        const classItem = await prisma.class.findUnique({ where: { id: classId } });
        if (!classItem || classItem.currentBookings >= classItem.maxCapacity) {
            return NextResponse.json({ error: "Class is full" }, { status: 400 });
        }

        // Створюємо бронювання
        const booking = await prisma.booking.create({
            data: { userId, classId, status: "booked" }
        });

        // Оновлюємо кількість бронювань у класі
        await prisma.class.update({
            where: { id: classId },
            data: { currentBookings: { increment: 1 } }
        });

        // Зменшуємо кількість залишених занять
        await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: { remaining: { decrement: 1 } }
        });

        // Якщо перше заняття – виставляємо startDate і endDate
        if (!activeSubscription.startDate) {
            const startDate = new Date();
            const weeksToAdd = (activeSubscription.duration / 4) * 5;
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + weeksToAdd * 7);

            await prisma.subscription.update({
                where: { id: activeSubscription.id },
                data: { startDate, endDate }
            });
        }

        return NextResponse.json({ booking });
    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('id');

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
        }

        // Знаходимо бронювання
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { class: true }
        });

        if (!booking || booking.userId !== session.user.id) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Перевіряємо, чи можна скасувати (за 24 години)
        const classTime = new Date(booking.class.date);
        const now = new Date();
        const hoursDifference = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDifference < 24) {
            return NextResponse.json(
                { error: 'Cancellation must be at least 24 hours before class' },
                { status: 400 }
            );
        }

        // Скасування
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'cancelled' }
        });

        // Оновлюємо кількість бронювань
        await prisma.class.update({
            where: { id: booking.classId },
            data: {
                currentBookings: { decrement: 1 }
            }
        });

        // Повертаємо заняття в абонемент
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'active'
            }
        });

        if (subscription) {
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    remaining: { increment: 1 }
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Cancellation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}


