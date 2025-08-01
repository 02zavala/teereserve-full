import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export interface AnalyticsData {
  revenue: {
    total: number;
    byPeriod: Array<{ period: string; amount: number }>;
    byGolfCourse: Array<{ courseId: string; courseName: string; amount: number }>;
    growth: number;
  };
  occupancy: {
    average: number;
    byGolfCourse: Array<{ courseId: string; courseName: string; occupancy: number }>;
    byTimeSlot: Array<{ timeSlot: string; occupancy: number }>;
  };
  userBehavior: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    topPages: Array<{ page: string; views: number }>;
    conversionRate: number;
  };
  affiliatePerformance: {
    totalAffiliates: number;
    totalCommissions: number;
    topAffiliates: Array<{ affiliateId: string; name: string; commissions: number; bookings: number }>;
  };
}

export interface ReportParameters {
  startDate: Date;
  endDate: Date;
  golfCourseIds?: string[];
  affiliateIds?: string[];
  reportType: 'revenue' | 'occupancy' | 'user_behavior' | 'affiliate_performance' | 'comprehensive';
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track analytics event
   */
  async trackEvent(
    tenantId: string,
    event: string,
    userId?: string,
    sessionId?: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.analyticsEvent.create({
        data: {
          tenantId,
          event,
          userId,
          sessionId,
          properties: properties ? JSON.stringify(properties) : null
        }
      });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  /**
   * Get comprehensive analytics data
   */
  async getAnalyticsData(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    golfCourseIds?: string[]
  ): Promise<AnalyticsData> {
    const [revenue, occupancy, userBehavior, affiliatePerformance] = await Promise.all([
      this.getRevenueAnalytics(tenantId, startDate, endDate, golfCourseIds),
      this.getOccupancyAnalytics(tenantId, startDate, endDate, golfCourseIds),
      this.getUserBehaviorAnalytics(tenantId, startDate, endDate),
      this.getAffiliatePerformanceAnalytics(tenantId, startDate, endDate)
    ]);

    return {
      revenue,
      occupancy,
      userBehavior,
      affiliatePerformance
    };
  }

  /**
   * Get revenue analytics
   */
  private async getRevenueAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    golfCourseIds?: string[]
  ) {
    const whereClause: any = {
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: 'completed'
    };

    if (golfCourseIds && golfCourseIds.length > 0) {
      whereClause.golfCourseId = { in: golfCourseIds };
    }

    // Total revenue
    const totalRevenue = await prisma.booking.aggregate({
      where: whereClause,
      _sum: {
        totalPrice: true
      }
    });

    // Revenue by period (daily)
    const revenueByPeriod = await prisma.booking.groupBy({
      by: ['bookingDate'],
      where: whereClause,
      _sum: {
        totalPrice: true
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // Revenue by golf course
    const revenueByGolfCourse = await prisma.booking.groupBy({
      by: ['golfCourseId'],
      where: whereClause,
      _sum: {
        totalPrice: true
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc'
        }
      }
    });

    // Get golf course names
    const golfCourseNames = await prisma.golfCourse.findMany({
      where: {
        id: { in: revenueByGolfCourse.map(r => r.golfCourseId) }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Calculate growth (compare with previous period)
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousRevenue = await prisma.booking.aggregate({
      where: {
        ...whereClause,
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      },
      _sum: {
        totalPrice: true
      }
    });

    const growth = previousRevenue._sum.totalPrice 
      ? ((totalRevenue._sum.totalPrice || 0) - (previousRevenue._sum.totalPrice || 0)) / (previousRevenue._sum.totalPrice || 1) * 100
      : 0;

    return {
      total: totalRevenue._sum.totalPrice || 0,
      byPeriod: revenueByPeriod.map(r => ({
        period: r.bookingDate.toISOString().split('T')[0],
        amount: r._sum.totalPrice || 0
      })),
      byGolfCourse: revenueByGolfCourse.map(r => ({
        courseId: r.golfCourseId,
        courseName: golfCourseNames.find(c => c.id === r.golfCourseId)?.name || 'Unknown',
        amount: r._sum.totalPrice || 0
      })),
      growth
    };
  }

  /**
   * Get occupancy analytics
   */
  private async getOccupancyAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    golfCourseIds?: string[]
  ) {
    const whereClause: any = {
      tenantId,
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (golfCourseIds && golfCourseIds.length > 0) {
      whereClause.golfCourseId = { in: golfCourseIds };
    }

    // Get availability data
    const availabilities = await prisma.availability.findMany({
      where: whereClause,
      include: {
        golfCourse: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Get bookings for the same period
    const bookings = await prisma.booking.findMany({
      where: {
        tenantId,
        bookingDate: {
          gte: startDate,
          lte: endDate
        },
        status: { in: ['confirmed', 'completed'] },
        ...(golfCourseIds && golfCourseIds.length > 0 ? { golfCourseId: { in: golfCourseIds } } : {})
      }
    });

    // Calculate occupancy rates
    const occupancyByGolfCourse = new Map();
    const occupancyByTimeSlot = new Map();

    availabilities.forEach(availability => {
      const courseId = availability.golfCourseId;
      const timeSlot = availability.startTime.getHours();
      
      const relatedBookings = bookings.filter(b => 
        b.golfCourseId === courseId &&
        b.teeTime.getTime() >= availability.startTime.getTime() &&
        b.teeTime.getTime() < availability.endTime.getTime()
      );

      const occupancyRate = availability.availableSlots > 0 
        ? (relatedBookings.length / availability.availableSlots) * 100
        : 0;

      // By golf course
      if (!occupancyByGolfCourse.has(courseId)) {
        occupancyByGolfCourse.set(courseId, {
          courseId,
          courseName: availability.golfCourse.name,
          totalSlots: 0,
          bookedSlots: 0
        });
      }
      const courseData = occupancyByGolfCourse.get(courseId);
      courseData.totalSlots += availability.availableSlots;
      courseData.bookedSlots += relatedBookings.length;

      // By time slot
      const timeSlotKey = `${timeSlot}:00`;
      if (!occupancyByTimeSlot.has(timeSlotKey)) {
        occupancyByTimeSlot.set(timeSlotKey, {
          timeSlot: timeSlotKey,
          totalSlots: 0,
          bookedSlots: 0
        });
      }
      const timeSlotData = occupancyByTimeSlot.get(timeSlotKey);
      timeSlotData.totalSlots += availability.availableSlots;
      timeSlotData.bookedSlots += relatedBookings.length;
    });

    // Calculate final occupancy rates
    const courseOccupancy = Array.from(occupancyByGolfCourse.values()).map(data => ({
      courseId: data.courseId,
      courseName: data.courseName,
      occupancy: data.totalSlots > 0 ? (data.bookedSlots / data.totalSlots) * 100 : 0
    }));

    const timeSlotOccupancy = Array.from(occupancyByTimeSlot.values()).map(data => ({
      timeSlot: data.timeSlot,
      occupancy: data.totalSlots > 0 ? (data.bookedSlots / data.totalSlots) * 100 : 0
    }));

    const averageOccupancy = courseOccupancy.length > 0
      ? courseOccupancy.reduce((sum, c) => sum + c.occupancy, 0) / courseOccupancy.length
      : 0;

    return {
      average: averageOccupancy,
      byGolfCourse: courseOccupancy,
      byTimeSlot: timeSlotOccupancy
    };
  }

  /**
   * Get user behavior analytics
   */
  private async getUserBehaviorAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Total users
    const totalUsers = await prisma.user.count({
      where: { tenantId }
    });

    // New users in period
    const newUsers = await prisma.user.count({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Active users (users who made bookings in period)
    const activeUsers = await prisma.booking.groupBy({
      by: ['userId'],
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Top pages from analytics events
    const topPages = await prisma.analyticsEvent.groupBy({
      by: ['event'],
      where: {
        tenantId,
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        event: { startsWith: 'page_view' }
      },
      _count: {
        event: true
      },
      orderBy: {
        _count: {
          event: 'desc'
        }
      },
      take: 10
    });

    // Conversion rate (bookings completed / bookings started)
    const bookingsStarted = await prisma.analyticsEvent.count({
      where: {
        tenantId,
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        event: 'booking_started'
      }
    });

    const bookingsCompleted = await prisma.booking.count({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'completed'
      }
    });

    const conversionRate = bookingsStarted > 0 ? (bookingsCompleted / bookingsStarted) * 100 : 0;

    return {
      totalUsers,
      activeUsers: activeUsers.length,
      newUsers,
      topPages: topPages.map(p => ({
        page: p.event.replace('page_view_', ''),
        views: p._count.event
      })),
      conversionRate
    };
  }

  /**
   * Get affiliate performance analytics
   */
  private async getAffiliatePerformanceAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    const totalAffiliates = await prisma.affiliate.count({
      where: { tenantId }
    });

    const commissions = await prisma.commission.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        affiliate: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        booking: true
      }
    });

    const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);

    // Group by affiliate
    const affiliatePerformance = new Map();
    commissions.forEach(commission => {
      const affiliateId = commission.affiliateId;
      if (!affiliatePerformance.has(affiliateId)) {
        affiliatePerformance.set(affiliateId, {
          affiliateId,
          name: commission.affiliate.user.name || commission.affiliate.user.email,
          commissions: 0,
          bookings: 0
        });
      }
      const data = affiliatePerformance.get(affiliateId);
      data.commissions += commission.amount;
      data.bookings += 1;
    });

    const topAffiliates = Array.from(affiliatePerformance.values())
      .sort((a, b) => b.commissions - a.commissions)
      .slice(0, 10);

    return {
      totalAffiliates,
      totalCommissions,
      topAffiliates
    };
  }

  /**
   * Generate report
   */
  async generateReport(
    tenantId: string,
    parameters: ReportParameters
  ): Promise<string> {
    const analyticsData = await this.getAnalyticsData(
      tenantId,
      parameters.startDate,
      parameters.endDate,
      parameters.golfCourseIds
    );

    const fileName = `report_${parameters.reportType}_${Date.now()}`;
    const filePath = path.join(process.cwd(), 'tmp', `${fileName}.${parameters.format}`);

    // Ensure tmp directory exists
    const tmpDir = path.dirname(filePath);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    switch (parameters.format) {
      case 'pdf':
        await this.generatePDFReport(analyticsData, parameters, filePath);
        break;
      case 'excel':
        await this.generateExcelReport(analyticsData, parameters, filePath);
        break;
      case 'csv':
        await this.generateCSVReport(analyticsData, parameters, filePath);
        break;
    }

    return filePath;
  }

  /**
   * Generate PDF report
   */
  private async generatePDFReport(
    data: AnalyticsData,
    parameters: ReportParameters,
    filePath: string
  ): Promise<void> {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(20).text('TeeReserve Analytics Report', 50, 50);
    doc.fontSize(12).text(`Period: ${parameters.startDate.toDateString()} - ${parameters.endDate.toDateString()}`, 50, 80);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 50, 100);

    let yPosition = 140;

    // Revenue Section
    doc.fontSize(16).text('Revenue Analytics', 50, yPosition);
    yPosition += 30;
    doc.fontSize(12).text(`Total Revenue: $${data.revenue.total.toFixed(2)}`, 50, yPosition);
    yPosition += 20;
    doc.text(`Growth: ${data.revenue.growth.toFixed(2)}%`, 50, yPosition);
    yPosition += 30;

    // Top Golf Courses by Revenue
    doc.text('Top Golf Courses by Revenue:', 50, yPosition);
    yPosition += 20;
    data.revenue.byGolfCourse.slice(0, 5).forEach(course => {
      doc.text(`${course.courseName}: $${course.amount.toFixed(2)}`, 70, yPosition);
      yPosition += 15;
    });

    yPosition += 20;

    // Occupancy Section
    doc.fontSize(16).text('Occupancy Analytics', 50, yPosition);
    yPosition += 30;
    doc.fontSize(12).text(`Average Occupancy: ${data.occupancy.average.toFixed(2)}%`, 50, yPosition);
    yPosition += 30;

    // User Behavior Section
    doc.fontSize(16).text('User Behavior', 50, yPosition);
    yPosition += 30;
    doc.fontSize(12).text(`Total Users: ${data.userBehavior.totalUsers}`, 50, yPosition);
    yPosition += 15;
    doc.text(`Active Users: ${data.userBehavior.activeUsers}`, 50, yPosition);
    yPosition += 15;
    doc.text(`New Users: ${data.userBehavior.newUsers}`, 50, yPosition);
    yPosition += 15;
    doc.text(`Conversion Rate: ${data.userBehavior.conversionRate.toFixed(2)}%`, 50, yPosition);

    doc.end();
  }

  /**
   * Generate Excel report
   */
  private async generateExcelReport(
    data: AnalyticsData,
    parameters: ReportParameters,
    filePath: string
  ): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Revenue sheet
    const revenueData = [
      ['Metric', 'Value'],
      ['Total Revenue', data.revenue.total],
      ['Growth %', data.revenue.growth],
      [''],
      ['Golf Course', 'Revenue'],
      ...data.revenue.byGolfCourse.map(c => [c.courseName, c.amount])
    ];
    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue');

    // Occupancy sheet
    const occupancyData = [
      ['Metric', 'Value'],
      ['Average Occupancy %', data.occupancy.average],
      [''],
      ['Golf Course', 'Occupancy %'],
      ...data.occupancy.byGolfCourse.map(c => [c.courseName, c.occupancy])
    ];
    const occupancySheet = XLSX.utils.aoa_to_sheet(occupancyData);
    XLSX.utils.book_append_sheet(workbook, occupancySheet, 'Occupancy');

    // User Behavior sheet
    const userBehaviorData = [
      ['Metric', 'Value'],
      ['Total Users', data.userBehavior.totalUsers],
      ['Active Users', data.userBehavior.activeUsers],
      ['New Users', data.userBehavior.newUsers],
      ['Conversion Rate %', data.userBehavior.conversionRate]
    ];
    const userBehaviorSheet = XLSX.utils.aoa_to_sheet(userBehaviorData);
    XLSX.utils.book_append_sheet(workbook, userBehaviorSheet, 'User Behavior');

    XLSX.writeFile(workbook, filePath);
  }

  /**
   * Generate CSV report
   */
  private async generateCSVReport(
    data: AnalyticsData,
    parameters: ReportParameters,
    filePath: string
  ): Promise<void> {
    const csvData = [
      ['Section', 'Metric', 'Value'],
      ['Revenue', 'Total Revenue', data.revenue.total],
      ['Revenue', 'Growth %', data.revenue.growth],
      ['Occupancy', 'Average Occupancy %', data.occupancy.average],
      ['User Behavior', 'Total Users', data.userBehavior.totalUsers],
      ['User Behavior', 'Active Users', data.userBehavior.activeUsers],
      ['User Behavior', 'New Users', data.userBehavior.newUsers],
      ['User Behavior', 'Conversion Rate %', data.userBehavior.conversionRate],
      ['Affiliate', 'Total Affiliates', data.affiliatePerformance.totalAffiliates],
      ['Affiliate', 'Total Commissions', data.affiliatePerformance.totalCommissions]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    fs.writeFileSync(filePath, csvContent);
  }

  /**
   * Schedule report generation
   */
  async scheduleReport(
    tenantId: string,
    reportConfig: {
      name: string;
      type: string;
      parameters: string;
      schedule: string;
      format: string;
      recipients: string[];
    }
  ): Promise<void> {
    await prisma.report.create({
      data: {
        tenantId,
        name: reportConfig.name,
        type: reportConfig.type,
        parameters: reportConfig.parameters,
        schedule: reportConfig.schedule,
        isScheduled: true,
        format: reportConfig.format,
        recipients: JSON.stringify(reportConfig.recipients)
      }
    });
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(tenantId: string): Promise<any[]> {
    return await prisma.report.findMany({
      where: {
        tenantId,
        isScheduled: true
      },
      include: {
        executions: {
          orderBy: {
            startedAt: 'desc'
          },
          take: 5
        }
      }
    });
  }
}

export default AnalyticsService;

