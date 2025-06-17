
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useBookings } from '@/hooks/useBookings';
import { Property } from '@/hooks/useProperties';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onAddProperty: (propertyData: any) => Promise<any>;
}

// Service types with their characteristics
const serviceTypes = [
  { value: 'standard', label: 'Standard vask', hourlyRate: 450 },
  { value: 'flyttevask', label: 'Flyttevask', hourlyRate: 699 },
  { value: 'naeringsvask', label: 'Næringsvask', hourlyRate: 699 },
  { value: 'vindusvask', label: 'Vindusvask', hourlyRate: 350 },
  { value: 'sesongvask', label: 'Sesong vask', hourlyRate: 500 }
];

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, properties, onAddProperty }) => {
  const { toast } = useToast();
  const { createBooking } = useBookings();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(60);
  const [estimatedPriceMin, setEstimatedPriceMin] = useState<number>(500);
  const [estimatedPriceMax, setEstimatedPriceMax] = useState<number>(1000);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // Calculate price and duration based on selected property and service type
  useEffect(() => {
    if (selectedPropertyId && serviceType) {
      const selectedProperty = properties.find(p => p.id === selectedPropertyId);
      const selectedService = serviceTypes.find(s => s.value === serviceType);
      
      if (selectedProperty && selectedService) {
        const { duration, priceMin, priceMax } = calculateServiceEstimate(selectedProperty, selectedService);
        setEstimatedDuration(duration);
        setEstimatedPriceMin(priceMin);
        setEstimatedPriceMax(priceMax);
      }
    }
  }, [selectedPropertyId, serviceType, properties]);

  const calculateServiceEstimate = (property: Property, service: any) => {
    const squareMeters = property.square_meters || 50; // Default to 50m² if not specified
    const rooms = property.rooms || 2; // Default to 2 rooms
    const windows = property.windows || 5; // Default to 5 windows
    const bathrooms = property.bathrooms || 1; // Default to 1 bathroom
    
    let baseDuration = 60; // Base duration in minutes
    let duration = baseDuration;
    
    switch (service.value) {
      case 'standard':
        // Standard cleaning: 15-20 min per room + 10 min per bathroom
        duration = (rooms * 17) + (bathrooms * 10) + (squareMeters * 0.5);
        break;
        
      case 'flyttevask':
        // Moving cleaning: More thorough, 45-60 min per room + 20 min per bathroom
        duration = (rooms * 52) + (bathrooms * 20) + (squareMeters * 1.2);
        break;
        
      case 'naeringsvask':
        // Commercial cleaning: Based on square meters primarily
        duration = squareMeters * 1.5 + (rooms * 15);
        break;
        
      case 'vindusvask':
        // Window cleaning: 8-12 min per window
        duration = windows * 10;
        break;
        
      case 'sesongvask':
        // Seasonal cleaning: Thorough but less than moving
        duration = (rooms * 35) + (bathrooms * 15) + (squareMeters * 0.8);
        break;
        
      default:
        duration = baseDuration;
    }
    
    // Ensure minimum duration
    duration = Math.max(duration, 30);
    
    // Calculate price based on duration and hourly rate
    const hours = duration / 60;
    const basePrice = hours * service.hourlyRate;
    
    // Add variation for min/max (±20%)
    const priceMin = Math.round(basePrice * 0.8 * 100); // Convert to øre
    const priceMax = Math.round(basePrice * 1.2 * 100); // Convert to øre
    
    return {
      duration: Math.round(duration),
      priceMin,
      priceMax
    };
  };

  const formatPrice = (priceInOre: number) => {
    return `${(priceInOre / 100).toFixed(0)} kr`;
  };

  const getSelectedServiceLabel = () => {
    const service = serviceTypes.find(s => s.value === serviceType);
    return service ? service.label : '';
  };

  const handleCreateBooking = async () => {
    if (!selectedPropertyId || !serviceType || !selectedDate || !selectedTime) {
      toast({
        title: "Advarsel",
        description: "Vennligst fyll ut alle obligatoriske felt.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createBooking({
        property_id: selectedPropertyId,
        service_type: getSelectedServiceLabel(),
        status: 'pending',
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        estimated_duration: estimatedDuration,
        estimated_price_min: estimatedPriceMin,
        estimated_price_max: estimatedPriceMax,
        special_instructions: specialInstructions
      });

      toast({
        title: "Suksess",
        description: "Booking opprettet!",
      });
      
      // Reset form
      setSelectedPropertyId('');
      setServiceType('');
      setSelectedDate('');
      setSelectedTime('');
      setEstimatedDuration(60);
      setEstimatedPriceMin(500);
      setEstimatedPriceMax(1000);
      setSpecialInstructions('');
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke opprette booking.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Opprett Ny Booking</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="property">Velg Eiendom</Label>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Velg en eiendom" />
              </SelectTrigger>
              <SelectContent>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} - {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="service-type">Type tjeneste</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Velg type vask" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map(service => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Valgt dato</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="time">Valgt tidspunkt</Label>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>

          {/* Show estimated details when both property and service are selected */}
          {selectedPropertyId && serviceType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-blue-900">Estimat for {getSelectedServiceLabel()}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-medium text-blue-700">Varighet</div>
                  <div className="text-blue-900">{estimatedDuration} min</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-700">Fra</div>
                  <div className="text-blue-900">{formatPrice(estimatedPriceMin)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-700">Til</div>
                  <div className="text-blue-900">{formatPrice(estimatedPriceMax)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="instructions">Spesielle instruksjoner</Label>
            <Textarea
              id="instructions"
              placeholder="F.eks. Ring ved ankomst, spesielle ønsker eller tilgangsinformasjon"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Lukk
          </Button>
          <Button onClick={handleCreateBooking}>
            Opprett Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
