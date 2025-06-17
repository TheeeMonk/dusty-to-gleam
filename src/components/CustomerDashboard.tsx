import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookingModal from './BookingModal';
import PropertyForm from './PropertyForm';
import BookingDetailsModal from './BookingDetailsModal';
import StatsModal from './StatsModal';
import ProfileSettings from './ProfileSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBookings } from '@/hooks/useBookings';
import { useProperties } from '@/hooks/useProperties';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
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
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customerData, activeTab, onTabChange }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { properties, loading: propertiesLoading, addProperty } = useProperties();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsModalType, setStatsModalType] = useState<'loyalty' | 'pending' | 'properties' | 'completed' | null>(null);

  // Get the display name - prioritize profile full_name, then customerData.name, then email
  const displayName = profile?.full_name || customerData.name || user?.email || 'Bruker';

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

  // Get pending bookings
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const pendingBookingsCount = pendingBookings.length;

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

  const handleShowBookingDetails = () => {
    if (nextCleaning) {
      setSelectedBooking(nextCleaning);
      setIsBookingDetailsOpen(true);
    }
  };

  const handleStatsClick = (type: 'loyalty' | 'pending' | 'properties' | 'completed') => {
    setStatsModalType(type);
    setIsStatsModalOpen(true);
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

  const getActiveView = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      
      case 'homes':
        return (
          <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 p-3 sm:p-4 lg:p-6 pb-24">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Mine Boliger</h1>
                <Button 
                  onClick={() => setIsPropertyFormOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Legg til bolig
                </Button>
              </div>
              
              <div className="space-y-4">
                {properties.map((property) => (
                  <Card key={property.id} className="glass-effect">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{property.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{property.address}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline">{property.type}</Badge>
                        {property.rooms && <Badge variant="outline">{property.rooms} rom</Badge>}
                        {property.square_meters && <Badge variant="outline">{property.square_meters} m²</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {properties.length === 0 && (
                  <Card className="glass-effect">
                    <CardContent className="p-8 text-center">
                      <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Ingen boliger registrert ennå</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'employee':
        return null; // This won't be used for customers
      
      default: // dashboard
        return (
          <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 p-3 sm:p-4 lg:p-6 pb-24">
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
              {/* Header */}
              <div className="text-center animate-fade-in px-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  <span className="gradient-text">Velkommen tilbake, {displayName}! </span>
                  <Sparkles className="inline h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-500 animate-float" />
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground">
                  La oss holde hjemmet ditt skinnende rent ✨
                </p>
              </div>

              {/* Next Cleaning Card */}
              <Card className="wow-card card-hover animate-fade-in shadow-2xl rounded-2xl sm:rounded-3xl border-0 bg-gradient-to-br from-white/90 via-sky-50/90 to-blue-50/90 backdrop-blur-xl">
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full animate-float">
                      <Calendar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-sky-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl gradient-text">{t('dashboard.nextCleaning')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4 sm:space-y-6 p-4 sm:p-6">
                  {nextCleaning ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="flex flex-col items-center space-y-2 p-3 sm:p-0">
                          <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />
                          <span className="font-semibold text-xl sm:text-2xl text-sky-700">
                            {formatDate(nextCleaning.scheduled_date!)}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {format(new Date(nextCleaning.scheduled_date!), 'dd.MM.yyyy', { locale: nb })}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center space-y-2 p-3 sm:p-0">
                          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />
                          <span className="font-semibold text-xl sm:text-2xl text-sky-700">
                            {nextCleaning.scheduled_time || 'Ikke angitt'}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {nextCleaning.estimated_duration} min
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center space-y-2 p-3 sm:p-0">
                          <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />
                          <span className="font-semibold text-lg sm:text-lg text-sky-700">Hjemme</span>
                          <span className="text-xs sm:text-sm text-muted-foreground">Din bolig</span>
                        </div>
                      </div>
                    
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                        <Badge variant="secondary" className="bg-sky-100 text-sky-800 text-sm sm:text-lg px-3 py-1 sm:px-4 sm:py-2">
                          {nextCleaning.service_type}
                        </Badge>
                        
                        <Badge 
                          variant={nextCleaning.status === 'confirmed' ? 'default' : 'outline'} 
                          className={`text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2 ${nextCleaning.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-yellow-800'}`}
                        >
                          {nextCleaning.status === 'confirmed' ? (
                            <>
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Bekreftet
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Venter på bekreftelse
                            </>
                          )}
                        </Badge>
                      </div>
                      
                      {nextCleaning.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mx-2 sm:mx-0">
                          <p className="text-yellow-800 text-xs sm:text-sm">
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
                            Din bestilling venter på bekreftelse fra våre ansatte. Du vil motta en bekreftelse så snart som mulig.
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-center px-2 sm:px-0">
                        <Button 
                          onClick={handleShowBookingDetails}
                          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-6 py-2 sm:px-8 sm:py-3 text-base sm:text-lg shadow-xl w-full sm:w-auto"
                          size="lg"
                        >
                          Se detaljer
                          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
                      <div className="text-muted-foreground text-base sm:text-lg">
                        <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-sky-300" />
                        {t('dashboard.noUpcomingCleaning')}
                      </div>
                      
                      <Button 
                        onClick={() => setIsBookingModalOpen(true)}
                        className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-6 py-2 sm:px-8 sm:py-3 text-base sm:text-lg shadow-xl w-full sm:w-auto"
                        size="lg"
                      >
                        <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        {t('dashboard.bookCleaning')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {/* Loyalty Points */}
                <Card 
                  className="glass-effect card-hover animate-fade-in cursor-pointer"
                  onClick={() => handleStatsClick('loyalty')}
                >
                  <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                    <div className="flex justify-center mb-2 sm:mb-3">
                      <div className="p-2 sm:p-3 bg-yellow-100 rounded-full">
                        <Trophy className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-600" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-1">
                      {customerData.loyaltyPoints}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.loyaltyPoints')}</p>
                  </CardContent>
                </Card>

                {/* Pending Bookings */}
                <Card 
                  className="glass-effect card-hover animate-fade-in cursor-pointer"
                  onClick={() => handleStatsClick('pending')}
                >
                  <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                    <div className="flex justify-center mb-2 sm:mb-3">
                      <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
                        <Timer className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-1">
                      {pendingBookingsCount}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Ventende bestillinger</p>
                  </CardContent>
                </Card>

                {/* Properties */}
                <Card 
                  className="glass-effect card-hover animate-fade-in cursor-pointer"
                  onClick={() => handleStatsClick('properties')}
                >
                  <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                    <div className="flex justify-center mb-2 sm:mb-3">
                      <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                        <Home className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1">
                      {properties.length}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.properties')}</p>
                  </CardContent>
                </Card>

                {/* Completed Cleanings */}
                <Card 
                  className="glass-effect card-hover animate-fade-in cursor-pointer"
                  onClick={() => handleStatsClick('completed')}
                >
                  <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                    <div className="flex justify-center mb-2 sm:mb-3">
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                        <Star className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
                      {previousCleanings.length}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.completedCleanings')}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="glass-effect card-hover animate-fade-in overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 sm:p-6 text-white">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-full">
                        <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">{t('dashboard.bookCleaning')}</h3>
                        <p className="text-sky-100 text-sm sm:text-base">Bestill profesjonell rengjøring</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                      Book en rengjøring som passer deg. Velg dato, tid og type tjeneste.
                    </p>
                    <Button 
                      onClick={() => setIsBookingModalOpen(true)}
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-sm sm:text-base"
                      size="lg"
                    >
                      Start bestilling
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-effect card-hover animate-fade-in overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-6 text-white">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-full">
                        <Home className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">{t('dashboard.manageProperties')}</h3>
                        <p className="text-green-100 text-sm sm:text-base">Administrer dine eiendommer</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                      Legg til nye eiendommer eller rediger eksisterende informasjon.
                    </p>
                    <Button 
                      onClick={() => setIsPropertyFormOpen(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm sm:text-base"
                      size="lg"
                    >
                      Administrer eiendommer
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              {previousCleanings.length > 0 && (
                <Card className="glass-effect animate-fade-in">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center space-x-2 text-xl sm:text-2xl">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                      <span>{t('dashboard.recentCleanings')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {previousCleanings.slice(0, 3).map((cleaning) => (
                        <div key={cleaning.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white rounded-lg border shadow-sm space-y-2 sm:space-y-0">
                          <div className="space-y-1">
                            <div className="font-medium text-sm sm:text-base">{cleaning.service_type}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {format(new Date(cleaning.created_at), 'dd.MM.yyyy', { locale: nb })}
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col sm:text-right space-x-2 sm:space-x-0 sm:space-y-1 items-center sm:items-end">
                            {cleaning.estimated_price_min && cleaning.estimated_price_max && (
                              <div className="font-medium text-green-600 text-sm sm:text-base">
                                {formatPrice(cleaning.estimated_price_min)} - {formatPrice(cleaning.estimated_price_max)}
                              </div>
                            )}
                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs sm:text-sm">
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
          </div>
        );
    }
  };

  if (bookingsLoading || propertiesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-sky-600">Laster dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {getActiveView()}

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
        editingProperty={editingProperty}
        onSave={handleAddProperty}
      />

      <BookingDetailsModal
        isOpen={isBookingDetailsOpen}
        onClose={() => setIsBookingDetailsOpen(false)}
        booking={selectedBooking}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        type={statsModalType}
        data={{
          loyaltyPoints: customerData.loyaltyPoints,
          pendingBookings: pendingBookings,
          properties: properties,
          completedBookings: previousCleanings
        }}
      />
    </>
  );
};

export default CustomerDashboard;
