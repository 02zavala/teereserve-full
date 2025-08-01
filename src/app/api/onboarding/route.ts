import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {
      // Tenant information
      tenantName,
      tenantSlug,
      
      // Course information
      contactName,
      email,
      phone,
      position,
      courseName,
      address,
      website,
      description,
      holes,
      priceRange,
      amenities,
      specialRequests,
      
      // Admin user information
      adminPassword,
    } = await request.json();

    // Validate required fields
    if (!tenantName || !tenantSlug || !contactName || !email || !courseName || !adminPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if tenant slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Tenant slug already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug: tenantSlug,
        },
      });

      // Get or create golf course role
      let golfCourseRole = await tx.role.findUnique({
        where: { name: 'golf_course' },
      });

      if (!golfCourseRole) {
        golfCourseRole = await tx.role.create({
          data: {
            name: 'golf_course',
            description: 'Golf course administrator',
          },
        });
      }

      // Create admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const adminUser = await tx.user.create({
        data: {
          email,
          name: contactName,
          password: hashedPassword,
          phone,
          roleId: golfCourseRole.id,
          tenantId: tenant.id,
        },
      });

      // Create golf course
      const golfCourse = await tx.golfCourse.create({
        data: {
          name: courseName,
          slug: courseName.toLowerCase().replace(/\s+/g, '-'),
          location: address,
          description,
          holes: holes || 18,
          contactEmail: email,
          contactPhone: phone,
          tenantId: tenant.id,
        },
      });

      // Create onboarding request record
      await tx.onboardingRequest.create({
        data: {
          contactName,
          email,
          phone,
          position: position || 'Administrator',
          courseName,
          address,
          website,
          description,
          holes: holes || 18,
          priceRange,
          amenities,
          specialRequests,
          status: 'completed',
          courseId: golfCourse.id,
          tenantId: tenant.id,
        },
      });

      return {
        tenant,
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
        },
        golfCourse,
      };
    });

    return NextResponse.json(
      {
        message: 'Onboarding completed successfully',
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

