
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Sparkles, Home, Users } from 'lucide-react';

interface IntroScreenProps {
  onContinue: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onContinue }) => {
  console.log('IntroScreen is rendering');
  
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageSelect = (lang: Language) => {
    console.log('Language selected:', lang);
    setLanguage(lang);
  };

  const handleContinue = () => {
    console.log('Continue button clicked');
    onContinue();
  };

  console.log('IntroScreen current language:', language);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect card-hover">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Sparkles className="h-16 w-16 text-dusty-500 animate-pulse" />
                <Home className="h-8 w-8 text-dirty-500 absolute -bottom-2 -right-2" />
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {t('welcome.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('welcome.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('language.select')}</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={language === 'no' ? 'default' : 'outline'}
                className="h-16 flex flex-col space-y-1"
                onClick={() => handleLanguageSelect('no')}
              >
                <span className="text-2xl">🇳🇴</span>
                <span className="text-sm">Norsk</span>
              </Button>
              
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                className="h-16 flex flex-col space-y-1"
                onClick={() => handleLanguageSelect('en')}
              >
                <span className="text-2xl">🇬🇧</span>
                <span className="text-sm">English</span>
              </Button>
            </div>

            <Button 
              onClick={handleContinue}
              className="w-full mt-6 bg-gradient-to-r from-dusty-500 to-dirty-500 hover:from-dusty-600 hover:to-dirty-600"
              size="lg"
            >
              {t('language.continue')}
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Professional</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="h-4 w-4" />
              <span>Trusted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

console.log('IntroScreen component defined');

export default IntroScreen;
