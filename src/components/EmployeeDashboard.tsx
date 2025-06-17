import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeBookings } from '@/hooks/useEmployeeBookings';
import { useJobImages } from '@/hooks/useJobImages';
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
  Phone
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { nb } from 'date-fns/locale';

const EmployeeDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { bookings, loading, startJob, completeJob } = useEmployeeBookings();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
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

  // Show ALL bookings for today, including pending ones
  const todaysJobs = bookings.filter(booking => {
    if (!booking.scheduled_date) return false;
    return isToday(new Date(booking.scheduled_date));
  });

  // Show ALL upcoming bookings, including pending ones
  const upcomingJobs = bookings.filter(booking => {
    if (!booking.scheduled_date) return false;
    const bookingDate = new Date(booking.scheduled_date);
    return !isToday(bookingDate) && bookingDate > new Date();
  }).slice(0, 5); // Show next 5 upcoming

  const activeJobs = todaysJobs.filter(job => job.status === 'in_progress');
  const completedToday = todaysJobs.filter(job => job.status === 'completed').length;

  console.log('Todays jobs:', todaysJobs);
  console.log('Upcoming jobs:', upcomingJobs);

  const handleStartJob = async (jobId: string) => {
    await startJob(jobId);
  };

  const handleFinishJob = async (jobId: string) => {
    await completeJob(jobId);
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
        await uploadImage(file, type);
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
      case 'pending': return 'Venter';
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
    <div className="min-h-screen p-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            {t('dashboard.employee')}
          </h1>
          <p className="text-lg text-muted-foreground">
            God morgen! La oss gjøre hjemmene rene og fine ✨
          </p>
        </div>

        {/* Debug info */}
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-sm">Debug: Totalt {bookings.length} bookinger funnet</p>
          <p className="text-sm">Dagens oppdrag: {todaysJobs.length}</p>
          <p className="text-sm">Status fordeling: {JSON.stringify(bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {} as any))}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="glass-effect">
            <CardContent className="p-4 text-center">
              <CalendarDays className="h-8 w-8 text-dusty-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{todaysJobs.length}</div>
              <p className="text-sm text-muted-foreground">Dagens oppdrag</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect">
            <CardContent className="p-4 text-center">
              <Timer className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{activeJobs.length}</div>
              <p className="text-sm text-muted-foreground">Aktive oppdrag</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect">
            <CardContent className="p-4 text-center">
              <Square className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{completedToday}</div>
              <p className="text-sm text-muted-foreground">Fullført i dag</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Jobs */}
        <Card className="glass-effect card-hover mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-dusty-500" />
              <span>{t('dashboard.todaysJobs')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingen oppdrag planlagt for i dag</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysJobs.map((job) => (
                  <div key={job.id} className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{job.customer_email}</span>
                          <Badge className={getStatusColor(job.status)}>
                            {getStatusText(job.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{job.property_address}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatTime(job.scheduled_time)} - {job.service_type}
                          </span>
                        </div>

                        {job.special_instructions && (
                          <div className="flex items-start space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm text-muted-foreground">
                              {job.special_instructions}
                            </span>
                          </div>
                        )}

                        {job.start_time && (
                          <div className="text-sm text-muted-foreground">
                            Startet: {format(new Date(job.start_time), 'HH:mm')}
                            {job.end_time && ` • Fullført: ${format(new Date(job.end_time), 'HH:mm')}`}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        {(job.status === 'confirmed' || job.status === 'pending') && (
                          <Button 
                            onClick={() => handleStartJob(job.id)}
                            className="bg-gradient-to-r from-dusty-500 to-dirty-500 hover:from-dusty-600 hover:to-dirty-600"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {t('employee.startCleaning')}
                          </Button>
                        )}
                        
                        {job.status === 'in_progress' && (
                          <>
                            <Button 
                              onClick={() => handleFinishJob(job.id)}
                              variant="default"
                            >
                              <Square className="h-4 w-4 mr-2" />
                              {t('employee.finishCleaning')}
                            </Button>
                            <div className="flex space-x-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleImageUpload(job.id, 'before')}
                                disabled={uploading}
                              >
                                <Camera className="h-3 w-3 mr-1" />
                                Før
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleImageUpload(job.id, 'after')}
                                disabled={uploading}
                              >
                                <Camera className="h-3 w-3 mr-1" />
                                Etter
                              </Button>
                            </div>
                          </>
                        )}
                        
                        {job.status === 'completed' && (
                          <div className="text-center">
                            <Badge variant="default" className="bg-green-500">
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
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-dirty-500" />
              <span>{t('dashboard.upcomingJobs')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingen kommende oppdrag</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{job.customer_email}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(job.scheduled_date!)} {formatTime(job.scheduled_time)} - {job.service_type}
                      </div>
                      <div className="text-sm text-muted-foreground">{job.property_address}</div>
                    </div>
                    <Badge variant="outline">{getStatusText(job.status)}</Badge>
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
