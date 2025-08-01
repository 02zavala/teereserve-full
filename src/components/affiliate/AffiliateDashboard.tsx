'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, Users, TrendingUp, Link, Copy, 
  Calendar, MapPin, Star, CheckCircle, Clock,
  BarChart3, PieChart, Download, Share
} from 'lucide-react'
import { PermissionGate } from '@/components/auth/PermissionGate'

interface AffiliateStats {
  totalEarnings: number
  pendingEarnings: number
  totalBookings: number
  thisMonthBookings: number
  conversionRate: number
  clicksThisMonth: number
  commissionRate: number
  affiliateCode: string
}

interface AffiliateBooking {
  id: string
  courseName: string
  customerName: string
  bookingDate: string
  amount: number
  commission: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

interface CommissionHistory {
  id: string
  bookingId: string
  courseName: string
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  paidAt?: string
  createdAt: string
}

// Mock data - in real app, this would come from API
const MOCK_AFFILIATE_STATS: AffiliateStats = {
  totalEarnings: 2450.75,
  pendingEarnings: 325.50,
  totalBookings: 48,
  thisMonthBookings: 12,
  conversionRate: 8.5,
  clicksThisMonth: 142,
  commissionRate: 5.0,
  affiliateCode: 'GOLF2024'
}

const MOCK_BOOKINGS: AffiliateBooking[] = [
  {
    id: '1',
    courseName: 'Cabo del Sol Ocean Course',
    customerName: 'John Smith',
    bookingDate: '2024-01-15',
    amount: 180.00,
    commission: 9.00,
    status: 'completed',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    courseName: 'Cabo Real Golf Club',
    customerName: 'Maria Garcia',
    bookingDate: '2024-01-20',
    amount: 220.00,
    commission: 11.00,
    status: 'confirmed',
    createdAt: '2024-01-18'
  },
  {
    id: '3',
    courseName: 'Puerto Los Cabos Golf Club',
    customerName: 'David Johnson',
    bookingDate: '2024-01-25',
    amount: 195.00,
    commission: 9.75,
    status: 'pending',
    createdAt: '2024-01-22'
  }
]

const MOCK_COMMISSIONS: CommissionHistory[] = [
  {
    id: '1',
    bookingId: '1',
    courseName: 'Cabo del Sol Ocean Course',
    amount: 9.00,
    status: 'paid',
    paidAt: '2024-01-16',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    bookingId: '2',
    courseName: 'Cabo Real Golf Club',
    amount: 11.00,
    status: 'pending',
    createdAt: '2024-01-18'
  }
]

export function AffiliateDashboard() {
  const [stats, setStats] = useState<AffiliateStats>(MOCK_AFFILIATE_STATS)
  const [bookings, setBookings] = useState<AffiliateBooking[]>(MOCK_BOOKINGS)
  const [commissions, setCommissions] = useState<CommissionHistory[]>(MOCK_COMMISSIONS)
  const [selectedCourse, setSelectedCourse] = useState('')

  const generateAffiliateLink = (courseSlug: string = '') => {
    const baseUrl = 'https://teereserve.com'
    const affiliateParam = `?ref=${stats.affiliateCode}`
    
    if (courseSlug) {
      return `${baseUrl}/courses/${courseSlug}${affiliateParam}`
    }
    return `${baseUrl}${affiliateParam}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Link copied to clipboard!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <PermissionGate permission="affiliate.view_own" showError>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
            <p className="text-gray-600">Track your earnings and performance</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              Code: {stats.affiliateCode}
            </Badge>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +${stats.pendingEarnings.toFixed(2)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.thisMonthBookings} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.clicksThisMonth} clicks this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.commissionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Per successful booking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="links">Affiliate Links</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{booking.courseName}</p>
                        <p className="text-sm text-gray-600">{booking.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+${booking.commission.toFixed(2)}</p>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Bookings Goal</span>
                        <span>{stats.thisMonthBookings}/20</span>
                      </div>
                      <Progress value={(stats.thisMonthBookings / 20) * 100} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Earnings Goal</span>
                        <span>${stats.pendingEarnings.toFixed(0)}/$500</span>
                      </div>
                      <Progress value={(stats.pendingEarnings / 500) * 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col space-y-2">
                    <Link className="h-6 w-6" />
                    <span>Generate Link</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Share className="h-6 w-6" />
                    <span>Share on Social</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Download className="h-6 w-6" />
                    <span>Download Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{booking.courseName}</h4>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Customer: {booking.customerName}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Booking: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${booking.amount.toFixed(2)}</p>
                        <p className="text-sm text-green-600">Commission: ${booking.commission.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{commission.courseName}</h4>
                          <Badge className={getStatusColor(commission.status)}>
                            {commission.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Booking ID: {commission.bookingId}</span>
                          <span>Created: {new Date(commission.createdAt).toLocaleDateString()}</span>
                          {commission.paidAt && (
                            <span>Paid: {new Date(commission.paidAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">${commission.amount.toFixed(2)}</p>
                        {commission.status === 'paid' && (
                          <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affiliate Links Tab */}
          <TabsContent value="links">
            <div className="space-y-6">
              {/* Link Generator */}
              <Card>
                <CardHeader>
                  <CardTitle>Generate Affiliate Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="course-select">Select Course (Optional)</Label>
                    <select
                      id="course-select"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="">All Courses (General Link)</option>
                      <option value="cabo-del-sol">Cabo del Sol Ocean Course</option>
                      <option value="cabo-real">Cabo Real Golf Club</option>
                      <option value="puerto-los-cabos">Puerto Los Cabos Golf Club</option>
                    </select>
                  </div>

                  <div>
                    <Label>Generated Link</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={generateAffiliateLink(selectedCourse)}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        onClick={() => copyToClipboard(generateAffiliateLink(selectedCourse))}
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Share this link to earn {stats.commissionRate}% commission on every booking!
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Marketing Materials */}
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Social Media Post</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        "🏌️ Book amazing golf courses in Los Cabos with exclusive deals! 
                        Use my link for the best rates: {generateAffiliateLink()}"
                      </p>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Email Template</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        "Hi! I wanted to share this amazing golf booking platform 
                        I've been using. You can find great courses and deals here..."
                      </p>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGate>
  )
}

