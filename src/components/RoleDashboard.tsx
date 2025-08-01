'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserRole, hasPermission } from '@/middleware/role-validation';

interface DashboardCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  permission?: keyof typeof import('@/middleware/role-validation').rolePermissions[UserRole];
}

const dashboardCards: DashboardCard[] = [
  {
    title: 'Tenant Management',
    description: 'Manage tenants and organizations',
    href: '/admin/tenants',
    icon: '🏢',
    permission: 'canManageTenants',
  },
  {
    title: 'User Management',
    description: 'Manage users and roles',
    href: '/admin/users',
    icon: '👥',
    permission: 'canManageUsers',
  },
  {
    title: 'Golf Courses',
    description: 'Manage golf courses and facilities',
    href: '/admin/courses',
    icon: '⛳',
    permission: 'canManageCourses',
  },
  {
    title: 'Bookings',
    description: 'View and manage bookings',
    href: '/admin/bookings',
    icon: '📅',
    permission: 'canManageBookings',
  },
  {
    title: 'Reports',
    description: 'View analytics and reports',
    href: '/admin/reports',
    icon: '📊',
    permission: 'canViewReports',
  },
  {
    title: 'Affiliates',
    description: 'Manage affiliate partners',
    href: '/admin/affiliates',
    icon: '🤝',
    permission: 'canManageAffiliates',
  },
  {
    title: 'Discount Codes',
    description: 'Manage promotional codes',
    href: '/admin/discounts',
    icon: '🎫',
    permission: 'canManageDiscounts',
  },
];

export function RoleDashboard() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Please sign in to access the dashboard.</div>;
  }

  const userRole = session.user.role as UserRole;

  const availableCards = dashboardCards.filter(card => {
    if (!card.permission) return true;
    return hasPermission(userRole, card.permission);
  });

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      super_admin: 'Super Administrator',
      admin: 'Administrator',
      golf_course: 'Golf Course Owner',
      course_manager: 'Course Manager',
      affiliate: 'Affiliate Partner',
      client: 'Client',
    };
    return roleNames[role] || role;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session.user.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Role: {getRoleDisplayName(userRole)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{card.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
            </div>
            <p className="text-gray-600">{card.description}</p>
          </Link>
        ))}
      </div>

      {availableCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No dashboard items available for your role.</p>
        </div>
      )}

      {/* Role-specific quick actions */}
      {userRole === 'client' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/courses"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-medium text-blue-900">Browse Golf Courses</h3>
              <p className="text-blue-700 text-sm">Find and book tee times</p>
            </Link>
            <Link
              href="/my-bookings"
              className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h3 className="font-medium text-green-900">My Bookings</h3>
              <p className="text-green-700 text-sm">View your reservations</p>
            </Link>
          </div>
        </div>
      )}

      {userRole === 'affiliate' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Affiliate Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900">Referral Code</h3>
              <p className="text-purple-700 text-sm">Share your unique code</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900">Commissions</h3>
              <p className="text-yellow-700 text-sm">Track your earnings</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-medium text-indigo-900">Performance</h3>
              <p className="text-indigo-700 text-sm">View your statistics</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

