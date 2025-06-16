
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Briefcase, Home, Users } from 'lucide-react';

interface UserTypeSelectionProps {
  onSelectUserType: (type: 'customer' | 'employee') => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelectUserType }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Dusty & Dirty
          </h1>
          <p className="text-lg text-muted-foreground">
            Hvordan vil du logge inn?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Card */}
          <Card className="glass-effect card-hover cursor-pointer transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-dusty-100 rounded-full">
                  <Home className="h-12 w-12 text-dusty-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-dusty-700">Kunde</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Bestill rengjøring, se tidligere vasker og administrer din konto
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Se dine bestillinger</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Lojalitetsprogram</span>
                </div>
              </div>

              <Button 
                onClick={() => onSelectUserType('customer')}
                className="w-full bg-dusty-500 hover:bg-dusty-600"
                size="lg"
              >
                Logg inn som kunde
              </Button>
            </CardContent>
          </Card>

          {/* Employee Card */}
          <Card className="glass-effect card-hover cursor-pointer transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-dirty-100 rounded-full">
                  <Briefcase className="h-12 w-12 text-dirty-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-dirty-700">Ansatt</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Se dagens oppdrag, administrer vasker og last opp bilder
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Dagens oppdrag</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Jobbadministrasjon</span>
                </div>
              </div>

              <Button 
                onClick={() => onSelectUserType('employee')}
                className="w-full bg-dirty-500 hover:bg-dirty-600"
                size="lg"
              >
                Logg inn som ansatt
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Trenger du hjelp? Kontakt oss på support@dustyanddirty.no
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
