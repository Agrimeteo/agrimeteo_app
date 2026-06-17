import React, { useEffect, useMemo, useState } from 'react';
import { Bell, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LOCATION_STORAGE_KEY = 'agro_location_permission_state';
const NOTIFICATION_STORAGE_KEY = 'agro_notification_permission_state';

const PermissionPrompt: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const permissionNeeds = useMemo(() => {
    const needsLocation =
      isAuthenticated &&
      role !== 'admin' &&
      typeof navigator !== 'undefined' &&
      'geolocation' in navigator &&
      !localStorage.getItem(LOCATION_STORAGE_KEY);

    const needsNotifications =
      isAuthenticated &&
      role !== 'admin' &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default' &&
      !localStorage.getItem(NOTIFICATION_STORAGE_KEY);

    return {
      needsLocation,
      needsNotifications,
    };
  }, [isAuthenticated, role]);

  useEffect(() => {
    setVisible(permissionNeeds.needsLocation || permissionNeeds.needsNotifications);
  }, [permissionNeeds.needsLocation, permissionNeeds.needsNotifications]);

  const requestLocationPermission = async () => {
    if (!permissionNeeds.needsLocation || !('geolocation' in navigator)) {
      return;
    }

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await api.post('/profile/location', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            localStorage.setItem(LOCATION_STORAGE_KEY, 'granted');
          } catch (error) {
            console.error('Failed to save user location:', error);
          } finally {
            resolve();
          }
        },
        (error) => {
          console.error('Location permission denied:', error);
          localStorage.setItem(LOCATION_STORAGE_KEY, 'denied');
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10 * 60 * 1000,
        }
      );
    });
  };

  const requestNotificationPermission = async () => {
    if (!permissionNeeds.needsNotifications || !('Notification' in window)) {
      return;
    }

    try {
      const result = await Notification.requestPermission();
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, result);
    } catch (error) {
      console.error('Notification permission request failed:', error);
    }
  };

  const handleAllow = async () => {
    setRequesting(true);
    try {
      await requestLocationPermission();
      await requestNotificationPermission();
    } finally {
      setRequesting(false);
      setVisible(false);
    }
  };

  const handleLater = () => {
    if (permissionNeeds.needsLocation) {
      localStorage.setItem(LOCATION_STORAGE_KEY, 'dismissed');
    }

    if (permissionNeeds.needsNotifications) {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'dismissed');
    }

    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-900">Help AgroSmart personalize your farm data</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Allow your current location and notifications so AgroSmart can show weather conditions closer to your farm
          and alert you at the right time.
        </p>

        <div className="mt-5 space-y-3">
          {permissionNeeds.needsLocation && (
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Use my current location</p>
                <p className="text-sm text-slate-600">We use it to choose weather data closer to where you farm.</p>
              </div>
            </div>
          )}

          {permissionNeeds.needsNotifications && (
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Bell size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Enable notifications</p>
                <p className="text-sm text-slate-600">Receive reminders, weather alerts, and follow-up plan updates.</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleLater}
            className="rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Later
          </button>
          <button
            onClick={() => void handleAllow()}
            disabled={requesting}
            className="rounded-xl bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {requesting ? 'Requesting...' : 'Allow'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionPrompt;
