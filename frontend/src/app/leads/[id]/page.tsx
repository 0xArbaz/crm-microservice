'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  useEffect(() => {
    // Redirect to the new view page that matches the edit page layout
    router.replace(`/leads/${leadId}/view`);
  }, [router, leadId]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
