'use client';

import { useRef, useState } from 'react';
import { uploadMarketingImage } from '@/app/actions/uploadImage';

interface Props {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ currentUrl, onUploaded, label = 'Photo' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(currentUrl ?? '');

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    const result = await uploadMarketingImage(fd);
    setUploading(false);
    if ('error' in result) {
      setError(result.error);
    } else {
      setPreview(result.url);
      onUploaded(result.url);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center gap-3 cursor-pointer hover:border-yellow-400 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="h-32 w-full object-cover rounded" />
        ) : (
          <div className="text-gray-400 text-sm text-center py-4">
            <p className="text-2xl mb-1">📷</p>
            <p>Click or drag to upload</p>
          </div>
        )}
        {uploading && <p className="text-xs text-yellow-600 animate-pulse">Uploading...</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {preview && (
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            value={preview}
            readOnly
            className="text-xs text-gray-500 flex-1 border border-gray-200 rounded px-2 py-1 bg-gray-50"
          />
          <button
            type="button"
            onClick={() => { setPreview(''); onUploaded(''); }}
            className="text-xs text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
