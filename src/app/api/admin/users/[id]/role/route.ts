import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withRolePermission } from '@/middleware/role-validation';

const prisma = new PrismaClient();

export const PUT = withRolePermission('canManageUsers')(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { roleId } = await request.json();

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { roleId },
      include: {
        role: true,
        tenant: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

