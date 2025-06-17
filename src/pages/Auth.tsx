
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Mail, Lock, User, Phone } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      setError('Vennligst fyll ut alle feltene');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('En feil oppstod under pålogging');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !fullName) {
      setError('Vennligst fyll ut alle påkrevde feltene');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Sjekk e-posten din for bekreftelseslenke!');
      }
    } catch (err) {
      setError('En feil oppstod under registrering');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full">
              <Sparkles className="h-12 w-12 text-sky-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-sky-800 mb-2">Dusty & Dirty</h1>
          <p className="text-sky-600">Logg inn eller opprett konto</p>
        </div>

        <Card className="shadow-lg border-sky-200">
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Logg inn</TabsTrigger>
                <TabsTrigger value="signup">Registrer</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>E-post</span>
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="din@epost.no"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="border-sky-200 focus:border-sky-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Passord</span>
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Ditt passord"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="border-sky-200 focus:border-sky-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                  >
                    {loading ? 'Logger inn...' : 'Logg inn'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Fullt navn *</span>
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Ola Nordmann"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="border-sky-200 focus:border-sky-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Telefon</span>
                    </Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="12345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-sky-200 focus:border-sky-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>E-post *</span>
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="din@epost.no"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="border-sky-200 focus:border-sky-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Passord *</span>
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minst 6 tegn"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={6}
                      className="border-sky-200 focus:border-sky-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                  >
                    {loading ? 'Oppretter konto...' : 'Opprett konto'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
