import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid date';
  }
}

export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/[^\d.-]/g, ''));
}

export function formatDateRange(dateRange: string): string {
  const [startDate, endDate] = dateRange.split('-');
  
  // Convert MM/DD/YYYY to DD/MM/YYYY
  const formatDate = (date: string) => {
    if (!date) return '';
    const [month, day, year] = date.split('/');
    return `${day}/${month}/${year}`;
  };
  
  return `${formatDate(startDate)} - ${formatDate(endDate || startDate)}`;
}


export function formatDateRanges(dateRange: string): string {
  const [startDate, endDate] = dateRange.split('-');
  
  // Check for special periods
  if (startDate === '05/24/2022' && endDate === '11/24/2022') {
    return 'Pós 134k';
  }
  
  if (startDate === '04/07/2023' && endDate === '10/07/2023') {
    return 'Pós BSOP';
  }
  
  return 'Todo Período';
}


export function formatDateForGraph(dateRange: string): string {
  const [startDate] = dateRange.split('-');
  if (!startDate) return '';
  
  const [month, day, year] = startDate.split('/');
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
}

export function calculateMonthsBetween(startDate: string, endDate: string): number {
  const [startMonth, startDay, startYear] = startDate.split('/').map(Number);
  const [endMonth, endDay, endYear] = endDate.split('/').map(Number);
  
  return (endYear - startYear) * 12 + (endMonth - startMonth);
}

