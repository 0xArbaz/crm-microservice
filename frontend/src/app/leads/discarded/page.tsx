'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Trash2 } from 'lucide-react';

export default function DiscardedLeadsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Trash2 className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Discarded Leads</h1>
        <p className="text-gray-500">This feature is under development.</p>
        <p className="text-sm text-gray-400 mt-2">View and manage lost or discarded leads.</p>
      </div>
    </MainLayout>
  );
}
