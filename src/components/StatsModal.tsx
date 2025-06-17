
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/hooks/useBookings';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Trophy, Timer, Home, Star, Calendar, DollarSign } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'loyalty' | 'pending' | 'properties' | 'completed' | null;
  data: {
    loyaltyPoints: number;
    pendingBookings: Booking[];
    properties: any[];
    completedBookings: Booking[];
  };
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, type, data }) => {
  const formatPrice = (priceInOre: number) => {
    return `${(priceInOre / 100).toFixed(0)} kr`;
  };

  const getTitle = () => {
    switch (type) {
      case 'loyalty':
        return 'Lojalitetspoeng';
      case 'pending':
        return 'Ventende bestillinger';
      case 'properties':
        return 'Mine eiendommer';
      case 'completed':
        return 'Fullførte rengjøringer';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'loyalty':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Timer className="h-5 w-5 text-orange-500" />;
      case 'properties':
        return <Home className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <Star className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'loyalty':
        return (
          <div className="text-center space-y-4">
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {data.loyaltyPoints}
              </div>
              <p className="text-sm text-muted-foreground">
                Du har tjent {data.loyaltyPoints} lojalitetspoeng gjennom dine bestillinger!
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Bruk poengene dine for å få rabatter på fremtidige rengjøringer.
            </p>
          </div>
        );

      case 'pending':
        return (
          <div className="space-y-4">
            {data.pendingBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Ingen ventende bestillinger
              </p>
            ) : (
              data.pendingBookings.map((booking) => (
                <Card key={booking.id} className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{booking.service_type}</h3>
                      <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                        Venter
                      </Badge>
                    </div>
                    {booking.scheduled_date && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {format(new Date(booking.scheduled_date), 'dd.MM.yyyy', { locale: nb })}
                        {booking.scheduled_time && ` kl. ${booking.scheduled_time}`}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Bestilt: {format(new Date(booking.created_at), 'dd.MM.yyyy HH:mm', { locale: nb })}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        );

      case 'properties':
        return (
          <div className="space-y-4">
            {data.properties.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Ingen eiendommer registrert
              </p>
            ) : (
              data.properties.map((property) => (
                <Card key={property.id} className="border-green-200">
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
              ))
            )}
          </div>
        );

      case 'completed':
        return (
          <div className="space-y-4">
            {data.completedBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Ingen fullførte rengjøringer ennå
              </p>
            ) : (
              data.completedBookings.map((booking) => (
                <Card key={booking.id} className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{booking.service_type}</h3>
                      <Badge className="bg-green-100 text-green-800">
                        Fullført
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {format(new Date(booking.created_at), 'dd.MM.yyyy', { locale: nb })}
                    </p>
                    {booking.estimated_price_min && booking.estimated_price_max && (
                      <p className="text-sm font-medium text-green-600">
                        <DollarSign className="h-3 w-3 inline mr-1" />
                        {formatPrice(booking.estimated_price_min)} - {formatPrice(booking.estimated_price_max)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>{getTitle()}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsModal;
