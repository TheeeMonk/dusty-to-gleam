
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Home, User, MapPin, Phone } from 'lucide-react';

interface RegistrationFormProps {
  onComplete: (data: RegistrationData) => void;
}

export interface RegistrationData {
  fullName: string;
  phone: string;
  address: string;
  postalCode: string;
  municipality: string;
  houseType: string;
  rooms: number;
  bathrooms: number;
  windows: string;
  squareMeters: number;
  floors: number;
  pets: boolean;
  language: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onComplete }) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    phone: '',
    address: '',
    postalCode: '',
    municipality: '',
    houseType: '',
    rooms: 1,
    bathrooms: 1,
    windows: '',
    squareMeters: 50,
    floors: 1,
    pets: false,
    language: language,
  });

  const [errors, setErrors] = useState<Partial<RegistrationData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = t('form.required');
    if (!formData.phone.trim()) newErrors.phone = t('form.required');
    if (!formData.address.trim()) newErrors.address = t('form.required');
    if (!formData.postalCode.trim()) newErrors.postalCode = t('form.required');
    if (!formData.municipality.trim()) newErrors.municipality = t('form.required');
    if (!formData.houseType) newErrors.houseType = t('form.required');
    if (!formData.windows) newErrors.windows = t('form.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Registration form submitted:', formData);
      toast({
        title: language === 'no' ? 'Registrering fullført!' : 'Registration completed!',
        description: language === 'no' ? 
          'Velkommen til Dusty & Dirty! Vi kommer snart i kontakt.' : 
          'Welcome to Dusty & Dirty! We will contact you soon.',
      });
      onComplete(formData);
    }
  };

  const updateField = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl glass-effect">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Home className="h-12 w-12 text-dusty-500" />
          </div>
          <CardTitle className="text-2xl gradient-text">{t('register.title')}</CardTitle>
          <p className="text-muted-foreground">{t('register.subtitle')}</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{t('register.fullName')}</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{t('register.phone')}</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{t('register.address')}</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t('register.postalCode')}</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-red-500">{errors.postalCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality">{t('register.municipality')}</Label>
                  <Input
                    id="municipality"
                    value={formData.municipality}
                    onChange={(e) => updateField('municipality', e.target.value)}
                    className={errors.municipality ? 'border-red-500' : ''}
                  />
                  {errors.municipality && (
                    <p className="text-sm text-red-500">{errors.municipality}</p>
                  )}
                </div>
              </div>
            </div>

            {/* House Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('register.houseType')}</Label>
                <Select value={formData.houseType} onValueChange={(value) => updateField('houseType', value)}>
                  <SelectTrigger className={errors.houseType ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('register.houseType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detached">{t('house.detached')}</SelectItem>
                    <SelectItem value="townhouse">{t('house.townhouse')}</SelectItem>
                    <SelectItem value="apartment">{t('house.apartment')}</SelectItem>
                    <SelectItem value="cabin">{t('house.cabin')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.houseType && (
                  <p className="text-sm text-red-500">{errors.houseType}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rooms">{t('register.rooms')}</Label>
                  <Input
                    id="rooms"
                    type="number"
                    min="1"
                    value={formData.rooms}
                    onChange={(e) => updateField('rooms', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">{t('register.bathrooms')}</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => updateField('bathrooms', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floors">{t('register.floors')}</Label>
                  <Input
                    id="floors"
                    type="number"
                    min="1"
                    value={formData.floors}
                    onChange={(e) => updateField('floors', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squareMeters">{t('register.squareMeters')}</Label>
                  <Input
                    id="squareMeters"
                    type="number"
                    min="20"
                    value={formData.squareMeters}
                    onChange={(e) => updateField('squareMeters', parseInt(e.target.value) || 50)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('register.windows')}</Label>
                <Select value={formData.windows} onValueChange={(value) => updateField('windows', value)}>
                  <SelectTrigger className={errors.windows ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('register.windows')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="25+">25+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.windows && (
                  <p className="text-sm text-red-500">{errors.windows}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="pets"
                  checked={formData.pets}
                  onCheckedChange={(checked) => updateField('pets', checked)}
                />
                <Label htmlFor="pets">{t('register.pets')}</Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-dusty-500 to-dirty-500 hover:from-dusty-600 hover:to-dirty-600"
              size="lg"
            >
              {t('register.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
