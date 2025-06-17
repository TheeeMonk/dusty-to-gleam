
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmployeeBooking } from '@/hooks/useEmployeeBookings';
import { format, isSameDay, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import { 
  Clock, 
  MapPin, 
  User, 
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

interface CalendarViewProps {
  bookings: EmployeeBooking[];
  onConfirmBooking?: (jobId: string) => void;
  onBack?: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  bookings, 
  onConfirmBooking,
  onBack 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Filter bookings to only show upcoming ones
  const upcomingBookings = bookings.filter(booking => {
    if (!booking.scheduled_date) return false;
    const bookingDate = new Date(booking.scheduled_date);
    return bookingDate >= new Date();
  });

  // Get bookings for selected date
  const selectedDateBookings = selectedDate ? 
    upcomingBookings.filter(booking => {
      if (!booking.scheduled_date) return false;
      return isSameDay(parseISO(booking.scheduled_date), selectedDate);
    }) : [];

  // Get dates that have bookings
  const datesWithBookings = upcomingBookings
    .filter(booking => booking.scheduled_date)
    .map(booking => parseISO(booking.scheduled_date!));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Avventer bekreftelse';
      case 'confirmed': return 'Bekreftet';
      case 'in_progress': return 'Pågår';
      case 'completed': return 'Fullført';
      default: return 'Ukjent';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Tilbake</span>
              </Button>
            )}
            <h1 className="text-2xl font-bold gradient-text">
              Kalender - Kommende oppdrag
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">Velg dato</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={nb}
                className="w-full"
                modifiers={{
                  hasBooking: datesWithBookings
                }}
                modifiersStyles={{
                  hasBooking: {
                    backgroundColor: 'rgb(59 130 246 / 0.1)',
                    color: 'rgb(59 130 246)',
                    fontWeight: 'bold'
                  }
                }}
              />
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-100 rounded border border-blue-300"></div>
                  <span>Dager med oppdrag</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings for selected date */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">
                Oppdrag for {selectedDate ? format(selectedDate, 'dd. MMMM yyyy', { locale: nb }) : 'valgt dag'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingen oppdrag på denne dagen</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedDateBookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{booking.customer_email}</span>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} text-xs`}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="text-sm break-words block">{booking.property_address}</span>
                            <span className="text-xs text-muted-foreground">{booking.property_name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatTime(booking.scheduled_time)} - {booking.service_type}
                          </span>
                        </div>

                        {booking.special_instructions && (
                          <div className="text-sm text-muted-foreground break-words bg-gray-50 p-2 rounded">
                            <strong>Spesielle instruksjoner:</strong> {booking.special_instructions}
                          </div>
                        )}

                        {booking.status === 'pending' && onConfirmBooking && (
                          <Button 
                            onClick={() => onConfirmBooking(booking.id)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 w-full text-sm"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aksepter oppdrag
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="glass-effect mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Oversikt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {upcomingBookings.filter(b => b.status === 'pending').length}
                </div>
                <p className="text-sm text-muted-foreground">Avventer bekreftelse</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {upcomingBookings.filter(b => b.status === 'confirmed').length}
                </div>
                <p className="text-sm text-muted-foreground">Bekreftet</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {upcomingBookings.filter(b => b.status === 'in_progress').length}
                </div>
                <p className="text-sm text-muted-foreground">Pågår</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-dusty-600">
                  {upcomingBookings.length}
                </div>
                <p className="text-sm text-muted-foreground">Totalt kommende</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
