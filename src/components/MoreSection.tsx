
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  MessageSquare, 
  Mail, 
  Briefcase, 
  User,
  Settings,
  Bell,
  HelpCircle
} from 'lucide-react';

interface MoreSectionProps {
  onSwitchToEmployee: () => void;
  onSwitchToCustomer: () => void;
}

const MoreSection: React.FC<MoreSectionProps> = ({ 
  onSwitchToEmployee, 
  onSwitchToCustomer 
}) => {
  const { user } = useAuth();
  const { isEmployee } = useUserRoles();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleContactUs = () => {
    setActiveModal('contact');
  };

  const handleChat = () => {
    setActiveModal('chat');
  };

  const handleNotificationSettings = () => {
    setActiveModal('notifications');
  };

  return (
    <div className="min-h-screen p-4 space-y-6 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Mer</h1>
          <p className="text-lg text-muted-foreground">
            Innstillinger og tilleggsfunksjoner
          </p>
        </div>

        {/* User Role Switching */}
        {isEmployee() && (
          <Card className="glass-effect card-hover mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-dusty-500" />
                <span>Bytt visning</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={onSwitchToEmployee}
                className="w-full flex items-center justify-start space-x-3 p-4 h-auto"
                variant="outline"
              >
                <Briefcase className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Ansatt-portal</div>
                  <div className="text-sm text-muted-foreground">
                    Se dagens oppdrag og administrer vasker
                  </div>
                </div>
              </Button>
              <Button 
                onClick={onSwitchToCustomer}
                className="w-full flex items-center justify-start space-x-3 p-4 h-auto"
                variant="outline"
              >
                <User className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Kunde-visning</div>
                  <div className="text-sm text-muted-foreground">
                    Bestill vasker og se dine boliger
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Actions */}
        <Card className="glass-effect card-hover mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-dirty-500" />
              <span>Funksjoner</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleChat}
              className="w-full flex items-center justify-start space-x-3 p-4 h-auto"
              variant="outline"
            >
              <MessageSquare className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Chat med support</div>
                <div className="text-sm text-muted-foreground">
                  Få hjelp fra vårt team
                </div>
              </div>
            </Button>
            
            <Button 
              onClick={handleContactUs}
              className="w-full flex items-center justify-start space-x-3 p-4 h-auto"
              variant="outline"
            >
              <Mail className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Kontakt oss</div>
                <div className="text-sm text-muted-foreground">
                  Send en melding til kundeservice
                </div>
              </div>
            </Button>

            <Button 
              onClick={handleNotificationSettings}
              className="w-full flex items-center justify-start space-x-3 p-4 h-auto"
              variant="outline"
            >
              <Bell className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Varslinger</div>
                <div className="text-sm text-muted-foreground">
                  Administrer push-varsler
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="font-medium">{user?.email}</div>
                <div className="text-sm text-muted-foreground">
                  {isEmployee() ? (
                    <Badge variant="outline" className="text-xs">
                      Ansatt
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Kunde
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Modal */}
      <Dialog open={activeModal === 'contact'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kontakt oss</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Vi er her for å hjelpe deg!</p>
            <div className="space-y-2">
              <div><strong>Telefon:</strong> +47 123 45 678</div>
              <div><strong>E-post:</strong> hjelp@renhold.no</div>
              <div><strong>Åpningstider:</strong> Man-Fre 08:00-16:00</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={activeModal === 'chat'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-md h-96">
          <DialogHeader>
            <DialogTitle>Chat med support</DialogTitle>
          </DialogHeader>
          <div className="flex-1 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center text-sm text-muted-foreground">
              Chat-funksjonen kommer snart! 
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm font-medium mb-1">Support</div>
              <div className="text-sm">
                Hei! Vi jobber med å få chat-funksjonen på plass. 
                I mellomtiden kan du kontakte oss på telefon eller e-post.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Modal */}
      <Dialog open={activeModal === 'notifications'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Varslingsinnstillinger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Bestillingsbekreftelser</div>
                <div className="text-sm text-muted-foreground">
                  Få varsel når bestillingen din blir bekreftet
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">
                Aktivert
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Påminnelser</div>
                <div className="text-sm text-muted-foreground">
                  Få påminnelse 1 dag før planlagt vask
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">
                Aktivert
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Varsler sendes automatisk når bestillinger blir bekreftet og som påminnelser.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MoreSection;
