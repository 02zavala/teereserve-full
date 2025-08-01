import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withRolePermission } from '@/middleware/role-validation';
import bcrypt from 'bcryptjs';
import { getTenantId } from '@/lib/prisma-tenant';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export const POST = withRolePermission('canManageUsers')(async (request: NextRequest) => {
  try {
    // Mover la llamada a auth() dentro de la función POST
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name, roleId, phone } = await request.json();
    const tenantId = getTenantId();

    if (!email || !name || !roleId) {
      return NextResponse.json({ error: 'Email, name, and role are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone,
        roleId,
        tenantId,
      },
      include: {
        role: true,
        tenant: true,
      },
    });

    // In a real application, you would send an email with the temporary password
    // For now, we'll just return it in the response (not recommended for production)
    console.log(`Temporary password for ${email}: ${tempPassword}`);

    return NextResponse.json({
      message: 'User invited successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant: user.tenant,
      },
      tempPassword, // Remove this in production
    }, { status: 201 });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});


