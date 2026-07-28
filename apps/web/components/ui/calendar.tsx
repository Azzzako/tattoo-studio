'use client';

import * as React from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import 'react-day-picker/style.css';
import { cn } from '@/lib/cn';

export type CalendarProps = DayPickerProps;

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      className={cn('rdp-custom p-3', className)}
      classNames={{
        today: 'rdp-today',
      }}
      {...props}
    />
  );
}