
import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import IntroScreen from '@/components/IntroScreen';
import UserTypeSelection from '@/components/UserTypeSelection';
import RegistrationForm, { RegistrationData } from '@/components/RegistrationForm';
import CustomerDashboard from '@/components/CustomerDashboard';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import BottomNavigation from '@/components/BottomNavigation';

type AppState = 'intro' | 'userType' | 'register' | 'customerDashboard' | 'employeeDashboard';

const Index = () => {
  const { user, loading } = useAuth();
  const { userRoles, loading: rolesLoading, isEmployee } = useUserRoles();
  
  const [appState, setAppState] = useState<AppState>('intro');
  const [userType, setUserType] = useState<'customer' | 'employee' | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  console.log('Current app state:', appState);
  console.log('Current user type:', userType);
  console.log('User authenticated:', !!user);
  console.log('User roles:', userRoles);

  useEffect(() => {
    // If user is authenticated and roles are loaded, determine which dashboard to show
    if (user && !loading && !rolesLoading) {
      console.log('User is authenticated, checking roles...');
      
      if (isEmployee()) {
        console.log('User is employee, going to employee dashboard');
        setAppState('employeeDashboard');
      } else {
        console.log('User is customer, going to customer dashboard');
        setAppState('customerDashboard');
      }
    }
  }, [user, loading, rolesLoading, userRoles, isEmployee]);

  const handleContinueFromIntro = () => {
    console.log('Continuing from intro screen');
    setAppState('userType');
  };

  const handleUserTypeSelection = (type: 'customer' | 'employee') => {
    console.log('User type selection function called with:', type);
    console.log('Setting user type to:', type);
    setUserType(type);
    
    if (type === 'customer') {
      console.log('Going to registration form');
      setAppState('register');
    } else {
      console.log('Going to employee dashboard');
      setAppState('employeeDashboard');
    }
    
    console.log('App state should now be:', type === 'customer' ? 'register' : 'employeeDashboard');
  };

  const handleRegistrationComplete = (data: RegistrationData) => {
    console.log('Registration completed with data:', data);
    setRegistrationData(data);
    setAppState('customerDashboard');
    
    console.log('Registration data to save to Supabase:', data);
  };

  const mockCustomerData = {
    name: user?.email || registrationData?.fullName || 'Anna Hansen',
    loyaltyPoints: 23
  };

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-sky-600">Laster...</p>
        </div>
      </div>
    );
  }

  console.log('About to render component for state:', appState);

  return (
    <LanguageProvider>
      <div className="w-full">
        {/* If user is authenticated, show appropriate dashboard based on role */}
        {user && appState === 'customerDashboard' && (
          <>
            <CustomerDashboard 
              customerData={mockCustomerData} 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <BottomNavigation 
              userRole="customer"
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </>
        )}
        
        {user && appState === 'employeeDashboard' && (
          <>
            <EmployeeDashboard />
            <BottomNavigation 
              userRole="employee"
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </>
        )}
        
        {/* If no user, show the flow */}
        {!user && appState === 'intro' && (
          <IntroScreen onContinue={handleContinueFromIntro} />
        )}
        
        {!user && appState === 'userType' && (
          <UserTypeSelection onSelectUserType={handleUserTypeSelection} />
        )}
        
        {!user && appState === 'register' && (
          <RegistrationForm onComplete={handleRegistrationComplete} />
        )}
        
        {!user && appState === 'employeeDashboard' && (
          <EmployeeDashboard />
        )}
      </div>
    </LanguageProvider>
  );
};

export default Index;
