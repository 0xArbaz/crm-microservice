'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-gray-200', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return <thead className={cn('bg-gray-50', className)}>{children}</thead>;
}

export function TableBody({ children, className }: TableProps) {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn('hover:bg-gray-50 transition-colors', className)}>
      {children}
    </tr>
  );
}

interface TableCellProps extends TableProps {
  isHeader?: boolean;
}

export function TableCell({ children, className, isHeader }: TableCellProps) {
  const Component = isHeader ? 'th' : 'td';
  return (
    <Component
      className={cn(
        'px-6 py-4 whitespace-nowrap text-sm',
        isHeader
          ? 'font-medium text-gray-500 uppercase tracking-wider text-left'
          : 'text-gray-900',
        className
      )}
    >
      {children}
    </Component>
  );
}
