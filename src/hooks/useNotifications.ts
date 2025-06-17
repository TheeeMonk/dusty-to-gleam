
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'booking_confirmed' | 'reminder' | 'general';
  title: string;
  message: string;
  scheduled_for?: string;
  sent: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission;
    }
    return 'denied';
  };

  // Send browser notification
  const sendBrowserNotification = (title: string, message: string) => {
    if (permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  // Send booking confirmation notification
  const sendBookingConfirmation = (bookingDetails: {
    customerName: string;
    serviceType: string;
    scheduledDate?: string;
    scheduledTime?: string;
  }) => {
    const title = 'Bestilling bekreftet! ✅';
    const message = `Din ${bookingDetails.serviceType} ${
      bookingDetails.scheduledDate 
        ? `er planlagt ${bookingDetails.scheduledDate} kl. ${bookingDetails.scheduledTime}`
        : 'er mottatt og vil bli planlagt'
    }`;

    // Show toast notification
    toast({
      title,
      description: message,
    });

    // Send browser notification
    sendBrowserNotification(title, message);

    console.log('Booking confirmation notification sent:', {
      title,
      message,
      bookingDetails
    });
  };

  // Send reminder notification (1 day before)
  const sendReminder = (bookingDetails: {
    customerName: string;
    serviceType: string;
    scheduledDate: string;
    scheduledTime: string;
    address: string;
  }) => {
    const title = 'Påminnelse: Vask i morgen 🧽';
    const message = `${bookingDetails.serviceType} er planlagt i morgen kl. ${bookingDetails.scheduledTime} på ${bookingDetails.address}`;

    // Show toast notification
    toast({
      title,
      description: message,
    });

    // Send browser notification
    sendBrowserNotification(title, message);

    console.log('Reminder notification sent:', {
      title,
      message,
      bookingDetails
    });
  };

  // Schedule reminder for 1 day before booking
  const scheduleReminder = (bookingDetails: {
    scheduledDate: string;
    scheduledTime: string;
    customerName: string;
    serviceType: string;
    address: string;
  }) => {
    const scheduledDateTime = new Date(`${bookingDetails.scheduledDate}T${bookingDetails.scheduledTime}`);
    const reminderTime = new Date(scheduledDateTime.getTime() - 24 * 60 * 60 * 1000); // 1 day before
    const now = new Date();

    if (reminderTime > now) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        sendReminder(bookingDetails);
      }, timeUntilReminder);

      console.log('Reminder scheduled for:', reminderTime.toLocaleString('no-NO'), {
        bookingDetails,
        timeUntilReminder: Math.round(timeUntilReminder / 1000 / 60 / 60) + ' hours'
      });
    } else {
      console.log('Booking is too soon for reminder (less than 24 hours)');
    }
  };

  // Initialize notifications
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        requestPermission();
      }
    }
  }, []);

  return {
    permission,
    requestPermission,
    sendBookingConfirmation,
    sendReminder,
    scheduleReminder,
    notifications
  };
};
