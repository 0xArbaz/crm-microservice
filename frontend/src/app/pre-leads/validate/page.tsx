'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { CheckCircle } from 'lucide-react';

export default function ValidatePreLeadsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <CheckCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Validate Pre-Leads</h1>
        <p className="text-gray-500">This feature is under development.</p>
        <p className="text-sm text-gray-400 mt-2">Review and validate pre-leads before converting to leads.</p>
      </div>
    </MainLayout>
  );
}
