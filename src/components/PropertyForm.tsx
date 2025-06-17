
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Building, Save, X } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
}

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Omit<Property, 'id'>) => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: ''
  });

  const propertyTypes = [
    { value: 'detached', label: 'Enebolig' },
    { value: 'apartment', label: 'Leilighet' },
    { value: 'townhouse', label: 'Rekkehus' },
    { value: 'cabin', label: 'Hytte/Fritidsbolig' },
    { value: 'commercial', label: 'Næringsbygg' },
    { value: 'office', label: 'Kontor' },
    { value: 'warehouse', label: 'Lager' },
    { value: 'retail', label: 'Butikk' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.type) {
      return;
    }

    const selectedType = propertyTypes.find(type => type.value === formData.type);
    
    onSave({
      name: formData.name,
      address: formData.address,
      type: selectedType?.label || formData.type
    });

    // Reset form
    setFormData({
      name: '',
      address: '',
      type: ''
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      type: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text text-center flex items-center justify-center space-x-2">
            <Building className="h-6 w-6 text-sky-500" />
            <span>Legg til ny eiendom</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            Registrer en ny eiendom for rengjøring
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Navn på eiendom *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="F.eks. Hovedbolig, Kontor Oslo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="border-sky-200 focus:border-sky-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Type eiendom *
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="border-sky-200 focus:border-sky-400">
                      <SelectValue placeholder="Velg type eiendom" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Adresse *
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="F.eks. Storgata 1, 0181 Oslo"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="border-sky-200 focus:border-sky-400"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  className="px-6"
                >
                  <X className="h-4 w-4 mr-2" />
                  Avbryt
                </Button>
                <Button 
                  type="submit"
                  className="px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lagre eiendom
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyForm;
