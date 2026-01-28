'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Target,
  Activity,
  Contact,
  Webhook,
  ChevronDown,
  ChevronRight,
  Mail,
  MessageSquare,
  TrendingUp,
  UserCheck,
  UserX,
  ClipboardList,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Pre-Leads',
    icon: UserPlus,
    children: [
      { name: 'New Pre-Lead', href: '/pre-leads/new' },
      { name: 'Manage Pre-Leads', href: '/pre-leads' },
      { name: 'Validate Pre-Leads', href: '/pre-leads/validate' },
      { name: 'Discarded', href: '/pre-leads/discarded' },
    ],
  },
  {
    name: 'Leads',
    icon: Target,
    children: [
      { name: 'New Lead', href: '/leads/new' },
      { name: 'Manage Leads', href: '/leads' },
      { name: 'Track Lead', href: '/leads/track' },
      { name: 'Discarded', href: '/leads/discarded' },
      { name: 'Sales Target', href: '/leads/sales-target' },
      { name: 'Bulk Email', href: '/leads/bulk-email' },
      { name: 'WhatsApp Marketing', href: '/leads/whatsapp' },
    ],
  },
  {
    name: 'Customers',
    icon: Users,
    children: [{ name: 'Track Customers', href: '/customers' }],
  },
  {
    name: 'Activities',
    icon: Activity,
    children: [
      { name: 'Lead Activity', href: '/activities/lead' },
      { name: 'Customer Activity', href: '/activities/customer' },
    ],
  },
  {
    name: 'Contacts',
    icon: Contact,
    children: [
      { name: 'Lead Contacts', href: '/contacts/lead' },
      { name: 'Customer Contacts', href: '/contacts/customer' },
    ],
  },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Pre-Leads', 'Leads']);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children: { href: string }[]) =>
    children.some((child) => pathname.startsWith(child.href.split('/').slice(0, 2).join('/')));

  return (
    <div className="flex flex-col w-64 bg-gray-900 min-h-screen">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 bg-gray-800">
        <span className="text-xl font-bold text-white">CRM System</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.href ? (
              // Single item without children
              <Link
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive(item.href)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ) : (
              // Item with children
              <>
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    item.children && isParentActive(item.children)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                  {expandedItems.includes(item.name) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Children */}
                {expandedItems.includes(item.name) && item.children && (
                  <div className="mt-1 ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm rounded-lg transition-colors',
                          isActive(child.href)
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <Link
          href="/settings"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </Link>
      </div>
    </div>
  );
}
