
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/hooks/useBookings';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Calendar, Clock, MapPin, User, FileText, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  const formatPrice = (priceInOre: number) => {
    return `${(priceInOre / 100).toFixed(0)} kr`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-sky-500" />
            <span>Bestillingsdetaljer</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <Badge 
              variant={booking.status === 'confirmed' ? 'default' : 'outline'} 
              className={`${booking.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-yellow-800'}`}
            >
              {booking.status === 'confirmed' ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Bekreftet
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Venter på bekreftelse
                </>
              )}
            </Badge>
          </div>

          {/* Service Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Tjeneste</span>
            <span className="font-medium">{booking.service_type}</span>
          </div>

          {/* Date and Time */}
          {booking.scheduled_date && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Dato</span>
                <span className="font-medium">
                  {format(new Date(booking.scheduled_date), 'dd.MM.yyyy', { locale: nb })}
                </span>
              </div>
              
              {booking.scheduled_time && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Tid</span>
                  <span className="font-medium">{booking.scheduled_time}</span>
                </div>
              )}
            </div>
          )}

          {/* Duration */}
          {booking.estimated_duration && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Estimert varighet</span>
              <span className="font-medium">{booking.estimated_duration} min</span>
            </div>
          )}

          {/* Price */}
          {booking.estimated_price_min && booking.estimated_price_max && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Estimert pris</span>
              <span className="font-medium text-green-600">
                {formatPrice(booking.estimated_price_min)} - {formatPrice(booking.estimated_price_max)}
              </span>
            </div>
          )}

          {/* Special Instructions */}
          {booking.special_instructions && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Spesielle instruksjoner</span>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">{booking.special_instructions}</p>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Bestilt</span>
            <span className="text-sm">
              {format(new Date(booking.created_at), 'dd.MM.yyyy HH:mm', { locale: nb })}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
