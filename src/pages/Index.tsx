
import React, { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import IntroScreen from '@/components/IntroScreen';
import UserTypeSelection from '@/components/UserTypeSelection';
import RegistrationForm, { RegistrationData } from '@/components/RegistrationForm';
import CustomerDashboard from '@/components/CustomerDashboard';
import EmployeeDashboard from '@/components/EmployeeDashboard';

type AppState = 'intro' | 'userType' | 'register' | 'customerDashboard' | 'employeeDashboard';

const Index = () => {
  console.log('Index component is rendering');
  
  const [appState, setAppState] = useState<AppState>('intro');
  const [userType, setUserType] = useState<'customer' | 'employee' | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  console.log('Current app state:', appState);
  console.log('Current user type:', userType);

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
      // For demo purposes, go directly to employee dashboard
      // In real app, this would require authentication
      setAppState('employeeDashboard');
    }
    
    console.log('App state should now be:', type === 'customer' ? 'register' : 'employeeDashboard');
  };

  const handleRegistrationComplete = (data: RegistrationData) => {
    console.log('Registration completed with data:', data);
    setRegistrationData(data);
    setAppState('customerDashboard');
    
    // Here you would typically save the data to Supabase
    console.log('Registration data to save to Supabase:', data);
  };

  const mockCustomerData = {
    name: registrationData?.fullName || 'Anna Hansen',
    loyaltyPoints: 23
  };

  console.log('About to render component for state:', appState);

  return (
    <LanguageProvider>
      <div className="w-full">
        {appState === 'intro' && (
          <IntroScreen onContinue={handleContinueFromIntro} />
        )}
        
        {appState === 'userType' && (
          <UserTypeSelection onSelectUserType={handleUserTypeSelection} />
        )}
        
        {appState === 'register' && (
          <RegistrationForm onComplete={handleRegistrationComplete} />
        )}
        
        {appState === 'customerDashboard' && (
          <CustomerDashboard customerData={mockCustomerData} />
        )}
        
        {appState === 'employeeDashboard' && (
          <EmployeeDashboard />
        )}
      </div>
    </LanguageProvider>
  );
};

export default Index;
