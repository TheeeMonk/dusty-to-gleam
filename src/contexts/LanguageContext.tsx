
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'no' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  no: {
    // Intro & Language Selection
    'welcome.title': 'Velkommen til Dusty & Dirty',
    'welcome.subtitle': 'Profesjonell rengjøring for ditt hjem',
    'language.select': 'Velg språk',
    'language.continue': 'Fortsett',
    
    // Registration Form
    'register.title': 'Registrer din bolig',
    'register.subtitle': 'Vi trenger noen detaljer for å gi deg den beste tjenesten',
    'register.fullName': 'Fullt navn',
    'register.phone': 'Mobilnummer',
    'register.address': 'Adresse',
    'register.postalCode': 'Postnummer',
    'register.municipality': 'Kommune',
    'register.houseType': 'Boligtype',
    'register.rooms': 'Antall rom',
    'register.bathrooms': 'Antall bad',
    'register.windows': 'Antall vinduer',
    'register.squareMeters': 'Kvadratmeter',
    'register.floors': 'Antall etasjer',
    'register.pets': 'Husdyr',
    'register.submit': 'Fullfør registrering',
    
    // House types
    'house.detached': 'Enebolig',
    'house.townhouse': 'Rekkehus',
    'house.apartment': 'Leilighet',
    'house.cabin': 'Hytte',
    
    // Common
    'yes': 'Ja',
    'no': 'Nei',
    'cancel': 'Avbryt',
    'save': 'Lagre',
    'edit': 'Rediger',
    'delete': 'Slett',
    'loading': 'Laster...',
    
    // Dashboard
    'dashboard.customer': 'Kunde Dashboard',
    'dashboard.employee': 'Ansatt Dashboard',
    'dashboard.nextCleaning': 'Neste rengjøring',
    'dashboard.noUpcomingCleaning': 'Ingen kommende rengjøring planlagt',
    'dashboard.bookCleaning': 'Bestill rengjøring',
    'dashboard.manageProperties': 'Administrer eiendommer',
    'dashboard.noCleaning': 'Ingen vask er bestilt.',
    'dashboard.bookNext': 'Bestill din neste vask!',
    'dashboard.previousCleanings': 'Tidligere vasker',
    'dashboard.recentCleanings': 'Nylige rengjøringer',
    'dashboard.loyaltyCard': 'Lojalitetskort',
    'dashboard.loyaltyPoints': 'Lojalitetspoeng',
    'dashboard.properties': 'Eiendommer',
    'dashboard.completedCleanings': 'Fullførte rengjøringer',
    'dashboard.invoices': 'Fakturaer',
    'dashboard.todaysJobs': 'Dagens oppdrag',
    'dashboard.upcomingJobs': 'Kommende oppdrag',
    
    // Employee actions
    'employee.startCleaning': 'Start vask',
    'employee.finishCleaning': 'Sluttfør vask',
    'employee.uploadBefore': 'Last opp før-bilde',
    'employee.uploadAfter': 'Last opp etter-bilde',
    
    // Forms
    'form.required': 'Dette feltet er påkrevd',
    'form.invalidEmail': 'Ugyldig e-post adresse',
    'form.invalidPhone': 'Ugyldig telefonnummer',
  },
  en: {
    // Intro & Language Selection
    'welcome.title': 'Welcome to Dusty & Dirty',
    'welcome.subtitle': 'Professional cleaning for your home',
    'language.select': 'Select Language',
    'language.continue': 'Continue',
    
    // Registration Form
    'register.title': 'Register Your Home',
    'register.subtitle': 'We need some details to provide you with the best service',
    'register.fullName': 'Full Name',
    'register.phone': 'Mobile Number',
    'register.address': 'Address',
    'register.postalCode': 'Postal Code',
    'register.municipality': 'Municipality',
    'register.houseType': 'House Type',
    'register.rooms': 'Number of Rooms',
    'register.bathrooms': 'Number of Bathrooms',
    'register.windows': 'Number of Windows',
    'register.squareMeters': 'Square Meters',
    'register.floors': 'Number of Floors',
    'register.pets': 'Pets',
    'register.submit': 'Complete Registration',
    
    // House types
    'house.detached': 'Detached House',
    'house.townhouse': 'Townhouse',
    'house.apartment': 'Apartment',
    'house.cabin': 'Cabin',
    
    // Common
    'yes': 'Yes',
    'no': 'No',
    'cancel': 'Cancel',
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    'loading': 'Loading...',
    
    // Dashboard
    'dashboard.customer': 'Customer Dashboard',
    'dashboard.employee': 'Employee Dashboard',
    'dashboard.nextCleaning': 'Next Cleaning',
    'dashboard.noUpcomingCleaning': 'No upcoming cleaning scheduled',
    'dashboard.bookCleaning': 'Book Cleaning',
    'dashboard.manageProperties': 'Manage Properties',
    'dashboard.noCleaning': 'No cleaning is booked.',
    'dashboard.bookNext': 'Book your next cleaning!',
    'dashboard.previousCleanings': 'Previous Cleanings',
    'dashboard.recentCleanings': 'Recent Cleanings',
    'dashboard.loyaltyCard': 'Loyalty Card',
    'dashboard.loyaltyPoints': 'Loyalty Points',
    'dashboard.properties': 'Properties',
    'dashboard.completedCleanings': 'Completed Cleanings',
    'dashboard.invoices': 'Invoices',
    'dashboard.todaysJobs': "Today's Jobs",
    'dashboard.upcomingJobs': 'Upcoming Jobs',
    
    // Employee actions
    'employee.startCleaning': 'Start Cleaning',
    'employee.finishCleaning': 'Finish Cleaning',
    'employee.uploadBefore': 'Upload Before Photo',
    'employee.uploadAfter': 'Upload After Photo',
    
    // Forms
    'form.required': 'This field is required',
    'form.invalidEmail': 'Invalid email address',
    'form.invalidPhone': 'Invalid phone number',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('no');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('dusty-dirty-language') as Language;
    if (savedLanguage && (savedLanguage === 'no' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('dusty-dirty-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
