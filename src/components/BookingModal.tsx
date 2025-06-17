import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useToast } from "@/hooks/use-toast"
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
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
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
        estimated_duration,
        estimated_price_min: estimatedPriceMin,
        estimated_price_max: estimatedPriceMax,
        special_instructions: specialInstructions
      });

      toast({
        title: "Suksess",
        description: "Booking opprettet!",
      });
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
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Opprett Ny Booking</ModalHeader>
            <ModalBody>
              <Select
                label="Velg Eiendom"
                placeholder="Velg en eiendom"
                selectedKeys={[selectedPropertyId || '']}
                onSelectionChange={key => setSelectedPropertyId(key.currentKey)}
              >
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} - {property.address}
                  </SelectItem>
                ))}
              </Select>

              <Input
                type="text"
                label="Type tjeneste"
                placeholder="F.eks. Vask"
                value={serviceType}
                onValueChange={setServiceType}
              />

              <Input
                type="date"
                label="Valgt dato"
                value={selectedDate}
                onValueChange={setSelectedDate}
              />

              <Input
                type="time"
                label="Valgt tidspunkt"
                value={selectedTime}
                onValueChange={setSelectedTime}
              />

              <Input
                type="number"
                label="Estimert varighet (minutter)"
                value={estimatedDuration}
                onValueChange={value => setEstimatedDuration(Number(value))}
              />

              <Input
                type="number"
                label="Estimert minimumspris"
                value={estimatedPriceMin}
                onValueChange={value => setEstimatedPriceMin(Number(value))}
              />

              <Input
                type="number"
                label="Estimert maksimumspris"
                value={estimatedPriceMax}
                onValueChange={value => setEstimatedPriceMax(Number(value))}
              />

              <Textarea
                label="Spesielle instruksjoner"
                placeholder="F.eks. Ring ved ankomst"
                value={specialInstructions}
                onValueChange={setSpecialInstructions}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Lukk
              </Button>
              <Button color="primary" onPress={handleCreateBooking}>
                Opprett Booking
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BookingModal;
