'use client';

import { useCallback, useState, useRef } from 'react';
import { HiOutlineCloudArrowUp, HiOutlineDocumentCheck } from 'react-icons/hi2';

interface DropZoneProps {
  onFileHashed: (hash: string, fileName: string, fileSize: number) => void;
  disabled?: boolean;
}

export default function DropZone({ onFileHashed, disabled = false }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileHash, setFileHash] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const hashFile = useCallback(async (file: File) => {
    setHashing(true);
    setFileName(file.name);
    setFileHash('');

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setFileHash(hex);
      onFileHashed(hex, file.name, file.size);
    } catch {
      setFileHash('');
    } finally {
      setHashing(false);
    }
  }, [onFileHashed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) hashFile(file);
  }, [disabled, hashFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) hashFile(file);
  }, [hashFile]);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`drop-zone flex flex-col items-center justify-center gap-3 p-8 text-center transition-all ${
          dragging ? 'active' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {hashing ? (
          <>
            <div className="h-10 w-10 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
            <p className="text-sm text-slate-400">Computing SHA-256 hash…</p>
          </>
        ) : fileHash ? (
          <>
            <HiOutlineDocumentCheck className="h-10 w-10 text-emerald-400" />
            <p className="text-sm text-slate-300">{fileName}</p>
            <p className="text-xs text-slate-500">Click or drop a new file to replace</p>
          </>
        ) : (
          <>
            <HiOutlineCloudArrowUp className="h-10 w-10 text-brand-400" />
            <p className="text-sm text-slate-300">
              Drag & drop your file here, or <span className="text-brand-400 font-medium">browse</span>
            </p>
            <p className="text-xs text-slate-500">
              File is hashed locally — never uploaded
            </p>
          </>
        )}
      </div>

      {fileHash && (
        <div className="rounded-lg bg-surface-800/50 border border-brand-900/20 p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">SHA-256 Hash</p>
          <p className="text-xs text-brand-300 font-mono break-all">{fileHash}</p>
        </div>
      )}
    </div>
  );
}
