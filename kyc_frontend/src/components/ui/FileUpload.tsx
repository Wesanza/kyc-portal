import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, FileText, Image, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatFileSize, validateFileSize, validateFileType } from '../../utils/formatters';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  helper?: string;
  className?: string;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 10,
  value,
  onChange,
  error: externalError,
  helper,
  className,
  required,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = externalError || localError;

  const handleFile = useCallback(
    (file: File) => {
      setLocalError(null);
      const sizeErr = validateFileSize(file, maxSizeMB);
      if (sizeErr) { setLocalError(sizeErr); return; }
      const allowed = accept
        .split(',')
        .flatMap((ext) => {
          if (ext.includes('pdf')) return ['application/pdf'];
          if (ext.includes('jpg') || ext.includes('jpeg')) return ['image/jpeg'];
          if (ext.includes('png')) return ['image/png'];
          return [];
        });
      const typeErr = validateFileType(file, allowed);
      if (typeErr) { setLocalError(typeErr); return; }
      onChange(file);
    },
    [accept, maxSizeMB, onChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const isImage = value?.type.startsWith('image/');

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-body font-medium text-charcoal">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {value ? (
        // Filled state
        <div
          className={cn(
            'relative flex items-center gap-3 p-4 rounded-xl border-2 bg-mint-surface transition-all duration-250',
            error ? 'border-error' : 'border-success'
          )}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-card overflow-hidden">
            {isImage ? (
              <img
                src={URL.createObjectURL(value)}
                alt={value.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FileText className="w-5 h-5 text-forest" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body font-medium text-charcoal truncate">{value.name}</p>
            <p className="text-xs font-body text-medium-gray">{formatFileSize(value.size)}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
          <button
            type="button"
            onClick={() => { onChange(null); setLocalError(null); }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-card flex items-center justify-center hover:bg-red-50 transition-colors"
          >
            <X className="w-3 h-3 text-medium-gray hover:text-error" />
          </button>
        </div>
      ) : (
        // Drop zone
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-250',
            isDragging
              ? 'border-lime bg-lime/5 scale-[1.01]'
              : error
              ? 'border-error bg-red-50/30'
              : 'border-forest-light bg-off-white hover:border-lime hover:bg-mint-surface'
          )}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              isDragging ? 'bg-lime/20' : 'bg-forest/10'
            )}
          >
            {isImage ? (
              <Image className={cn('w-6 h-6', isDragging ? 'text-lime' : 'text-forest')} />
            ) : (
              <Upload className={cn('w-6 h-6', isDragging ? 'text-lime' : 'text-forest')} />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-body font-medium text-charcoal">
              {isDragging ? 'Drop file here' : 'Click or drag to upload'}
            </p>
            <p className="text-xs font-body text-medium-gray mt-1">
              PDF, JPG or PNG — max {maxSizeMB}MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}

      {error && <p className="text-xs font-body text-error">{error}</p>}
      {helper && !error && <p className="text-xs font-body text-medium-gray">{helper}</p>}
    </div>
  );
};

export default FileUpload;
