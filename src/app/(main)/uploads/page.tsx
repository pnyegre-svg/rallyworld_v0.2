
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUploader, type Upload } from '@/lib/useUploader';
import { UploadCloud, File as FileIcon, X, Trash2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { deleteObject } from '@/lib/storage.client';
import { useToast } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';
import { listOrganizerEvents, type EventLite } from '@/lib/events';
import { useUserStore } from '@/hooks/use-user';
import { db } from '@/lib/firebase.client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { listFileMeta, type FileMeta } from '@/lib/filesIndex.client';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase.client';


type FileCategory = 'maps' | 'bulletins' | 'regulations';

export default function UploadsPage() {
  const { user } = useUserStore();
  const [events, setEvents] = React.useState<EventLite[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string>('');
  const [activeTab, setActiveTab] = React.useState<FileCategory>('maps');
  
  const { uploads, addFiles, removeUpload, clearUploads } = useUploader(selectedEventId, activeTab);
  const { push: toast } = useToast();
  const [storedFiles, setStoredFiles] = React.useState<FileMeta[]>([]);
  const [loadingFiles, setLoadingFiles] = React.useState(true);
  const [loadingEvents, setLoadingEvents] = React.useState(true);

  // Fetch events
  React.useEffect(() => {
    if (user?.id) {
      setLoadingEvents(true);
      listOrganizerEvents(db, user.id).then(fetchedEvents => {
        setEvents(fetchedEvents);
        if (fetchedEvents.length > 0) {
          setSelectedEventId(fetchedEvents[0].id);
        }
        setLoadingEvents(false);
      });
    }
  }, [user?.id]);
  
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (!selectedEventId) {
      toast({ text: 'Please select an event before uploading files.', kind: 'error' });
      return;
    }
    addFiles(acceptedFiles);
  }, [addFiles, selectedEventId, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const fetchFiles = React.useCallback(async () => {
    if (!selectedEventId || !activeTab) {
        setStoredFiles([]);
        setLoadingFiles(false);
        return;
    }
    setLoadingFiles(true);
    try {
        const { items } = await listFileMeta(selectedEventId, activeTab);
        setStoredFiles(items);
    } catch(e: any) {
        if (e.code !== 'storage/object-not-found') { // Ignore folder-not-found errors
            toast({kind: 'error', text: e.message || 'Failed to list files.'});
        } else {
            setStoredFiles([]); // Folder doesn't exist, so no files
        }
    } finally {
        setLoadingFiles(false);
    }
  }, [toast, selectedEventId, activeTab]);

  React.useEffect(() => {
    fetchFiles();
    clearUploads(); // Clear completed uploads when tab or event changes
  }, [fetchFiles, clearUploads]);
  
  const handleDelete = async (file: FileMeta) => {
    try {
        await deleteObject(file.path);
        // Optimistically remove from UI
        setStoredFiles(prev => prev.filter(f => f.id !== file.id));
        toast({ kind: 'success', text: `Deleted ${file.name}` });
    } catch (e: any) {
        toast({ kind: 'error', text: e.message || 'Failed to delete file.' });
        // Re-fetch to get correct state if delete failed
        fetchFiles();
    }
  };

  const handleUploadSuccess = () => {
    fetchFiles(); // Re-fetch files after a successful upload
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                 <CardTitle>Manage Event Files</CardTitle>
                 <CardDescription>Upload and manage documents for your events.</CardDescription>
            </div>
            <Select value={selectedEventId} onValueChange={setSelectedEventId} disabled={loadingEvents || events.length === 0}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder={loadingEvents ? "Loading..." : "Select an event"} />
                </SelectTrigger>
                <SelectContent>
                {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                    {event.title}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
         <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FileCategory)} className="w-full">
            <TabsList>
                <TabsTrigger value="maps">Maps</TabsTrigger>
                <TabsTrigger value="bulletins">Bulletins</TabsTrigger>
                <TabsTrigger value="regulations">Regulations</TabsTrigger>
            </TabsList>
            <TabsContent value="maps" className="mt-4">
              <FileCategoryContent key={`maps-${selectedEventId}`} isLoading={loadingFiles} storedFiles={storedFiles} handleDelete={handleDelete} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} uploads={uploads} removeUpload={removeUpload} onUploadSuccess={handleUploadSuccess} />
            </TabsContent>
            <TabsContent value="bulletins" className="mt-4">
              <FileCategoryContent key={`bulletins-${selectedEventId}`} isLoading={loadingFiles} storedFiles={storedFiles} handleDelete={handleDelete} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} uploads={uploads} removeUpload={removeUpload} onUploadSuccess={handleUploadSuccess} />
            </TabsContent>
            <TabsContent value="regulations" className="mt-4">
              <FileCategoryContent key={`regulations-${selectedEventId}`} isLoading={loadingFiles} storedFiles={storedFiles} handleDelete={handleDelete} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} uploads={uploads} removeUpload={removeUpload} onUploadSuccess={handleUploadSuccess} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper component to avoid prop drilling and simplify main component
const FileCategoryContent = ({isLoading, storedFiles, handleDelete, getRootProps, getInputProps, isDragActive, uploads, removeUpload, onUploadSuccess}: any) => {

    const UploadItem = ({ upload }: { upload: Upload }) => {
       React.useEffect(() => {
        if (upload.state === 'success') {
            onUploadSuccess();
        }
       }, [upload.state])
    
        return (
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
    };

    const StoredFileItem = ({file}: {file: FileMeta}) => {
        const [url, setUrl] = React.useState<string | null>(null);

        React.useEffect(() => {
            getDownloadURL(ref(storage, file.path))
                .then(setUrl)
                .catch(console.error);
        }, [file.path]);

        return (
             <li key={file.id} className="flex items-center gap-3 rounded-md border p-2">
                <FileIcon className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 text-sm truncate">{file.name}</span>
                {url && (
                    <Button asChild variant="ghost" size="icon">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDelete(file)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </li>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div>
                 <div {...getRootProps()} className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    <input {...getInputProps()} />
                    <UploadCloud className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">{isDragActive ? 'Drop the files here...' : 'Drag files here, or click to select'}</p>
                </div>
                 {uploads.length > 0 && (
                    <div className="mt-6 space-y-4">
                        {uploads.map((upload: Upload) => <UploadItem key={upload.id} upload={upload} />)}
                    </div>
                )}
            </div>
             <div>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : storedFiles.length > 0 ? (
                    <ul className="space-y-2">
                        {storedFiles.map((file: FileMeta) => (
                           <StoredFileItem key={file.id} file={file} />
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center text-muted-foreground py-10">No files uploaded to this category.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
