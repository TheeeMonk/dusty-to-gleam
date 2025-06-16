
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Gift, 
  FileText, 
  Camera,
  Sparkles
} from 'lucide-react';

interface Cleaning {
  id: string;
  date: string;
  time: string;
  type: string;
  address: string;
  status: 'completed' | 'scheduled' | 'in-progress';
  beforeImage?: string;
  afterImage?: string;
}

interface CustomerDashboardProps {
  customerData: {
    name: string;
    loyaltyPoints: number;
  };
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customerData }) => {
  const { t } = useLanguage();
  
  const [nextCleaning] = useState<Cleaning | null>({
    id: '1',
    date: '2024-06-20',
    time: '10:00',
    type: 'Standard rengjøring',
    address: 'Hjemme',
    status: 'scheduled'
  });

  const [previousCleanings] = useState<Cleaning[]>([
    {
      id: '2',
      date: '2024-06-10',
      time: '14:00',
      type: 'Dybderengjøring',
      address: 'Hjemme',
      status: 'completed',
      beforeImage: '/api/placeholder/150/150',
      afterImage: '/api/placeholder/150/150'
    },
    {
      id: '3',
      date: '2024-05-25',
      time: '11:00',
      type: 'Standard rengjøring',
      address: 'Hjemme',
      status: 'completed'
    }
  ]);

  const [invoices] = useState([
    { id: '1', date: '2024-06-10', amount: 1200, status: 'paid' },
    { id: '2', date: '2024-05-25', amount: 800, status: 'paid' }
  ]);

  const loyaltyProgress = (customerData.loyaltyPoints % 10) * 10;
  const freeCleaningsEarned = Math.floor(customerData.loyaltyPoints / 10);

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            {t('dashboard.customer')}
          </h1>
          <p className="text-lg text-muted-foreground">
            Velkommen tilbake, {customerData.name}! ✨
          </p>
        </div>

        {/* Next Cleaning Card */}
        <Card className="glass-effect card-hover mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-dusty-500" />
              <span>{t('dashboard.nextCleaning')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextCleaning ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{nextCleaning.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{nextCleaning.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{nextCleaning.address}</span>
                  </div>
                  <Badge variant="secondary">{nextCleaning.type}</Badge>
                </div>
                <div className="text-center">
                  <Sparkles className="h-12 w-12 text-dusty-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-muted-foreground">Gleder oss til å rengjøre!</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg mb-4">{t('dashboard.noCleaning')}</p>
                <Button className="bg-gradient-to-r from-dusty-500 to-dirty-500 hover:from-dusty-600 hover:to-dirty-600">
                  {t('dashboard.bookNext')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loyalty Card */}
          <Card className="glass-effect card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-dirty-500" />
                <span>{t('dashboard.loyaltyCard')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-dirty-600">
                  {customerData.loyaltyPoints}
                </div>
                <p className="text-sm text-muted-foreground">Lojalitetspoeng</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fremgang til gratis vask</span>
                  <span>{customerData.loyaltyPoints % 10}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-dirty-500 to-dirty-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loyaltyProgress}%` }}
                  ></div>
                </div>
              </div>

              {freeCleaningsEarned > 0 && (
                <div className="text-center p-3 bg-dirty-50 rounded-lg">
                  <Star className="h-6 w-6 text-dirty-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-dirty-700">
                    Du har {freeCleaningsEarned} gratis vask tilgjengelig!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Previous Cleanings */}
          <Card className="glass-effect card-hover lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-dusty-500" />
                <span>{t('dashboard.previousCleanings')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previousCleanings.map((cleaning) => (
                  <div key={cleaning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{cleaning.date} - {cleaning.time}</div>
                      <div className="text-sm text-muted-foreground">{cleaning.type}</div>
                      <Badge variant="outline" className="text-xs">
                        {cleaning.status === 'completed' ? 'Fullført' : 'Planlagt'}
                      </Badge>
                    </div>
                    {cleaning.beforeImage && cleaning.afterImage && (
                      <div className="flex space-x-2">
                        <div className="text-center">
                          <Camera className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                          <div className="text-xs text-muted-foreground">Før & Etter</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="glass-effect card-hover lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-dusty-500" />
                <span>{t('dashboard.invoices')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Dato</th>
                      <th className="text-left py-2">Beløp</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Handling</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b">
                        <td className="py-2">{invoice.date}</td>
                        <td className="py-2">{invoice.amount} kr</td>
                        <td className="py-2">
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                            {invoice.status === 'paid' ? 'Betalt' : 'Venter'}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Button variant="outline" size="sm">
                            Last ned PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
