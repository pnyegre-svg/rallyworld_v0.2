
'use client';

import { useState, useCallback } from 'react';
import { upload as uploadFile } from '@/lib/storage.client';

export interface Upload {
  id: string;
  file: File;
  progress: number;
  error: Error | null;
  state: 'pending' | 'uploading' | 'success' | 'error';
  cancel: () => void;
  result?: any;
  category: string;
}

export function useUploader(eventId: string, category: string) {
  const [uploads, setUploads] = useState<Upload[]>([]);

  const updateProgress = useCallback((id: string, progress: number) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, progress } : u));
  }, []);

  const updateState = useCallback((id: string, state: Upload['state'], result?: any, error?: Error | null) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, state, result, error: error || null } : u));
  }, []);

  const addFiles = useCallback((files: File[]) => {
    if (!eventId || !category) return;
    
    const newUploads: Upload[] = Array.from(files).map(file => {
      const id = `${file.name}-${file.size}-${Date.now()}`;
      
      const { task, promise } = uploadFile(file, eventId, category, (p) => {
        updateProgress(id, p.progress);
      });

      const uploadItem: Upload = {
        id,
        file,
        progress: 0,
        error: null,
        state: 'uploading',
        cancel: () => task.cancel(),
        category,
      };

      promise.then(
        (result) => updateState(id, 'success', result),
        (error) => {
            if (error.code !== 'storage/canceled') {
                 updateState(id, 'error', undefined, error);
            }
        }
      );

      return uploadItem;
    });

    setUploads(prev => [...prev, ...newUploads]);
  }, [eventId, category, updateProgress, updateState]);
  
  const removeUpload = useCallback((id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  }, []);

  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  return { uploads, addFiles, removeUpload, clearUploads };
}
