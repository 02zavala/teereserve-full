import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withRolePermission } from '@/middleware/role-validation';

const prisma = new PrismaClient();

export const DELETE = withRolePermission('canManageUsers')(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

