'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Webhook } from 'lucide-react';
import api from '@/lib/api';

interface WebhookButtonProps {
  className?: string;
}

export function WebhookButton({ className = '' }: WebhookButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const [menuKey, setMenuKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWebhookStatus();
  }, [pathname]);

  const checkWebhookStatus = async () => {
    setLoading(true);
    try {
      // Remove leading slash for API call
      const pathToCheck = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const result = await api.checkWebhookEnabled(pathToCheck);
      setIsEnabled(result.is_enabled);
      setMenuKey(result.menu_key);
    } catch (error) {
      console.error('Failed to check webhook status:', error);
      setIsEnabled(false);
      setMenuKey(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (menuKey) {
      router.push(`/settings/webhook/configure/${menuKey}`);
    }
  };

  // Don't render anything if loading, not enabled, or on webhook settings pages
  if (loading || !isEnabled || !menuKey || pathname.startsWith('/settings/webhook')) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-full hover:bg-purple-700 transition-all hover:scale-105 ${className}`}
      title="Configure Webhook"
    >
      <Webhook className="w-3.5 h-3.5" />
      <span>Webhook</span>
    </button>
  );
}

export default WebhookButton;
