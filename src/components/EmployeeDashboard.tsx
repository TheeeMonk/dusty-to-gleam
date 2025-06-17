import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeBookings } from '@/hooks/useEmployeeBookings';
import { useJobImages } from '@/hooks/useJobImages';
import { useIsMobile } from '@/hooks/use-mobile';
import AllUpcomingBookings from './AllUpcomingBookings';
import CalendarView from './CalendarView';
import { 
  Clock, 
  MapPin, 
  User, 
  Camera, 
  Play, 
  Square,
  CalendarDays,
  Timer,
  FileText,
  CheckCircle,
  Eye,
  Home,
  Bath,
  Bed,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { nb } from 'date-fns/locale';

const EmployeeDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { bookings, loading, confirmBooking, startJob, completeJob } = useEmployeeBookings();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const { uploadImage, uploading } = useJobImages(selectedBookingId || undefined);

  console.log('All bookings in dashboard:', bookings);
  console.log('Total bookings count:', bookings.length);

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

  // If showing calendar view, render that component
  if (showCalendarView) {
    return (
      <CalendarView 
        bookings={bookings} 
        onConfirmBooking={handleConfirmBooking}
        onBack={() => setShowCalendarView(false)} 
      />
    );
  }

  // If showing all upcoming bookings, render that component
  if (showAllUpcoming) {
    return <AllUpcomingBookings onBack={() => setShowAllUpcoming(false)} />;
  }

  // Filter bookings for different categories
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const todaysJobs = bookings.filter(booking => {
    if (!booking.scheduled_date) return false;
    return isToday(new Date(booking.scheduled_date));
  });

  const upcomingJobs = bookings.filter(booking => {
    if (!booking.scheduled_date) return false;
    const bookingDate = new Date(booking.scheduled_date);
    return !isToday(bookingDate) && bookingDate > new Date();
  }).slice(0, 5);

  const activeJobs = todaysJobs.filter(job => job.status === 'in_progress');
  const completedToday = todaysJobs.filter(job => job.status === 'completed').length;

  console.log('Pending bookings:', pendingBookings);
  console.log('Todays jobs:', todaysJobs);
  console.log('Upcoming jobs:', upcomingJobs);

  const handleConfirmBooking = async (jobId: string) => {
    console.log('Attempting to confirm booking:', jobId);
    try {
      await confirmBooking(jobId);
      console.log('Booking confirmed successfully');
      toast({
        title: 'Booking bekreftet',
        description: 'Bookingen er nå bekreftet og tildelt deg.',
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke bekrefte bookingen. Prøv igjen.',
        variant: 'destructive'
      });
    }
  };

  const handleStartJob = async (jobId: string) => {
    console.log('Starting job:', jobId);
    try {
      await startJob(jobId);
      toast({
        title: 'Jobb startet',
        description: 'Jobben er markert som påbegynt.',
      });
    } catch (error) {
      console.error('Error starting job:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke starte jobben. Prøv igjen.',
        variant: 'destructive'
      });
    }
  };

  const handleFinishJob = async (jobId: string) => {
    console.log('Finishing job:', jobId);
    try {
      await completeJob(jobId);
      toast({
        title: 'Jobb fullført',
        description: 'Jobben er markert som fullført.',
      });
    } catch (error) {
      console.error('Error completing job:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke fullføre jobben. Prøv igjen.',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (jobId: string, type: 'before' | 'after') => {
    setSelectedBookingId(jobId);
    
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await uploadImage(file, type);
          toast({
            title: 'Bilde lastet opp',
            description: `${type === 'before' ? 'Før' : 'Etter'}-bilde er lastet opp.`,
          });
        } catch (error) {
          toast({
            title: 'Feil',
            description: 'Kunne ikke laste opp bildet.',
            variant: 'destructive'
          });
        }
      }
    };
    input.click();
  };

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
    return format(date, 'dd.MM.yyyy', { locale: nb });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Format HH:MM
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
            {t('dashboard.employee')}
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground px-4">
            God morgen! La oss gjøre hjemmene rene og fine ✨
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="glass-effect">
            <CardContent className="p-3 sm:p-4 text-center">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{pendingBookings.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Avventer</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect">
            <CardContent className="p-3 sm:p-4 text-center">
              <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-dusty-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{todaysJobs.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">I dag</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect">
            <CardContent className="p-3 sm:p-4 text-center">
              <Timer className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{activeJobs.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Aktive</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect">
            <CardContent className="p-3 sm:p-4 text-center">
              <Square className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{completedToday}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Fullført</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Jobs Section - Highlighted */}
        {pendingBookings.length > 0 && (
          <Card className="glass-effect card-hover mb-4 sm:mb-6 border-2 border-yellow-200 bg-yellow-50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-yellow-800">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                <span>Nye oppdrag som venter på bekreftelse</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {pendingBookings.map((job) => (
                  <div key={job.id} className="bg-white p-3 sm:p-4 rounded-lg border-2 border-yellow-300 shadow-sm">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm sm:text-base">{job.customer_email}</span>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs w-fit">
                            ⏳ Ny booking
                          </Badge>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="text-xs sm:text-sm break-words block">{job.property_address}</span>
                            <span className="text-xs text-muted-foreground">{job.property_name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs sm:text-sm">
                            {formatDate(job.scheduled_date!)} {formatTime(job.scheduled_time)} - {job.service_type}
                          </span>
                        </div>

                        {job.special_instructions && (
                          <div className="flex items-start space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-xs sm:text-sm text-muted-foreground break-words">
                              {job.special_instructions}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button 
                        onClick={() => handleConfirmBooking(job.id)}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 w-full text-sm"
                        size={isMobile ? "sm" : "default"}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aksepter oppdrag
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Jobs */}
        <Card className="glass-effect card-hover mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-dusty-500" />
              <span>{t('dashboard.todaysJobs')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {todaysJobs.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <CalendarDays className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Ingen oppdrag planlagt for i dag</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {todaysJobs.map((job) => (
                  <div key={job.id} className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm sm:text-base">{job.customer_email}</span>
                          </div>
                          <Badge className={`${getStatusColor(job.status)} text-xs w-fit`}>
                            {getStatusText(job.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="text-xs sm:text-sm break-words block">{job.property_address}</span>
                            <span className="text-xs text-muted-foreground">{job.property_name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs sm:text-sm">
                            {formatTime(job.scheduled_time)} - {job.service_type}
                          </span>
                        </div>

                        {job.special_instructions && (
                          <div className="flex items-start space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-xs sm:text-sm text-muted-foreground break-words">
                              {job.special_instructions}
                            </span>
                          </div>
                        )}

                        {job.start_time && (
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Startet: {format(new Date(job.start_time), 'HH:mm')}
                            {job.end_time && ` • Fullført: ${format(new Date(job.end_time), 'HH:mm')}`}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        {job.status === 'confirmed' && (
                          <Button 
                            onClick={() => handleStartJob(job.id)}
                            className="bg-gradient-to-r from-dusty-500 to-dirty-500 hover:from-dusty-600 hover:to-dirty-600 w-full text-sm"
                            size={isMobile ? "sm" : "default"}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {t('employee.startCleaning')}
                          </Button>
                        )}
                        
                        {job.status === 'in_progress' && (
                          <div className="space-y-2">
                            <Button 
                              onClick={() => handleFinishJob(job.id)}
                              variant="default"
                              className="w-full text-sm"
                              size={isMobile ? "sm" : "default"}
                            >
                              <Square className="h-4 w-4 mr-2" />
                              {t('employee.finishCleaning')}
                            </Button>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleImageUpload(job.id, 'before')}
                                disabled={uploading}
                                className="flex-1 text-xs"
                              >
                                <Camera className="h-3 w-3 mr-1" />
                                Før
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleImageUpload(job.id, 'after')}
                                disabled={uploading}
                                className="flex-1 text-xs"
                              >
                                <Camera className="h-3 w-3 mr-1" />
                                Etter
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {job.status === 'completed' && (
                          <div className="text-center">
                            <Badge variant="default" className="bg-green-500 text-xs">
                              ✓ Fullført
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Jobs */}
        <Card className="glass-effect card-hover">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-dirty-500" />
                <span>{t('dashboard.upcomingJobs')}</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCalendarView(true)}
                  className="flex items-center space-x-1"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Kalender</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAllUpcoming(true)}
                  className="flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Se alle</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {upcomingJobs.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <CalendarDays className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Ingen kommende oppdrag</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingJobs.map((job) => (
                  <div key={job.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                    <div className="space-y-1">
                      <div className="font-medium text-sm sm:text-base">{job.customer_email}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {formatDate(job.scheduled_date!)} {formatTime(job.scheduled_time)} - {job.service_type}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground break-words">
                        {job.property_address}
                      </div>
                      <div className="text-xs text-muted-foreground">{job.property_name}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs w-fit">{getStatusText(job.status)}</Badge>
                      {job.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => handleConfirmBooking(job.id)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aksepter
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
    </div>
  );
};

export default EmployeeDashboard;
