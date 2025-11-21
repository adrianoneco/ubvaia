// Componente de upload de arquivos
'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { FiUpload } from 'react-icons/fi';
import { FiX } from 'react-icons/fi';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  clearFile?: boolean;
}

export function FileUploader({ onFileSelect, disabled, clearFile }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (clearFile) {
      setPreview(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [clearFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      alert('Tipo de arquivo não suportado. Use: JPG, PNG, PDF, TXT ou DOCX');
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    setFileName(file.name);

    // Criar preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onFileSelect(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearSelection = () => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,.txt,.docx"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleButtonClick}
        disabled={disabled}
        className="h-10 w-10"
        title="Enviar arquivo"
      >
        <FiUpload className="w-5 h-5" />
      </Button>

      {/* Preview */}
      {(preview || fileName) && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-2 transition-all duration-300 max-h-0 overflow-hidden"
          style={{ maxHeight: (preview || fileName) ? '100px' : '0' }}>
          {preview && (
        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
          )}
          {!preview && fileName && (
        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow">
          <svg
            className="w-7 h-7 text-gray-500 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
          )}
          <div className="flex-1 min-w-0">
        <p className="text-base font-semibold truncate text-gray-800 dark:text-gray-100">{fileName}</p>
          </div>
          <button
        type="button"
        onClick={clearSelection}
        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        aria-label="Remover arquivo"
          >
        <FiX className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
