import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
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
  PawPrint
} from 'lucide-react';

interface Cleaning {
  id: string;
  date: string;
  time: string;
  type: string;
  address: string;
  status: 'completed' | 'scheduled' | 'in-progress';
  beforeImage?: string;
  afterImage?: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  rooms?: number;
  squareMeters?: number;
  windows?: number;
  hasPets?: boolean;
  notes?: string;
}

interface CustomerDashboardProps {
  customerData: {
    name: string;
    loyaltyPoints: number;
  };
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customerData }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  const [nextCleaning] = useState<Cleaning | null>({
    id: '1',
    date: '2024-06-20',
    time: '10:00',
    type: 'Standard rengjøring',
    address: 'Hjemme',
    status: 'scheduled'
  });

  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      name: 'Hovedbolig',
      address: 'Dalskroken 19 B, 1405 Langhus',
      type: 'Enebolig',
      rooms: 5,
      squareMeters: 150,
      windows: 12,
      hasPets: true,
      notes: 'Hund som kan være nervøs for fremmede'
    },
    {
      id: '2',
      name: 'Hytte',
      address: 'Fjellveien 15, 2600 Lillehammer',
      type: 'Fritidsbolig',
      rooms: 3,
      squareMeters: 80,
      windows: 8,
      hasPets: false
    }
  ]);

  const [previousCleanings] = useState<Cleaning[]>([
    {
      id: '2',
      date: '2024-06-10',
      time: '14:00',
      type: 'Dybderengjøring',
      address: 'Hjemme',
      status: 'completed',
      beforeImage: '/api/placeholder/150/150',
      afterImage: '/api/placeholder/150/150'
    },
    {
      id: '3',
      date: '2024-05-25',
      time: '11:00',
      type: 'Standard rengjøring',
      address: 'Hjemme',
      status: 'completed'
    }
  ]);

  const [invoices] = useState([
    { id: '1', date: '2024-06-10', amount: 1200, status: 'paid' },
    { id: '2', date: '2024-05-25', amount: 800, status: 'paid' }
  ]);

  const loyaltyProgress = (customerData.loyaltyPoints % 10) * 10;
  const freeCleaningsEarned = Math.floor(customerData.loyaltyPoints / 10);

  const handleAddProperty = (newPropertyData: Omit<Property, 'id'>) => {
    const newProperty: Property = {
      ...newPropertyData,
      id: String(properties.length + 1)
    };
    
    setProperties(prevProperties => [...prevProperties, newProperty]);
    console.log('New property added:', newProperty);
  };

  const handleUpdateProperty = (updatedProperty: Property) => {
    setProperties(prevProperties => 
      prevProperties.map(property => 
        property.id === updatedProperty.id ? updatedProperty : property
      )
    );
    setEditingProperty(null);
    console.log('Property updated:', updatedProperty);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsPropertyFormOpen(true);
  };

  const handleClosePropertyForm = () => {
    setIsPropertyFormOpen(false);
    setEditingProperty(null);
  };

  const renderDashboard = () => (
    <div className="space-y-8 pb-24">
      {/* Header with enhanced styling */}
      <div className="text-center">
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
          {customerData.name} ✨
        </p>
      </div>

      {/* Next Cleaning Card with enhanced design */}
      <Card className="wow-card card-hover animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-3 text-2xl">
            <Calendar className="h-7 w-7 text-sky-500 animate-float" />
            <span>Neste rengjøring</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextCleaning ? (
            <div className="text-center space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="h-5 w-5 text-sky-500" />
                    <span className="font-semibold text-lg">{nextCleaning.date}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-5 w-5 text-sky-500" />
                    <span className="font-semibold text-lg">{nextCleaning.time}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="h-5 w-5 text-sky-500" />
                    <span className="font-semibold text-lg">{nextCleaning.address}</span>
                  </div>
                </div>
              </div>
              
              <Badge variant="secondary" className="bg-sky-100 text-sky-800 text-lg px-4 py-2">
                {nextCleaning.type}
              </Badge>
              
              <div className="flex justify-center">
                <Sparkles className="h-16 w-16 text-sky-400 animate-pulse-glow" />
              </div>
              
              <Button 
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-8 py-3 text-lg"
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
        {/* Enhanced Loyalty Card */}
        <Card className="wow-card card-hover animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-xl">
              <Gift className="h-6 w-6 text-sky-500 animate-float" />
              <span>Lojalitetsprogram</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div>
              <div className="text-4xl font-bold text-sky-600 animate-pulse-glow">
                {customerData.loyaltyPoints}
              </div>
              <p className="text-sm text-muted-foreground">Lojalitetspoeng</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Fremgang til gratis vask</span>
                <span>{customerData.loyaltyPoints % 10}/10</span>
              </div>
              <div className="w-full bg-sky-100 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-sky-500 to-blue-600 h-3 rounded-full transition-all duration-500 animate-pulse-glow"
                  style={{ width: `${loyaltyProgress}%` }}
                ></div>
              </div>
            </div>

            {freeCleaningsEarned > 0 && (
              <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
                <Star className="h-8 w-8 text-sky-600 mx-auto mb-2 animate-float" />
                <p className="text-sm font-medium text-sky-700">
                  Du har {freeCleaningsEarned} gratis vask tilgjengelig!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Previous Cleanings with enhanced design */}
        <Card className="wow-card card-hover lg:col-span-2 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-dusty-500" />
              <span>{t('dashboard.previousCleanings')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previousCleanings.map((cleaning) => (
                <div key={cleaning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{cleaning.date} - {cleaning.time}</div>
                    <div className="text-sm text-muted-foreground">{cleaning.type}</div>
                    <Badge variant="outline" className="text-xs">
                      {cleaning.status === 'completed' ? 'Fullført' : 'Planlagt'}
                    </Badge>
                  </div>
                  {cleaning.beforeImage && cleaning.afterImage && (
                    <div className="flex space-x-2">
                      <div className="text-center">
                        <Camera className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-xs text-muted-foreground">Før & Etter</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="wow-card card-hover lg:col-span-3 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-dusty-500" />
              <span>{t('dashboard.invoices')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Dato</th>
                    <th className="text-left py-2">Beløp</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Handling</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="py-2">{invoice.date}</td>
                      <td className="py-2">{invoice.amount} kr</td>
                      <td className="py-2">
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                          {invoice.status === 'paid' ? 'Betalt' : 'Venter'}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Button variant="outline" size="sm">
                          Last ned PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          <h2 className="text-2xl font-semibold mb-4">{customerData.name}</h2>
          <p className="text-muted-foreground">Profilinnstillinger kommer snart...</p>
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
                  {property.squareMeters && (
                    <div className="text-center">
                      <div className="font-medium text-sky-600">{property.squareMeters}m²</div>
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
                
                {property.hasPets && (
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
        onAddProperty={handleAddProperty}
      />
      
      <PropertyForm 
        isOpen={isPropertyFormOpen}
        onClose={handleClosePropertyForm}
        onSave={handleAddProperty}
        onUpdate={handleUpdateProperty}
        editingProperty={editingProperty}
      />
    </div>
  );
};

export default CustomerDashboard;
