// Hook personalizado para gravação de áudio
'use client';

import { useState, useRef, useCallback } from 'react';

type PermissionState = 'unknown' | 'granted' | 'denied' | 'prompt';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Verificar estado da permissão
  const checkPermission = useCallback(async (): Promise<PermissionState> => {
    if (!navigator.permissions) {
      return 'unknown';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionState(permission.state);
      return permission.state;
    } catch (error) {
      console.warn('Não foi possível verificar permissão do microfone:', error);
      return 'unknown';
    }
  }, []);

  // Solicitar permissão
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Liberar o stream imediatamente, pois vamos solicitar novamente na gravação
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
      return true;
    } catch (error) {
      console.error('Permissão negada:', error);
      setPermissionState('denied');
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        // Limpar stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setPermissionState('granted');
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setPermissionState('denied');
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearAudio = useCallback(() => {
    setAudioBlob(null);
  }, []);

  return {
    isRecording,
    audioBlob,
    permissionState,
    startRecording,
    stopRecording,
    clearAudio,
    checkPermission,
    requestPermission,
  };
}