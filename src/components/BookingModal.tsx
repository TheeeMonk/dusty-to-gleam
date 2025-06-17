
import React, { useState } from 'react';
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
import { useProperties } from '@/hooks/useProperties';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { createBooking } = useBookings();
  const { properties } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(60);
  const [estimatedPriceMin, setEstimatedPriceMin] = useState<number>(500);
  const [estimatedPriceMax, setEstimatedPriceMax] = useState<number>(1000);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

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
        service_type: serviceType,
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
      <DialogContent className="sm:max-w-[425px]">
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
            <Input
              id="service-type"
              type="text"
              placeholder="F.eks. Vask"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            />
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

          <div className="grid gap-2">
            <Label htmlFor="duration">Estimert varighet (minutter)</Label>
            <Input
              id="duration"
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price-min">Estimert minimumspris</Label>
            <Input
              id="price-min"
              type="number"
              value={estimatedPriceMin}
              onChange={(e) => setEstimatedPriceMin(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price-max">Estimert maksimumspris</Label>
            <Input
              id="price-max"
              type="number"
              value={estimatedPriceMax}
              onChange={(e) => setEstimatedPriceMax(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instructions">Spesielle instruksjoner</Label>
            <Textarea
              id="instructions"
              placeholder="F.eks. Ring ved ankomst"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
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
