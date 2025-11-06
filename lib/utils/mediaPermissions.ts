// Utilitários para permissões de mídia
'use client';

export async function checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
  if (!navigator.permissions) {
    return 'unknown';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return permission.state;
  } catch (error) {
    console.warn('Não foi possível verificar permissão do microfone:', error);
    return 'unknown';
  }
}

export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Liberar o stream imediatamente
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão do microfone:', error);
    return false;
  }
}

export function isMicrophoneSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window.MediaRecorder === 'function'
  );
}