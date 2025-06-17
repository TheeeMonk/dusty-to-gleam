
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, User, MapPin, Briefcase, MoreHorizontal } from 'lucide-react';

interface BottomNavigationProps {
  userRole: 'customer' | 'employee';
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  userRole, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-sky-200/50 shadow-2xl z-50">
      <div className="flex justify-center items-center px-4 py-2 max-w-md mx-auto">
        <div className="flex space-x-1">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => onTabChange('dashboard')}
            className="flex flex-col items-center space-y-1 px-4 py-3"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Hjem</span>
          </Button>
          
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            onClick={() => onTabChange('profile')}
            className="flex flex-col items-center space-y-1 px-4 py-3"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profil</span>
          </Button>
          
          <Button
            variant={activeTab === 'homes' ? 'default' : 'ghost'}
            onClick={() => onTabChange('homes')}
            className="flex flex-col items-center space-y-1 px-4 py-3"
          >
            <MapPin className="h-5 w-5" />
            <span className="text-xs">Boliger</span>
          </Button>
          
          {userRole === 'employee' && (
            <Button
              variant={activeTab === 'employee' ? 'default' : 'ghost'}
              onClick={() => onTabChange('employee')}
              className="flex flex-col items-center space-y-1 px-4 py-3"
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-xs">Ansatt</span>
            </Button>
          )}
          
          <Button
            variant={activeTab === 'more' ? 'default' : 'ghost'}
            onClick={() => onTabChange('more')}
            className="flex flex-col items-center space-y-1 px-4 py-3"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-xs">Mer</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
