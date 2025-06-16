
import React, { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import IntroScreen from '@/components/IntroScreen';
import UserTypeSelection from '@/components/UserTypeSelection';
import RegistrationForm, { RegistrationData } from '@/components/RegistrationForm';
import CustomerDashboard from '@/components/CustomerDashboard';
import EmployeeDashboard from '@/components/EmployeeDashboard';

type AppState = 'intro' | 'userType' | 'register' | 'customerDashboard' | 'employeeDashboard';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('intro');
  const [userType, setUserType] = useState<'customer' | 'employee' | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const handleContinueFromIntro = () => {
    setAppState('userType');
  };

  const handleUserTypeSelection = (type: 'customer' | 'employee') => {
    setUserType(type);
    if (type === 'customer') {
      setAppState('register');
    } else {
      // For demo purposes, go directly to employee dashboard
      // In real app, this would require authentication
      setAppState('employeeDashboard');
    }
  };

  const handleRegistrationComplete = (data: RegistrationData) => {
    setRegistrationData(data);
    setAppState('customerDashboard');
    
    // Here you would typically save the data to Supabase
    console.log('Registration data to save to Supabase:', data);
  };

  const mockCustomerData = {
    name: registrationData?.fullName || 'Anna Hansen',
    loyaltyPoints: 23
  };

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
