
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Property } from '@/hooks/useProperties';

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => Promise<Property | null>;
  onUpdate?: (id: string, property: Partial<Property>) => Promise<Property | null>;
  editingProperty?: Property | null;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onUpdate,
  editingProperty 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: '',
    rooms: '',
    square_meters: '',
    windows: '',
    has_pets: false,
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingProperty) {
      setFormData({
        name: editingProperty.name,
        address: editingProperty.address,
        type: editingProperty.type,
        rooms: editingProperty.rooms?.toString() || '',
        square_meters: editingProperty.square_meters?.toString() || '',
        windows: editingProperty.windows?.toString() || '',
        has_pets: editingProperty.has_pets || false,
        notes: editingProperty.notes || ''
      });
    } else {
      setFormData({
        name: '',
        address: '',
        type: '',
        rooms: '',
        square_meters: '',
        windows: '',
        has_pets: false,
        notes: ''
      });
    }
  }, [editingProperty, isOpen]);

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.type) {
      return;
    }

    setSaving(true);

    const selectedType = propertyTypes.find(type => type.value === formData.type);
    
    const propertyData = {
      name: formData.name,
      address: formData.address,
      type: selectedType?.label || formData.type,
      rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
      square_meters: formData.square_meters ? parseInt(formData.square_meters) : undefined,
      windows: formData.windows ? parseInt(formData.windows) : undefined,
      has_pets: formData.has_pets,
      notes: formData.notes || undefined
    };

    try {
      if (editingProperty && onUpdate) {
        await onUpdate(editingProperty.id, propertyData);
      } else {
        await onSave(propertyData);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      type: '',
      rooms: '',
      square_meters: '',
      windows: '',
      has_pets: false,
      notes: ''
    });
    onClose();
  };

  const isEditing = !!editingProperty;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text text-center flex items-center justify-center space-x-2">
            <Building className="h-6 w-6 text-sky-500" />
            <span>{isEditing ? 'Rediger eiendom' : 'Legg til ny eiendom'}</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            {isEditing ? 'Oppdater eiendomsinformasjon' : 'Registrer en ny eiendom for rengjøring'}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rooms" className="text-sm font-medium">
                    Antall rom
                  </Label>
                  <Input
                    id="rooms"
                    type="number"
                    placeholder="F.eks. 4"
                    value={formData.rooms}
                    onChange={(e) => handleInputChange('rooms', e.target.value)}
                    className="border-sky-200 focus:border-sky-400"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="square_meters" className="text-sm font-medium">
                    Kvadratmeter
                  </Label>
                  <Input
                    id="square_meters"
                    type="number"
                    placeholder="F.eks. 120"
                    value={formData.square_meters}
                    onChange={(e) => handleInputChange('square_meters', e.target.value)}
                    className="border-sky-200 focus:border-sky-400"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="windows" className="text-sm font-medium">
                    Antall vinduer
                  </Label>
                  <Input
                    id="windows"
                    type="number"
                    placeholder="F.eks. 12"
                    value={formData.windows}
                    onChange={(e) => handleInputChange('windows', e.target.value)}
                    className="border-sky-200 focus:border-sky-400"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="has_pets"
                    checked={formData.has_pets}
                    onCheckedChange={(checked) => handleInputChange('has_pets', checked)}
                  />
                  <Label htmlFor="has_pets" className="text-sm font-medium">
                    Har du kjæledyr i boligen?
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Spesielle instrukser eller merknader
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="F.eks. ekstra oppmerksomhet på bestemte områder, allergier, tilgangsinformasjon..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="border-sky-200 focus:border-sky-400 min-h-[100px]"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  className="px-6"
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Avbryt
                </Button>
                <Button 
                  type="submit"
                  className="px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Lagrer...' : (isEditing ? 'Oppdater eiendom' : 'Lagre eiendom')}
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
