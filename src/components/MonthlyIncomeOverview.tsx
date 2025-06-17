
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth } from 'date-fns';
import { nb } from 'date-fns/locale';
import { EmployeeBooking } from '@/hooks/useEmployeeBookings';

interface MonthlyIncomeOverviewProps {
  bookings: EmployeeBooking[];
}

interface MonthlyData {
  month: Date;
  estimatedIncomeMin: number;
  estimatedIncomeMax: number;
  completedJobs: number;
  pendingJobs: number;
  confirmedJobs: number;
}

const MonthlyIncomeOverview: React.FC<MonthlyIncomeOverviewProps> = ({ bookings }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    calculateMonthlyData();
  }, [bookings, selectedMonth]);

  const calculateMonthlyData = () => {
    // Calculate data for current month and the next 5 months
    const months: MonthlyData[] = [];
    
    for (let i = -2; i <= 3; i++) {
      const month = addMonths(startOfMonth(selectedMonth), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Filter bookings for this month where user is assigned
      const monthBookings = bookings.filter(booking => {
        if (!booking.scheduled_date) return false;
        if (booking.assigned_employee_id === null) return false;
        
        const bookingDate = new Date(booking.scheduled_date);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });

      const estimatedIncomeMin = monthBookings.reduce((sum, booking) => {
        return sum + (booking.estimated_price_min || 0);
      }, 0);

      const estimatedIncomeMax = monthBookings.reduce((sum, booking) => {
        return sum + (booking.estimated_price_max || 0);
      }, 0);

      months.push({
        month,
        estimatedIncomeMin,
        estimatedIncomeMax,
        completedJobs: monthBookings.filter(b => b.status === 'completed').length,
        pendingJobs: monthBookings.filter(b => b.status === 'pending').length,
        confirmedJobs: monthBookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length,
      });
    }

    setMonthlyData(months);
  };

  const formatPrice = (priceInOre: number) => {
    return `${(priceInOre / 100).toFixed(0)} kr`;
  };

  const getCurrentMonthData = () => {
    return monthlyData.find(data => isSameMonth(data.month, selectedMonth));
  };

  const getPreviousMonthData = () => {
    const previousMonth = subMonths(selectedMonth, 1);
    return monthlyData.find(data => isSameMonth(data.month, previousMonth));
  };

  const getIncomeChange = () => {
    const current = getCurrentMonthData();
    const previous = getPreviousMonthData();
    
    if (!current || !previous) return null;
    
    const currentAvg = (current.estimatedIncomeMin + current.estimatedIncomeMax) / 2;
    const previousAvg = (previous.estimatedIncomeMin + previous.estimatedIncomeMax) / 2;
    
    if (previousAvg === 0) return null;
    
    const change = ((currentAvg - previousAvg) / previousAvg) * 100;
    return Math.round(change);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedMonth(subMonths(selectedMonth, 1));
    } else {
      setSelectedMonth(addMonths(selectedMonth, 1));
    }
  };

  const currentData = getCurrentMonthData();
  const incomeChange = getIncomeChange();

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Månedlig Inntektsoversikt</h3>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(selectedMonth, 'MMMM yyyy', { locale: nb })}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current month summary */}
      {currentData && (
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {format(selectedMonth, 'MMMM yyyy', { locale: nb })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estimert inntekt</p>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">
                    {formatPrice(currentData.estimatedIncomeMin)} - {formatPrice(currentData.estimatedIncomeMax)}
                  </p>
                  {incomeChange !== null && (
                    <div className="flex items-center space-x-1">
                      {incomeChange > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : incomeChange < 0 ? (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      ) : (
                        <Minus className="h-3 w-3 text-gray-500" />
                      )}
                      <span className={`text-xs ${
                        incomeChange > 0 ? 'text-green-600' : 
                        incomeChange < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {incomeChange > 0 ? '+' : ''}{incomeChange}% fra forrige måned
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Jobber</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {currentData.completedJobs} fullført
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {currentData.confirmedJobs} bekreftet
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {currentData.pendingJobs} venter
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly overview grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {monthlyData.map((data) => {
          const isSelected = isSameMonth(data.month, selectedMonth);
          const avgIncome = (data.estimatedIncomeMin + data.estimatedIncomeMax) / 2;
          
          return (
            <Card 
              key={data.month.toISOString()}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-dusty-500 bg-dusty-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedMonth(data.month)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">
                      {format(data.month, 'MMM yyyy', { locale: nb })}
                    </h4>
                    {avgIncome > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {data.completedJobs + data.confirmedJobs + data.pendingJobs} jobber
                      </Badge>
                    )}
                  </div>
                  
                  {avgIncome > 0 ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Estimert inntekt</p>
                        <p className="font-semibold text-sm">
                          {formatPrice(data.estimatedIncomeMin)} - {formatPrice(data.estimatedIncomeMax)}
                        </p>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">{data.completedJobs} fullført</span>
                        <span className="text-blue-600">{data.confirmedJobs} bekreftet</span>
                        <span className="text-yellow-600">{data.pendingJobs} venter</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Ingen jobber planlagt</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyIncomeOverview;
