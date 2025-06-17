
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff, 
  Camera,
  Save,
  Edit3,
  MapPin,
  Calendar,
  Settings
} from 'lucide-react';

const ProfileSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, refetch } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailBookingConfirmation: true,
    smsReminders: true,
    emailPromotions: false,
    pushNotifications: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareBookingHistory: false,
    allowMarketingEmails: false
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        if (emailError) throw emailError;
        toast.success('E-post oppdatert! Sjekk din e-post for bekreftelse.');
      }

      // Update password if provided
      if (formData.newPassword && formData.newPassword === formData.confirmPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        if (passwordError) throw passwordError;
        toast.success('Passord oppdatert!');
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      await refetch();
      setIsEditing(false);
      toast.success('Profil oppdatert!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Kunne ikke oppdatere profil');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Du er nå logget ut');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Kunne ikke logge ut');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-sky-600">Laster profil...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Min Profil</span>
          </h1>
          <p className="text-muted-foreground">
            Administrer dine personlige innstillinger og preferanser
          </p>
        </div>

        {/* Profile Overview Card */}
        <Card className="glass-effect">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src="" alt={formData.fullName} />
                  <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white text-xl">
                    {getInitials(formData.fullName || user?.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-sky-500 hover:bg-sky-600"
                  onClick={() => toast.info('Profilbilde funksjon kommer snart!')}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardTitle className="text-xl">{formData.fullName || 'Ukjent bruker'}</CardTitle>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex justify-center gap-2 mt-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Aktiv kunde
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-sky-500" />
              <CardTitle>Personlig informasjon</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Avbryt' : 'Rediger'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Fullt navn</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Skriv inn fullt navn"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefonnummer</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="+47 123 45 678"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-postadresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  placeholder="din@email.no"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Medlem siden</Label>
                <Input
                  value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('no-NO') : 'Ukjent'}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {isEditing && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-sky-500" />
                    Endre passord
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nytt passord</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          placeholder="Skriv inn nytt passord"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Bekreft passord</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Bekreft nytt passord"
                      />
                    </div>
                  </div>
                  
                  {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-sm text-red-500">Passordene matcher ikke</p>
                  )}
                </div>
              </>
            )}

            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-sky-500 to-blue-600"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Lagrer...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lagre endringer
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass-effect">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-sky-500" />
              <CardTitle>Varslingsinnstillinger</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>E-post bekreftelser</Label>
                <p className="text-sm text-muted-foreground">Motta e-post når bestillinger bekreftes</p>
              </div>
              <Switch
                checked={notifications.emailBookingConfirmation}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, emailBookingConfirmation: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS påminnelser</Label>
                <p className="text-sm text-muted-foreground">Få SMS dagen før rengjøring</p>
              </div>
              <Switch
                checked={notifications.smsReminders}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, smsReminders: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Markedsføring</Label>
                <p className="text-sm text-muted-foreground">Motta tilbud og nyheter</p>
              </div>
              <Switch
                checked={notifications.emailPromotions}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, emailPromotions: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push-varsler</Label>
                <p className="text-sm text-muted-foreground">Motta varsler i nettleseren</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="glass-effect">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-sky-500" />
              <CardTitle>Personvern og sikkerhet</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Synlig profil</Label>
                <p className="text-sm text-muted-foreground">La ansatte se din profilinformasjon</p>
              </div>
              <Switch
                checked={privacy.profileVisible}
                onCheckedChange={(checked) => 
                  setPrivacy(prev => ({ ...prev, profileVisible: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Del bestillingshistorikk</Label>
                <p className="text-sm text-muted-foreground">Hjelp oss forbedre tjenesten</p>
              </div>
              <Switch
                checked={privacy.shareBookingHistory}
                onCheckedChange={(checked) => 
                  setPrivacy(prev => ({ ...prev, shareBookingHistory: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Markedsføring via e-post</Label>
                <p className="text-sm text-muted-foreground">Motta personaliserte tilbud</p>
              </div>
              <Switch
                checked={privacy.allowMarketingEmails}
                onCheckedChange={(checked) => 
                  setPrivacy(prev => ({ ...prev, allowMarketingEmails: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="glass-effect border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-600">Kontohandlinger</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Logg ut
              </Button>
              
              <Button
                variant="outline"
                onClick={() => toast.info('Eksport funksjon kommer snart!')}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Eksporter mine data
              </Button>
              
              <Button
                variant="outline"
                onClick={() => toast.error('Kontakt kundeservice for å slette konto')}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Slett konto
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Ved å slette kontoen din vil all data bli permanent fjernet. Denne handlingen kan ikke angres.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
