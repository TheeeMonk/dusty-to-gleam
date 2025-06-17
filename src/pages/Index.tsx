
import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import IntroScreen from '@/components/IntroScreen';
import UserTypeSelection from '@/components/UserTypeSelection';
import RegistrationForm, { RegistrationData } from '@/components/RegistrationForm';
import CustomerDashboard from '@/components/CustomerDashboard';
import EmployeeDashboard from '@/components/EmployeeDashboard';

type AppState = 'intro' | 'userType' | 'register' | 'customerDashboard' | 'employeeDashboard';

const Index = () => {
  const { user, loading } = useAuth();
  console.log('Index component is rendering');
  
  const [appState, setAppState] = useState<AppState>('intro');
  const [userType, setUserType] = useState<'customer' | 'employee' | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  console.log('Current app state:', appState);
  console.log('Current user type:', userType);
  console.log('User authenticated:', !!user);

  useEffect(() => {
    // If user is authenticated, go directly to customer dashboard
    if (user && !loading) {
      console.log('User is authenticated, going to customer dashboard');
      setAppState('customerDashboard');
    }
  }, [user, loading]);

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

  if (loading) {
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
        {/* If user is authenticated, show customer dashboard */}
        {user && appState === 'customerDashboard' && (
          <CustomerDashboard customerData={mockCustomerData} />
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
        
        {appState === 'employeeDashboard' && (
          <EmployeeDashboard />
        )}
      </div>
    </LanguageProvider>
  );
};

export default Index;
