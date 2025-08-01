import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export function getTenantId(): string | null {
  const headersList = headers();
  return headersList.get('x-tenant-id');
}

export function createTenantAwarePrisma() {
  const tenantId = getTenantId();

  return {
    // User operations with tenant filtering
    user: {
      findMany: (args?: any) => {
        return prisma.user.findMany({
          ...args,
          where: {
            ...args?.where,
            tenantId: tenantId,
          },
        });
      },
      findUnique: (args: any) => {
        return prisma.user.findUnique({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
      create: (args: any) => {
        return prisma.user.create({
          ...args,
          data: {
            ...args.data,
            tenantId: tenantId,
          },
        });
      },
      update: (args: any) => {
        return prisma.user.update({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
      delete: (args: any) => {
        return prisma.user.delete({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
    },

    // Golf Course operations with tenant filtering
    golfCourse: {
      findMany: (args?: any) => {
        return prisma.golfCourse.findMany({
          ...args,
          where: {
            ...args?.where,
            tenantId: tenantId,
          },
        });
      },
      findUnique: (args: any) => {
        return prisma.golfCourse.findUnique({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
      create: (args: any) => {
        return prisma.golfCourse.create({
          ...args,
          data: {
            ...args.data,
            tenantId: tenantId,
          },
        });
      },
      update: (args: any) => {
        return prisma.golfCourse.update({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
      delete: (args: any) => {
        return prisma.golfCourse.delete({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
    },

    // Booking operations with tenant filtering
    booking: {
      findMany: (args?: any) => {
        return prisma.booking.findMany({
          ...args,
          where: {
            ...args?.where,
            tenantId: tenantId,
          },
        });
      },
      findUnique: (args: any) => {
        return prisma.booking.findUnique({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
      create: (args: any) => {
        return prisma.booking.create({
          ...args,
          data: {
            ...args.data,
            tenantId: tenantId,
          },
        });
      },
      update: (args: any) => {
        return prisma.booking.update({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
      delete: (args: any) => {
        return prisma.booking.delete({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
    },

    // Reservation operations with tenant filtering
    reservation: {
      findMany: (args?: any) => {
        return prisma.reservation.findMany({
          ...args,
          where: {
            ...args?.where,
            tenantId: tenantId,
          },
        });
      },
      findUnique: (args: any) => {
        return prisma.reservation.findUnique({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
      create: (args: any) => {
        return prisma.reservation.create({
          ...args,
          data: {
            ...args.data,
            tenantId: tenantId,
          },
        });
      },
      update: (args: any) => {
        return prisma.reservation.update({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
      delete: (args: any) => {
        return prisma.reservation.delete({
          ...args,
          where: {
            ...args.where,
            tenantId: tenantId,
          },
        });
      },
    },

    // Direct access to prisma for operations that don't need tenant filtering
    $transaction: prisma.$transaction.bind(prisma),
    $disconnect: prisma.$disconnect.bind(prisma),
    
    // Tenant operations (no filtering needed)
    tenant: prisma.tenant,
    role: prisma.role,
  };
}

export const tenantPrisma = createTenantAwarePrisma();

