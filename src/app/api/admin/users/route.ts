import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withRolePermission } from '@/middleware/role-validation';

const prisma = new PrismaClient();

export const GET = withRolePermission('canManageUsers')(async (request: NextRequest) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        tenant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

