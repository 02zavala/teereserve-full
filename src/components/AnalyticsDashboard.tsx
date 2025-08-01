'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  Download,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Mail,
  Clock
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    byPeriod: Array<{ period: string; amount: number }>;
    byGolfCourse: Array<{ courseId: string; courseName: string; amount: number }>;
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
    conversionRate: number;
    topPages: Array<{ page: string; views: number }>;
  };
  affiliatePerformance: {
    totalAffiliates: number;
    totalCommissions: number;
    topAffiliates: Array<{ affiliateId: string; name: string; commissions: number; bookings: number }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [selectedGolfCourses, setSelectedGolfCourses] = useState<string[]>([]);
  const [reportFormat, setReportFormat] = useState('pdf');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, selectedGolfCourses]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      });
      
      if (selectedGolfCourses.length > 0) {
        params.append('golfCourseIds', selectedGolfCourses.join(','));
      }

      const response = await fetch(`/api/analytics?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    setGeneratingReport(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          golfCourseIds: selectedGolfCourses,
          reportType,
          format: reportFormat,
          includeCharts: true
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.${reportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudieron cargar los datos de analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Analytics</h1>
          <p className="text-gray-600">Análisis detallado del rendimiento de tu negocio</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          
          <div className="flex gap-2">
            <Select value={reportFormat} onValueChange={setReportFormat}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => generateReport('comprehensive')}
              disabled={generatingReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {generatingReport ? 'Generando...' : 'Exportar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.revenue.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.revenue.growth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {formatPercentage(Math.abs(data.revenue.growth))} vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupación Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.occupancy.average)}</div>
            <p className="text-xs text-muted-foreground">
              Promedio de ocupación de canchas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userBehavior.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {data.userBehavior.newUsers} nuevos usuarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.userBehavior.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              Reservas completadas vs iniciadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="occupancy">Ocupación</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Ingresos por Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={data.revenue.byPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ingresos por Campo de Golf
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.revenue.byGolfCourse.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="courseName" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Ocupación por Campo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={data.occupancy.byGolfCourse}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ courseName, occupancy }) => `${courseName}: ${formatPercentage(occupancy)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="occupancy"
                    >
                      {data.occupancy.byGolfCourse.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatPercentage(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ocupación por Horario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.occupancy.byTimeSlot}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeSlot" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatPercentage(Number(value))} />
                    <Bar dataKey="occupancy" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Usuarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total de Usuarios</span>
                  <Badge variant="secondary">{data.userBehavior.totalUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Usuarios Activos</span>
                  <Badge variant="default">{data.userBehavior.activeUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Nuevos Usuarios</span>
                  <Badge variant="outline">{data.userBehavior.newUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tasa de Conversión</span>
                  <Badge variant="secondary">{formatPercentage(data.userBehavior.conversionRate)}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Páginas Más Visitadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.userBehavior.topPages.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{page.page}</span>
                      <Badge variant="outline">{page.views} vistas</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Afiliados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total de Afiliados</span>
                  <Badge variant="secondary">{data.affiliatePerformance.totalAffiliates}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Comisiones Totales</span>
                  <Badge variant="default">{formatCurrency(data.affiliatePerformance.totalCommissions)}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Afiliados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.affiliatePerformance.topAffiliates.slice(0, 5).map((affiliate, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">{affiliate.name}</span>
                        <p className="text-xs text-gray-500">{affiliate.bookings} reservas</p>
                      </div>
                      <Badge variant="outline">{formatCurrency(affiliate.commissions)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => generateReport('revenue')}
              disabled={generatingReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Reporte de Ingresos
            </Button>
            
            <Button
              variant="outline"
              onClick={() => generateReport('occupancy')}
              disabled={generatingReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Reporte de Ocupación
            </Button>
            
            <Button
              variant="outline"
              onClick={() => generateReport('affiliate_performance')}
              disabled={generatingReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Reporte de Afiliados
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

