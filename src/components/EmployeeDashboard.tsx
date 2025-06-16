
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  MapPin, 
  User, 
  Camera, 
  Play, 
  Square,
  CalendarDays,
  Timer
} from 'lucide-react';

interface Job {
  id: string;
  customerName: string;
  address: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'in-progress' | 'completed';
  startTime?: string;
  endTime?: string;
  beforeImage?: string;
  afterImage?: string;
}

const EmployeeDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [todaysJobs, setTodaysJobs] = useState<Job[]>([
    {
      id: '1',
      customerName: 'Anna Hansen',
      address: 'Storgata 15, 0184 Oslo',
      date: '2024-06-16',
      time: '09:00',
      type: 'Standard rengjøring',
      status: 'pending'
    },
    {
      id: '2',
      customerName: 'Erik Johansen',
      address: 'Løkkeveien 8, 0585 Oslo',
      date: '2024-06-16',
      time: '13:00',
      type: 'Dybderengjøring',
      status: 'pending'
    }
  ]);

  const [upcomingJobs] = useState<Job[]>([
    {
      id: '3',
      customerName: 'Maria Olsen',
      address: 'Bygdøy allé 2, 0257 Oslo',
      date: '2024-06-17',
      time: '10:00',
      type: 'Standard rengjøring',
      status: 'pending'
    },
    {
      id: '4',
      customerName: 'Lars Andersen',
      address: 'Grünerløkka 12, 0552 Oslo',
      date: '2024-06-18',
      time: '14:30',
      type: 'Vinduspuss',
      status: 'pending'
    }
  ]);

  const handleStartJob = (jobId: string) => {
    const now = new Date().toLocaleTimeString('no-NO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setTodaysJobs(jobs => 
      jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'in-progress' as const, startTime: now }
          : job
      )
    );
    
    toast({
      title: 'Vask startet',
      description: `Vask hos ${todaysJobs.find(j => j.id === jobId)?.customerName} er påbegynt.`,
    });
  };

  const handleFinishJob = (jobId: string) => {
    const now = new Date().toLocaleTimeString('no-NO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setTodaysJobs(jobs => 
      jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'completed' as const, endTime: now }
          : job
      )
    );
    
    toast({
      title: 'Vask fullført',
      description: `Vask hos ${todaysJobs.find(j => j.id === jobId)?.customerName} er fullført.`,
    });
  };

  const handleImageUpload = (jobId: string, type: 'before' | 'after') => {
    // Simulate image upload
    console.log(`Uploading ${type} image for job ${jobId}`);
    toast({
      title: 'Bilde lastet opp',
      description: `${type === 'before' ? 'Før' : 'Etter'}-bilde ble lastet opp.`,
    });
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Job['status']) => {
    switch (status) {
      case 'pending': return 'Venter';
      case 'in-progress': return 'Pågår';
      case 'completed': return 'Fullført';
      default: return 'Ukjent';
    }
  };

  const activeJobs = todaysJobs.filter(job => job.status === 'in-progress');
  const completedToday = todaysJobs.filter(job => job.status === 'completed').length;

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            {t('dashboard.employee')}
          </h1>
          <p className="text-lg text-muted-foreground">
            God morgen! La oss gjøre hjemmene rene og fine ✨
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="glass-effect">
            <CardContent className="p-4 text-center">
              <CalendarDays className="h-8 w-8 text-dusty-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{todaysJobs.length}</div>
              <p className="text-sm text-muted-foreground">Dagens oppdrag</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect">
            <CardContent className="p-4 text-center">
              <Timer className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{activeJobs.length}</div>
              <p className="text-sm text-muted-foreground">Aktive oppdrag</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect">
            <CardContent className="p-4 text-center">
              <Square className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{completedToday}</div>
              <p className="text-sm text-muted-foreground">Fullført i dag</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Jobs */}
        <Card className="glass-effect card-hover mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-dusty-500" />
              <span>{t('dashboard.todaysJobs')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysJobs.map((job) => (
                <div key={job.id} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{job.customerName}</span>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusText(job.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{job.address}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{job.time} - {job.type}</span>
                      </div>

                      {job.startTime && (
                        <div className="text-sm text-muted-foreground">
                          Startet: {job.startTime}
                          {job.endTime && ` • Fullført: ${job.endTime}`}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      {job.status === 'pending' && (
                        <Button 
                          onClick={() => handleStartJob(job.id)}
                          className="bg-gradient-to-r from-dusty-500 to-dirty-500 hover:from-dusty-600 hover:to-dirty-600"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {t('employee.startCleaning')}
                        </Button>
                      )}
                      
                      {job.status === 'in-progress' && (
                        <>
                          <Button 
                            onClick={() => handleFinishJob(job.id)}
                            variant="default"
                          >
                            <Square className="h-4 w-4 mr-2" />
                            {t('employee.finishCleaning')}
                          </Button>
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleImageUpload(job.id, 'before')}
                            >
                              <Camera className="h-3 w-3 mr-1" />
                              Før
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleImageUpload(job.id, 'after')}
                            >
                              <Camera className="h-3 w-3 mr-1" />
                              Etter
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {job.status === 'completed' && (
                        <div className="text-center">
                          <Badge variant="default" className="bg-green-500">
                            ✓ Fullført
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Jobs */}
        <Card className="glass-effect card-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-dirty-500" />
              <span>{t('dashboard.upcomingJobs')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{job.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {job.date} kl. {job.time} - {job.type}
                    </div>
                    <div className="text-sm text-muted-foreground">{job.address}</div>
                  </div>
                  <Badge variant="outline">{getStatusText(job.status)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
