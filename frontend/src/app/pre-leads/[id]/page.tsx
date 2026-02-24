'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// This page redirects to the new view page
export default function PreLeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const preLeadId = params.id as string;

  useEffect(() => {
    // Redirect to the new view page
    router.replace(`/pre-leads/${preLeadId}/view`);
  }, [preLeadId, router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
