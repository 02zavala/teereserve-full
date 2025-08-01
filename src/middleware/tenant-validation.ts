import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function validateTenantAccess(
  request: NextRequest,
  tenantId: string | null
): Promise<NextResponse | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Super admin can access all tenants
    if (session.user.role === 'super_admin') {
      return null; // Allow access
    }

    // If no tenant ID is provided, deny access
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if user belongs to the tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    });

    if (!user || user.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return null; // Allow access
  } catch (error) {
    console.error('Error validating tenant access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export function withTenantValidation(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const tenantId = request.headers.get('x-tenant-id');
    
    const validationError = await validateTenantAccess(request, tenantId);
    if (validationError) {
      return validationError;
    }

    return handler(request, context);
  };
}

