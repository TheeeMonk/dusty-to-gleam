
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEmployeeBookings } from '@/hooks/useEmployeeBookings';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ArrowLeft,
  MapPin, 
  User, 
  Clock,
  CalendarDays,
  FileText
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { nb } from 'date-fns/locale';

interface AllUpcomingBookingsProps {
  onBack: () => void;
}

const AllUpcomingBookings: React.FC<AllUpcomingBookingsProps> = ({ onBack }) => {
  const { bookings, loading } = useEmployeeBookings();
  const isMobile = useIsMobile();

  console.log('All bookings for upcoming view:', bookings);

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-sky-600">Laster bookinger...</p>
        </div>
      </div>
    );
  }

  // Get all upcoming bookings (including today and future)
  const upcomingBookings = bookings.filter(booking => {
    if (!booking.scheduled_date) return false;
    const bookingDate = new Date(booking.scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  }).sort((a, b) => {
    // Sort by date first, then by time
    if (a.scheduled_date !== b.scheduled_date) {
      return new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime();
    }
    if (a.scheduled_time && b.scheduled_time) {
      return a.scheduled_time.localeCompare(b.scheduled_time);
    }
    return 0;
  });

  console.log('Filtered upcoming bookings:', upcomingBookings);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'I dag';
    if (isTomorrow(date)) return 'I morgen';
    if (isYesterday(date)) return 'I går';
    return format(date, 'EEEE d. MMMM yyyy', { locale: nb });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Format HH:MM
  };

  // Group bookings by date
  const groupedBookings = upcomingBookings.reduce((groups, booking) => {
    const date = booking.scheduled_date!;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(booking);
    return groups;
  }, {} as Record<string, typeof upcomingBookings>);

  return (
    <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Tilbake</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">
              Alle kommende bookinger
            </h1>
            <p className="text-sm text-muted-foreground">
              {upcomingBookings.length} booking{upcomingBookings.length !== 1 ? 'er' : ''} funnet
            </p>
          </div>
        </div>

        {/* Bookings List */}
        {upcomingBookings.length === 0 ? (
          <Card className="glass-effect">
            <CardContent className="p-8 text-center">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Ingen kommende bookinger</h3>
              <p className="text-muted-foreground">Det er ingen planlagte oppdrag fremover.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedBookings).map(([date, dateBookings]) => (
              <Card key={date} className="glass-effect">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <CalendarDays className="h-5 w-5 text-dusty-500" />
                    <span>{formatDate(date)}</span>
                    <Badge variant="outline" className="ml-auto">
                      {dateBookings.length} oppdrag
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-4">
                    {dateBookings.map((booking) => (
                      <div key={booking.id} className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="space-y-3">
                          {/* Job Info */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm sm:text-base">{booking.customer_email}</span>
                            </div>
                            <Badge className={`${getStatusColor(booking.status)} text-xs w-fit`}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-xs sm:text-sm break-words">{booking.property_address}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs sm:text-sm">
                              {formatTime(booking.scheduled_time)} - {booking.service_type}
                            </span>
                          </div>

                          {booking.special_instructions && (
                            <div className="flex items-start space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-xs sm:text-sm text-muted-foreground break-words">
                                {booking.special_instructions}
                              </span>
                            </div>
                          )}

                          {booking.estimated_duration && (
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Estimert varighet: {booking.estimated_duration} minutter
                            </div>
                          )}

                          {booking.estimated_price_min && booking.estimated_price_max && (
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Estimert pris: {booking.estimated_price_min / 100} - {booking.estimated_price_max / 100} NOK
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUpcomingBookings;
