
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUploader, type Upload } from '@/lib/useUploader';
import { UploadCloud, File as FileIcon, X, Trash2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { listAllFiles, deleteObject } from '@/lib/storage.client';
import { useToast } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';

type StoredFile = { name: string; url: string; path: string };

export default function UploadsPage() {
  const { uploads, addFiles, removeUpload } = useUploader();
  const { push: toast } = useToast();
  const [storedFiles, setStoredFiles] = React.useState<StoredFile[]>([]);
  const [loadingFiles, setLoadingFiles] = React.useState(true);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const fetchFiles = React.useCallback(async () => {
    setLoadingFiles(true);
    try {
        const files = await listAllFiles();
        setStoredFiles(files);
    } catch(e: any) {
        toast({kind: 'error', text: e.message || 'Failed to list files.'});
    } finally {
        setLoadingFiles(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);
  
  const handleDelete = async (file: StoredFile) => {
    try {
        await deleteObject(file.path);
        setStoredFiles(prev => prev.filter(f => f.path !== file.path));
        toast({ kind: 'success', text: `Deleted ${file.name}` });
    } catch (e: any) {
        toast({ kind: 'error', text: e.message || 'Failed to delete file.' });
    }
  };

  const UploadItem = ({ upload }: { upload: Upload }) => (
    <div className="flex items-center gap-4 rounded-lg border p-3">
        <FileIcon className="h-6 w-6 text-muted-foreground" />
        <div className="flex-1">
            <p className="text-sm font-medium truncate">{upload.file.name}</p>
            <Progress value={upload.progress} className="h-2 mt-1" />
            <p className="text-xs text-muted-foreground mt-1">
                 {upload.state === 'uploading' && `Uploading... ${Math.round(upload.progress)}%`}
                 {upload.state === 'success' && <span className="flex items-center text-green-500"><CheckCircle className="h-3 w-3 mr-1"/>Complete</span>}
                 {upload.state === 'error' && <span className="flex items-center text-red-500"><AlertCircle className="h-3 w-3 mr-1"/>Error: {upload.error?.message}</span>}
            </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => {
            if(upload.state === 'uploading') upload.cancel();
            removeUpload(upload.id);
        }}>
            <X className="h-4 w-4" />
        </Button>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>Drag and drop files or click to browse.</CardDescription>
        </CardHeader>
        <CardContent>
          <div {...getRootProps()} className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
            <input {...getInputProps()} />
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">{isDragActive ? 'Drop the files here...' : 'Drag files here, or click to select'}</p>
          </div>
          {uploads.length > 0 && (
            <div className="mt-6 space-y-4">
                {uploads.map(upload => <UploadItem key={upload.id} upload={upload} />)}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>Manage your previously uploaded files.</CardDescription>
        </CardHeader>
        <CardContent>
            {loadingFiles ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : storedFiles.length > 0 ? (
                <ul className="space-y-2">
                    {storedFiles.map(file => (
                        <li key={file.path} className="flex items-center gap-3 rounded-md border p-2">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="flex-1 text-sm truncate">{file.name}</span>
                            <Button asChild variant="ghost" size="icon">
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(file)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-muted-foreground py-10">No files uploaded yet.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
