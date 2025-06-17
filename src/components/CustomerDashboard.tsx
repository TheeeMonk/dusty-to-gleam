import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useBookings } from '@/hooks/useBookings';
import BottomNavigation from '@/components/BottomNavigation';
import BookingModal from '@/components/BookingModal';
import PropertyForm from '@/components/PropertyForm';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Gift, 
  FileText, 
  Camera,
  Sparkles,
  Plus,
  Home,
  User,
  Building,
  Edit,
  PawPrint,
  LogOut,
  Percent
} from 'lucide-react';

interface CustomerDashboardProps {
  customerData: {
    name: string;
    loyaltyPoints: number;
  };
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customerData }) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { properties, loading, addProperty, updateProperty } = useProperties();
  const { profile } = useUserProfile();
  const { bookings, loading: bookingsLoading } = useBookings();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  // Get the next scheduled booking
  const nextCleaning = bookings
    .filter(booking => booking.status === 'confirmed' && booking.scheduled_date)
    .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())[0];

  // Get previous completed cleanings
  const previousCleanings = bookings
    .filter(booking => booking.status === 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Generate dummy invoices for completed bookings
  const invoices = previousCleanings.map((booking, index) => ({
    id: booking.id,
    date: new Date(booking.created_at).toLocaleDateString('nb-NO'),
    amount: booking.estimated_price_min ? Math.round(booking.estimated_price_min / 100) : 800,
    status: 'paid' as const,
    service: booking.service_type
  }));

  // Calculate discount percentage based on loyalty points
  const getDiscountPercentage = (points: number): number => {
    if (points >= 50) return 20; // 20% rabatt ved 50+ poeng
    if (points >= 30) return 15; // 15% rabatt ved 30+ poeng
    if (points >= 20) return 10; // 10% rabatt ved 20+ poeng
    if (points >= 10) return 5;  // 5% rabatt ved 10+ poeng
    return 0;
  };

  const currentDiscount = getDiscountPercentage(customerData.loyaltyPoints);
  const nextDiscountThreshold = currentDiscount === 0 ? 10 : 
                               currentDiscount === 5 ? 20 : 
                               currentDiscount === 10 ? 30 : 
                               currentDiscount === 15 ? 50 : null;

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setIsPropertyFormOpen(true);
  };

  const handleClosePropertyForm = () => {
    setIsPropertyFormOpen(false);
    setEditingProperty(null);
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Get display name - prioritize profile full name, fallback to email
  const displayName = profile?.full_name || user?.email || 'Bruker';

  const renderDashboard = () => (
    <div className="space-y-8 pb-24">
      {/* Header with logout */}
      <div className="text-center relative">
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="absolute top-0 right-0"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logg ut
        </Button>
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Sparkles className="h-20 w-20 text-sky-400 animate-float" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-ping"></div>
          </div>
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-4 animate-fade-in">
          Velkommen tilbake!
        </h1>
        <p className="text-xl text-sky-600 font-medium animate-fade-in">
          {displayName} ✨
        </p>
      </div>

      {/* Next Cleaning Card */}
      <Card className="wow-card card-hover animate-fade-in shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/90 via-sky-50/90 to-blue-50/90 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-3 text-2xl">
            <Calendar className="h-7 w-7 text-sky-500 animate-float" />
            <span>Neste rengjøring</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-sky-500 animate-spin mx-auto mb-4" />
              <p className="text-sky-600">Laster bestillinger...</p>
            </div>
          ) : nextCleaning ? (
            <div className="text-center space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="h-5 w-5 text-sky-500" />
                    <span className="font-semibold text-lg">
                      {new Date(nextCleaning.scheduled_date!).toLocaleDateString('nb-NO')}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-5 w-5 text-sky-500" />
                    <span className="font-semibold text-lg">
                      {nextCleaning.estimated_duration} min
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="h-5 w-5 text-sky-500" />
                    <span className="font-semibold text-lg">Din eiendom</span>
                  </div>
                </div>
              </div>
              
              <Badge variant="secondary" className="bg-sky-100 text-sky-800 text-lg px-4 py-2">
                {nextCleaning.service_type}
              </Badge>
              
              <div className="flex justify-center">
                <Sparkles className="h-16 w-16 text-sky-400 animate-pulse-glow" />
              </div>
              
              <Button 
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Book ny rengjøring
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-20 w-20 text-sky-300 mx-auto mb-6 animate-float" />
              <p className="text-xl mb-6 text-sky-600">Ingen planlagt rengjøring</p>
              <Button 
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-8 py-3 text-lg rounded-2xl"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Book rengjøring
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Loyalty Card with Discount System */}
        <Card className="wow-card card-hover animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-xl">
              <Percent className="h-6 w-6 text-sky-500 animate-float" />
              <span>Rabatt Program</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div>
              <div className="text-4xl font-bold text-sky-600 animate-pulse-glow">
                {customerData.loyaltyPoints}
              </div>
              <p className="text-sm text-muted-foreground">Lojalitetspoeng</p>
            </div>
            
            {currentDiscount > 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <Percent className="h-8 w-8 text-green-600 mx-auto mb-2 animate-float" />
                <p className="text-lg font-bold text-green-700">{currentDiscount}% rabatt</p>
                <p className="text-sm text-green-600">på din neste vask!</p>
              </div>
            )}

            {nextDiscountThreshold && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Til neste rabattnivå</span>
                  <span>{customerData.loyaltyPoints}/{nextDiscountThreshold}</span>
                </div>
                <div className="w-full bg-sky-100 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-sky-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(customerData.loyaltyPoints / nextDiscountThreshold) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {nextDiscountThreshold - customerData.loyaltyPoints} poeng til {getDiscountPercentage(nextDiscountThreshold)}% rabatt
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Previous Cleanings */}
        <Card className="wow-card card-hover lg:col-span-2 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-sky-500" />
              <span>Tidligere rengjøringer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 text-sky-500 animate-spin mx-auto mb-4" />
                <p className="text-sky-600">Laster historikk...</p>
              </div>
            ) : previousCleanings.length > 0 ? (
              <div className="space-y-4">
                {previousCleanings.slice(0, 3).map((cleaning) => (
                  <div key={cleaning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {new Date(cleaning.created_at).toLocaleDateString('nb-NO')}
                      </div>
                      <div className="text-sm text-muted-foreground">{cleaning.service_type}</div>
                      <Badge variant="outline" className="text-xs">
                        Fullført
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-sky-300 mx-auto mb-4" />
                <p className="text-muted-foreground">Ingen tidligere rengjøringer</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="wow-card card-hover lg:col-span-3 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-sky-500" />
              <span>Fakturaer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Dato</th>
                      <th className="text-left py-2">Tjeneste</th>
                      <th className="text-left py-2">Beløp</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b">
                        <td className="py-2">{invoice.date}</td>
                        <td className="py-2">{invoice.service}</td>
                        <td className="py-2">{invoice.amount} kr</td>
                        <td className="py-2">
                          <Badge variant="default">Betalt</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-sky-300 mx-auto mb-4" />
                <p className="text-muted-foreground">Ingen fakturaer ennå</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 pb-24">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full">
            <User className="h-16 w-16 text-sky-600 animate-float" />
          </div>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Min Profil</h1>
        <p className="text-sky-600">Administrer din konto</p>
      </div>
      
      <Card className="wow-card">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">{displayName}</h2>
          <p className="text-muted-foreground mb-6">Profilinnstillinger kommer snart...</p>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logg ut
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderHomes = () => (
    <div className="space-y-8 pb-24">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full">
            <Home className="h-16 w-16 text-sky-600 animate-float" />
          </div>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Mine Boliger</h1>
        <p className="text-sky-600">Administrer dine eiendommer</p>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-sky-600">Laster eiendommer...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="wow-card card-hover relative group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-4 bg-sky-100 rounded-full">
                      <Building className="h-8 w-8 text-sky-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-2">{property.name}</h3>
                      <div className="flex items-center space-x-2 text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{property.address}</span>
                      </div>
                      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                        {property.type}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProperty(property)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Property details */}
                <div className="space-y-3 pt-4 border-t border-sky-100">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {property.rooms && (
                      <div className="text-center">
                        <div className="font-medium text-sky-600">{property.rooms}</div>
                        <div className="text-muted-foreground">Rom</div>
                      </div>
                    )}
                    {property.square_meters && (
                      <div className="text-center">
                        <div className="font-medium text-sky-600">{property.square_meters}m²</div>
                        <div className="text-muted-foreground">Kvm</div>
                      </div>
                    )}
                    {property.windows && (
                      <div className="text-center">
                        <div className="font-medium text-sky-600">{property.windows}</div>
                        <div className="text-muted-foreground">Vinduer</div>
                      </div>
                    )}
                  </div>
                  
                  {property.has_pets && (
                    <div className="flex items-center space-x-2 text-sm">
                      <PawPrint className="h-4 w-4 text-sky-500" />
                      <span className="text-muted-foreground">Har kjæledyr</span>
                    </div>
                  )}
                  
                  {property.notes && (
                    <div className="text-sm text-muted-foreground mt-2">
                      <strong>Merknader:</strong> {property.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card 
            className="wow-card card-hover border-dashed border-sky-300 cursor-pointer"
            onClick={() => setIsPropertyFormOpen(true)}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="p-4 bg-sky-50 rounded-full w-fit mx-auto">
                <Plus className="h-8 w-8 text-sky-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-sky-700">Legg til ny bolig</h3>
                <p className="text-muted-foreground text-sm">Registrer en ny eiendom</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100">
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'homes' && renderHomes()}
      </div>
      
      <BottomNavigation 
        userRole="customer"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        properties={properties}
        onAddProperty={addProperty}
      />
      
      <PropertyForm 
        isOpen={isPropertyFormOpen}
        onClose={handleClosePropertyForm}
        onSave={addProperty}
        onUpdate={updateProperty}
        editingProperty={editingProperty}
      />
    </div>
  );
};

export default CustomerDashboard;
