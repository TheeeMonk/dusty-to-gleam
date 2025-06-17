
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookingModal from './BookingModal';
import PropertyForm from './PropertyForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBookings } from '@/hooks/useBookings';
import { useProperties } from '@/hooks/useProperties';
import { toast } from 'sonner';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { nb } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Trophy, 
  Star, 
  Plus, 
  Sparkles, 
  CalendarDays,
  Home,
  Timer,
  DollarSign,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CustomerData {
  name: string;
  loyaltyPoints: number;
}

interface CustomerDashboardProps {
  customerData: CustomerData;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customerData }) => {
  const { t } = useLanguage();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { properties, loading: propertiesLoading, addProperty } = useProperties();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  // Get the next scheduled booking - now includes both confirmed and pending bookings
  const nextCleaning = bookings
    .filter(booking => {
      const hasScheduledDate = booking.scheduled_date;
      const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending';
      const isFuture = booking.scheduled_date ? new Date(booking.scheduled_date) >= new Date() : false;
      
      return hasScheduledDate && isUpcoming && isFuture;
    })
    .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())[0];

  // Get previous completed cleanings
  const previousCleanings = bookings
    .filter(booking => booking.status === 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Get pending bookings count
  const pendingBookingsCount = bookings.filter(booking => booking.status === 'pending').length;

  const handleAddProperty = async (propertyData: any) => {
    try {
      const newProperty = await addProperty(propertyData);
      toast.success('Ny eiendom lagt til!');
      return newProperty;
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('Kunne ikke legge til eiendom');
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'I dag';
    } else if (isTomorrow(date)) {
      return 'I morgen';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE', { locale: nb });
    } else {
      return format(date, 'dd.MM.yyyy', { locale: nb });
    }
  };

  const formatPrice = (priceInOre: number) => {
    return `${(priceInOre / 100).toFixed(0)} kr`;
  };

  if (bookingsLoading || propertiesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-sky-600">Laster dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Velkommen tilbake, {customerData.name}! </span>
            <Sparkles className="inline h-8 w-8 text-yellow-500 animate-float" />
          </h1>
          <p className="text-xl text-muted-foreground">
            La oss holde hjemmet ditt skinnende rent ✨
          </p>
        </div>

        {/* Next Cleaning Card */}
        <Card className="wow-card card-hover animate-fade-in shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/90 via-sky-50/90 to-blue-50/90 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-6 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full animate-float">
                <Calendar className="h-12 w-12 text-sky-600" />
              </div>
            </div>
            <CardTitle className="text-3xl gradient-text">{t('dashboard.nextCleaning')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {nextCleaning ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center space-y-2">
                    <CalendarDays className="h-6 w-6 text-sky-500" />
                    <span className="font-semibold text-2xl text-sky-700">
                      {formatDate(nextCleaning.scheduled_date!)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(nextCleaning.scheduled_date!), 'dd.MM.yyyy', { locale: nb })}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <Clock className="h-6 w-6 text-sky-500" />
                    <span className="font-semibold text-2xl text-sky-700">
                      {nextCleaning.scheduled_time || 'Ikke angitt'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {nextCleaning.estimated_duration} min
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <MapPin className="h-6 w-6 text-sky-500" />
                    <span className="font-semibold text-lg text-sky-700">Hjemme</span>
                    <span className="text-sm text-muted-foreground">Din bolig</span>
                  </div>
                </div>
              
              <div className="flex justify-center space-x-4">
                <Badge variant="secondary" className="bg-sky-100 text-sky-800 text-lg px-4 py-2">
                  {nextCleaning.service_type}
                </Badge>
                
                <Badge 
                  variant={nextCleaning.status === 'confirmed' ? 'default' : 'outline'} 
                  className={nextCleaning.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500 text-yellow-800'}
                >
                  {nextCleaning.status === 'confirmed' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Bekreftet
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Venter på bekreftelse
                    </>
                  )}
                </Badge>
              </div>
              
              {nextCleaning.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    Din bestilling venter på bekreftelse fra våre ansatte. Du vil motta en bekreftelse så snart som mulig.
                  </p>
                </div>
              )}
              
              <div className="flex justify-center">
                <Button 
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-3 text-lg shadow-xl"
                  size="lg"
                >
                  Se detaljer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </>
            ) : (
              <div className="space-y-6">
                <div className="text-muted-foreground text-lg">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-sky-300" />
                  {t('dashboard.noUpcomingCleaning')}
                </div>
                
                <Button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-3 text-lg shadow-xl"
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {t('dashboard.bookCleaning')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Loyalty Points */}
          <Card className="glass-effect card-hover animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {customerData.loyaltyPoints}
              </div>
              <p className="text-sm text-muted-foreground">{t('dashboard.loyaltyPoints')}</p>
            </CardContent>
          </Card>

          {/* Pending Bookings */}
          <Card className="glass-effect card-hover animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Timer className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {pendingBookingsCount}
              </div>
              <p className="text-sm text-muted-foreground">Ventende bestillinger</p>
            </CardContent>
          </Card>

          {/* Properties */}
          <Card className="glass-effect card-hover animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <Home className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {properties.length}
              </div>
              <p className="text-sm text-muted-foreground">{t('dashboard.properties')}</p>
            </CardContent>
          </Card>

          {/* Completed Cleanings */}
          <Card className="glass-effect card-hover animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {previousCleanings.length}
              </div>
              <p className="text-sm text-muted-foreground">{t('dashboard.completedCleanings')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-effect card-hover animate-fade-in overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Plus className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{t('dashboard.bookCleaning')}</h3>
                  <p className="text-sky-100">Bestill profesjonell rengjøring</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Book en rengjøring som passer deg. Velg dato, tid og type tjeneste.
              </p>
              <Button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                size="lg"
              >
                Start bestilling
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect card-hover animate-fade-in overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Home className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{t('dashboard.manageProperties')}</h3>
                  <p className="text-green-100">Administrer dine eiendommer</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Legg til nye eiendommer eller rediger eksisterende informasjon.
              </p>
              <Button 
                onClick={() => setIsPropertyFormOpen(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                size="lg"
              >
                Administrer eiendommer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {previousCleanings.length > 0 && (
          <Card className="glass-effect animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span>{t('dashboard.recentCleanings')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previousCleanings.slice(0, 3).map((cleaning) => (
                  <div key={cleaning.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
                    <div className="space-y-1">
                      <div className="font-medium">{cleaning.service_type}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(cleaning.created_at), 'dd.MM.yyyy', { locale: nb })}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      {cleaning.estimated_price_min && cleaning.estimated_price_max && (
                        <div className="font-medium text-green-600">
                          {formatPrice(cleaning.estimated_price_min)} - {formatPrice(cleaning.estimated_price_max)}
                        </div>
                      )}
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Fullført
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        properties={properties}
        onAddProperty={handleAddProperty}
      />

      <PropertyForm 
        isOpen={isPropertyFormOpen}
        onClose={() => setIsPropertyFormOpen(false)}
        property={editingProperty}
        onSave={handleAddProperty}
      />
    </div>
  );
};

export default CustomerDashboard;
