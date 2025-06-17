import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PropertyForm from '@/components/PropertyForm';
import { 
  Home, 
  Truck, 
  Eye, 
  Calendar, 
  Building,
  MapPin,
  Clock,
  CheckCircle,
  Plus
} from 'lucide-react';

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

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onAddProperty?: (property: Omit<Property, 'id'>) => Promise<Property>;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  properties, 
  onAddProperty 
}) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [step, setStep] = useState<'service' | 'property' | 'confirmation'>('service');
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);

  const services = [
    {
      id: 'standard',
      name: 'Standard vask',
      description: 'Grundig rengjøring av alle rom',
      icon: Home,
      price: '800-1200 kr',
      duration: '2-3 timer'
    },
    {
      id: 'moving',
      name: 'Flyttevask',
      description: 'Dyptgående vask ved inn/utflytting',
      icon: Truck,
      price: '1500-2500 kr',
      duration: '4-6 timer'
    },
    {
      id: 'windows',
      name: 'Vindus vask',
      description: 'Innvendig og utvendig vindusvask',
      icon: Eye,
      price: '400-800 kr',
      duration: '1-2 timer'
    },
    {
      id: 'seasonal',
      name: 'Sesongvask',
      description: 'Grundig vask 2-4 ganger per år',
      icon: Calendar,
      price: '1000-1800 kr',
      duration: '3-5 timer'
    },
    {
      id: 'commercial',
      name: 'Næringsvask',
      description: 'Rengjøring av kontor og butikklokaler',
      icon: Building,
      price: 'Fra 600 kr/time',
      duration: 'Etter avtale'
    }
  ];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep('property');
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperty(propertyId);
    setStep('confirmation');
  };

  const handleAddNewProperty = () => {
    setIsPropertyFormOpen(true);
  };

  const handlePropertyFormSave = async (newProperty: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    if (onAddProperty) {
      const savedProperty = await onAddProperty(newProperty);
      if (savedProperty) {
        console.log('New property saved:', savedProperty);
      }
    }
    setIsPropertyFormOpen(false);
  };

  const handleBooking = () => {
    // Handle booking logic here
    console.log('Booking:', { service: selectedService, property: selectedProperty });
    onClose();
    // Reset state
    setStep('service');
    setSelectedService(null);
    setSelectedProperty(null);
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedPropertyData = properties.find(p => p.id === selectedProperty);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text text-center">
              Book rengjøring
            </DialogTitle>
            <DialogDescription className="text-center">
              {step === 'service' && 'Velg type rengjøring'}
              {step === 'property' && 'Velg eiendom'}
              {step === 'confirmation' && 'Bekreft bestilling'}
            </DialogDescription>
          </DialogHeader>

          {step === 'service' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Card 
                    key={service.id}
                    className="wow-card card-hover cursor-pointer animate-fade-in"
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-3">
                        <div className="p-4 bg-sky-100 rounded-full animate-float">
                          <IconComponent className="h-8 w-8 text-sky-600" />
                        </div>
                      </div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Badge variant="secondary" className="bg-sky-100 text-sky-800">
                          {service.price}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {service.duration}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {step === 'property' && (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={() => setStep('service')}
                className="mb-4"
              >
                ← Tilbake til tjenester
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((property) => (
                  <Card 
                    key={property.id}
                    className="wow-card card-hover cursor-pointer animate-fade-in"
                    onClick={() => handlePropertySelect(property.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-sky-100 rounded-full">
                          <Home className="h-6 w-6 text-sky-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{property.name}</h3>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{property.address}</span>
                          </div>
                          <Badge variant="outline" className="mt-2">
                            {property.type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add new property card */}
                <Card 
                  className="wow-card card-hover border-dashed border-sky-300 cursor-pointer animate-fade-in"
                  onClick={handleAddNewProperty}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="p-4 bg-sky-50 rounded-full w-fit mx-auto">
                      <Plus className="h-8 w-8 text-sky-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-sky-700">Legg til ny eiendom</h3>
                      <p className="text-muted-foreground text-sm">Registrer en ny eiendom for rengjøring</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-6">
              <Button 
                variant="outline" 
                onClick={() => setStep('property')}
                className="mb-4"
              >
                ← Tilbake til eiendommer
              </Button>
              
              <Card className="wow-card animate-pulse-glow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-500 animate-float" />
                  </div>
                  <CardTitle className="text-2xl gradient-text">
                    Bekreft bestilling
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Valgt tjeneste</h3>
                      {selectedServiceData && (
                        <div className="p-4 bg-sky-50 rounded-lg">
                          <div className="flex items-center space-x-3 mb-2">
                            <selectedServiceData.icon className="h-5 w-5 text-sky-600" />
                            <span className="font-medium">{selectedServiceData.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {selectedServiceData.description}
                          </p>
                          <div className="flex space-x-2">
                            <Badge variant="secondary">{selectedServiceData.price}</Badge>
                            <Badge variant="outline">{selectedServiceData.duration}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Valgt eiendom</h3>
                      {selectedPropertyData && (
                        <div className="p-4 bg-sky-50 rounded-lg">
                          <div className="flex items-center space-x-3 mb-2">
                            <Home className="h-5 w-5 text-sky-600" />
                            <span className="font-medium">{selectedPropertyData.name}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{selectedPropertyData.address}</span>
                          </div>
                          <Badge variant="outline">{selectedPropertyData.type}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4 pt-6">
                    <Button variant="outline" onClick={onClose}>
                      Avbryt
                    </Button>
                    <Button 
                      onClick={handleBooking}
                      className="px-8 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                    >
                      Bekreft bestilling
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PropertyForm 
        isOpen={isPropertyFormOpen}
        onClose={() => setIsPropertyFormOpen(false)}
        onSave={handlePropertyFormSave}
      />
    </>
  );
};

export default BookingModal;
