// Componente para solicitar permissão de microfone
'use client';

import { useState, useEffect } from 'react';
import { checkMicrophonePermission, requestMicrophonePermission, isMicrophoneSupported } from '@/lib/utils/mediaPermissions';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface MicrophonePermissionBannerProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export function MicrophonePermissionBanner({ 
  onPermissionGranted, 
  onPermissionDenied 
}: MicrophonePermissionBannerProps) {
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [isVisible, setIsVisible] = useState(false);
  const [isSupported] = useState(() => isMicrophoneSupported());

  useEffect(() => {
    if (!isSupported) return;

    const checkPermission = async () => {
      const state = await checkMicrophonePermission();
      setPermissionState(state);
      
      // Mostrar banner se permissão não foi concedida
      if (state === 'prompt' || state === 'unknown') {
        setIsVisible(true);
      }
    };

    checkPermission();
  }, [isSupported]);

  const handleRequestPermission = async () => {
    const granted = await requestMicrophonePermission();
    if (granted) {
      setPermissionState('granted');
      setIsVisible(false);
      onPermissionGranted?.();
    } else {
      setPermissionState('denied');
      onPermissionDenied?.();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isSupported || !isVisible) {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 dark:text-blue-400"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span className="text-sm">
              Permita o acesso ao microfone para gravar mensagens de áudio
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              Depois
            </Button>
            <Button size="sm" onClick={handleRequestPermission}>
              Permitir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}