// Componente para gravação de áudio
'use client';

import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export function AudioRecorder({ onAudioRecorded, disabled = false }: AudioRecorderProps) {
  const { 
    isRecording, 
    audioBlob, 
    permissionState, 
    startRecording, 
    stopRecording, 
    clearAudio, 
    checkPermission, 
    requestPermission 
  } = useAudioRecorder();
  
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Verificar permissão ao montar o componente
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const handleClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      // Verificar permissão antes de gravar
      const currentPermission = await checkPermission();
      
      if (currentPermission === 'denied') {
        alert('Permissão para microfone foi negada. Verifique as configurações do navegador.');
        return;
      }
      
      if (currentPermission === 'unknown' || currentPermission === 'prompt') {
        setShowPermissionDialog(true);
        return;
      }
      
      // Permissão concedida, iniciar gravação
      startRecording();
    }
  };

  const handlePermissionGranted = async () => {
    setShowPermissionDialog(false);
    const granted = await requestPermission();
    if (granted) {
      startRecording();
    }
  };

  const handlePermissionDenied = () => {
    setShowPermissionDialog(false);
  };

  // Quando o áudio for gravado, enviar para o callback
  React.useEffect(() => {
    if (audioBlob) {
      onAudioRecorded(audioBlob);
      clearAudio();
    }
  }, [audioBlob, onAudioRecorded, clearAudio]);

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled}
        className={`p-2 rounded-full transition-all duration-200 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white'
            : permissionState === 'denied'
            ? 'bg-gray-400 hover:bg-gray-500 text-gray-600'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
        title={
          permissionState === 'denied'
            ? 'Microfone bloqueado'
            : isRecording 
            ? 'Parar gravação' 
            : 'Gravar áudio'
        }
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {permissionState === 'denied' ? (
            // Ícone de microfone bloqueado
            <>
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12l3.41-3.41A3 3 0 0 0 12 6v0a3 3 0 0 0-3 3v3z" />
              <path d="M12 18v3" />
              <path d="M8 22h8" />
            </>
          ) : (
            // Ícone de microfone normal
            <>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </>
          )}
        </svg>
      </Button>

      {/* Dialog de solicitação de permissão */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Permissão para Microfone</DialogTitle>
            <DialogDescription>
              Para gravar áudio, precisamos de acesso ao seu microfone. 
              Clique em "Permitir" quando solicitado pelo navegador.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={handlePermissionDenied}>
              Cancelar
            </Button>
            <Button onClick={handlePermissionGranted}>
              Solicitar Permissão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}