"use client";

import { fr } from 'date-fns/locale';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  disablePastDates?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner une date",
  disabled,
  className = "w-full",
  disablePastDates = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`${className} justify-between font-normal`}
          disabled={disabled}
        >
          {date ? date.toLocaleDateString("fr-FR") : placeholder}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          locale={fr}
          disabled={disablePastDates ? (date) => date < today : undefined}
          onSelect={(selectedDate) => {
            onDateChange(selectedDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
