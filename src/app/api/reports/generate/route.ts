import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';
import { getCurrentUser } from '@/lib/auth';
import { getTenantFromRequest } from '@/lib/tenant';
import { hasPermission } from '@/lib/permissions';
import fs from 'fs';

const analyticsService = AnalyticsService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await getTenantFromRequest(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if user has permission to generate reports
    if (!hasPermission(user.role.name, 'generate_reports')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      startDate,
      endDate,
      golfCourseIds,
      affiliateIds,
      reportType,
      format,
      includeCharts
    } = body;

    const parameters = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      golfCourseIds,
      affiliateIds,
      reportType,
      format,
      includeCharts
    };

    const filePath = await analyticsService.generateReport(tenant.id, parameters);

    // Read the file and return it as a download
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `report_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;

    // Clean up the temporary file
    fs.unlinkSync(filePath);

    const headers = new Headers();
    headers.set('Content-Type', getContentType(format));
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getContentType(format: string): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
      return 'text/csv';
    default:
      return 'application/octet-stream';
  }
}

