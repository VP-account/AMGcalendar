export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

// LAZY IMPORT Prisma - важливо!
const getPrisma = async () => {
  const { prisma } = await import('@/app/lib/prisma');
  return prisma;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { classId } = await req.json();
    
    // LAZY ініціалізація Prisma
    const prisma = await getPrisma();

    // Решта коду залишається...
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

    // ... решта твого коду
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

    // LAZY ініціалізація Prisma
    const prisma = await getPrisma();
    
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    // ... решта твого коду
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
