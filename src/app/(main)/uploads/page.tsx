
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUploader, type Upload } from '@/lib/useUploader';
import {
  UploadCloud,
  File as FileIcon,
  X,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { deleteObject } from '@/lib/storage.client';
import { useToast } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';
import { listOrganizerEvents, type EventLite } from '@/lib/events';
import { useUserStore } from '@/hooks/use-user';
import { db } from '@/lib/firebase.client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { listFileMeta, type FileMeta } from '@/lib/filesIndex.client';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase.client';

type FileCategory = 'maps' | 'bulletins' | 'regulations';

const FOLDERS: { key: FileCategory; label: string }[] = [
  { key: 'maps', label: 'Maps' },
  { key: 'bulletins', label: 'Bulletins' },
  { key: 'regulations', label: 'Regulations' },
];

const LS_EVENT = 'uploads:lastEvent';
const LS_FOLDER = 'uploads:lastFolder';

function fmtSize(bytes?: number): string {
    if (!bytes && bytes !== 0) return '';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getTypeBadge(contentType?: string): { label: string, variant: "default" | "secondary" | "destructive" | "outline" } {
  const t = (contentType || '').toLowerCase();
  if (t.startsWith('image/')) return { label: 'Image', variant: 'default' };
  if (t === 'application/pdf') return { label: 'PDF', variant: 'destructive' };
  if (t.includes('word')) return { label: 'Word', variant: 'secondary' };
  if (t.includes('spreadsheet') || t.includes('excel')) return { label: 'secondary', variant: 'default' }; // Custom color for excel would be nice
  if (t.includes('presentation') || t.includes('powerpoint')) return { label: 'Slides', variant: 'secondary' }; // Custom color would be nice
  if (t.startsWith('text/')) return { label: 'Text', variant: 'outline' };
  const ext = t.split('/')[1]?.toUpperCase() || 'File';
  return { label: ext, variant: 'outline' };
}


export default function UploadsPage() {
  const { user } = useUserStore();
  const [events, setEvents] = React.useState<EventLite[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string>('');

  const [activeTab, setActiveTab] =
    React.useState<FileCategory>('maps');

  const { uploads, addFiles, removeUpload, clearUploads } = useUploader(
    selectedEventId,
    activeTab
  );
  const { push: toast } = useToast();
  const [storedFiles, setStoredFiles] = React.useState<FileMeta[]>([]);
  const [loadingFiles, setLoadingFiles] = React.useState(true);
  const [loadingEvents, setLoadingEvents] = React.useState(true);
  const [cursor, setCursor] = React.useState<any>();
  const noEvent = !selectedEventId;

  // Fetch events
  React.useEffect(() => {
    if (user?.id) {
      setLoadingEvents(true);
      listOrganizerEvents(db, user.id).then((fetchedEvents) => {
        setEvents(fetchedEvents);
        if (!fetchedEvents.length) {
            localStorage.removeItem(LS_EVENT);
            setSelectedEventId('');
        } else {
            const storedEvent = localStorage.getItem(LS_EVENT);
            const candidate =
            fetchedEvents.find((e) => e.id === storedEvent)?.id || fetchedEvents[0]?.id || '';
            setSelectedEventId(candidate);
        }
        setLoadingEvents(false);
      });
    }
  }, [user?.id]);

  // Persist selections
  React.useEffect(() => {
    if (selectedEventId) localStorage.setItem(LS_EVENT, selectedEventId);
  }, [selectedEventId]);
  React.useEffect(() => {
    if (activeTab) localStorage.setItem(LS_FOLDER, activeTab);
  }, [activeTab]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (noEvent) {
        toast({
          text: 'Please select an event before uploading files.',
          kind: 'error',
        });
        return;
      }
      addFiles(acceptedFiles);
    },
    [addFiles, noEvent, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: noEvent,
  });

  const fetchFiles = React.useCallback(async (nextPage = false) => {
      if (!selectedEventId || !activeTab) {
        setStoredFiles([]);
        setLoadingFiles(false);
        return;
      }
      setLoadingFiles(true);
      try {
        const { items, nextCursor } = await listFileMeta(
            selectedEventId, 
            activeTab, 
            20, 
            nextPage ? cursor : undefined
        );
        setStoredFiles(prev => nextPage ? [...prev, ...items] : items);
        setCursor(nextCursor);
      } catch (e: any) {
        if (e.code !== 'storage/object-not-found') {
          // Ignore folder-not-found errors
          toast({ kind: 'error', text: e.message || 'Failed to list files.' });
        } else {
          setStoredFiles([]); // Folder doesn't exist, so no files
        }
      } finally {
        setLoadingFiles(false);
      }
    }, [toast, selectedEventId, activeTab, cursor]
  );

  React.useEffect(() => {
    fetchFiles(false);
    clearUploads(); // Clear completed uploads when tab or event changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId, activeTab]);

  const handleDelete = async (file: FileMeta) => {
    try {
      await deleteObject(file.path);
      // Optimistically remove from UI
      setStoredFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast({ kind: 'success', text: `Deleted ${file.name}` });
    } catch (e: any) {
      toast({ kind: 'error', text: e.message || 'Failed to delete file.' });
      // Re-fetch to get correct state if delete failed
      fetchFiles(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchFiles(false); // Re-fetch files after a successful upload
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Event Files</CardTitle>
            <CardDescription>
              Upload and manage documents for your events.
            </CardDescription>
          </div>
          <Select
            value={selectedEventId}
            onValueChange={setSelectedEventId}
            disabled={loadingEvents || events.length === 0}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue
                placeholder={loadingEvents ? 'Loading...' : events.length > 0 ? 'Select an event' : 'Create an event first'}
              />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FileCategory)}
          className="w-full"
        >
          <TabsList>
            {FOLDERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <FileCategoryContent
                key={`${activeTab}-${selectedEventId}`}
                isLoading={loadingFiles}
                storedFiles={storedFiles}
                handleDelete={handleDelete}
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragActive={isDragActive}
                uploads={uploads.filter((u) => u.category === activeTab)}
                removeUpload={removeUpload}
                onUploadSuccess={handleUploadSuccess}
                loadMore={() => fetchFiles(true)}
                hasMore={!!cursor}
                noEvent={noEvent}
                eventId={selectedEventId}
                folder={activeTab}
              />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper component to avoid prop drilling and simplify main component
const FileCategoryContent = ({
  isLoading,
  storedFiles,
  handleDelete,
  getRootProps,
  getInputProps,
  isDragActive,
  uploads,
  removeUpload,
  onUploadSuccess,
  loadMore,
  hasMore,
  noEvent,
  eventId,
  folder,
}: any) => {
  const UploadItem = ({ upload }: { upload: Upload }) => {
    React.useEffect(() => {
      if (upload.state === 'success') {
        onUploadSuccess();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [upload.state]);

    return (
      <div className="flex items-center gap-4 rounded-lg border p-3">
        <FileIcon className="h-6 w-6 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium truncate">{upload.file.name}</p>
          <Progress value={upload.progress} className="h-2 mt-1" />
          <p className="text-xs text-muted-foreground mt-1">
            {upload.state === 'uploading' &&
              `Uploading... ${Math.round(upload.progress)}%`}
            {upload.state === 'success' && (
              <span className="flex items-center text-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </span>
            )}
            {upload.state === 'error' && (
              <span className="flex items-center text-red-500">
                <AlertCircle className="h-3 w-3 mr-1" />
                Error: {upload.error?.message}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (upload.state === 'uploading') upload.cancel();
            removeUpload(upload.id);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const StoredFileItem = ({ file }: { file: FileMeta }) => {
    const [url, setUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
      getDownloadURL(ref(storage, file.path))
        .then(setUrl)
        .catch(console.error);
    }, [file.path]);

    return (
      <TableRow key={file.id}>
        <TableCell className="font-medium">{file.name}</TableCell>
        <TableCell>
            <Badge variant={getTypeBadge(file.contentType).variant}>{getTypeBadge(file.contentType).label}</Badge>
        </TableCell>
        <TableCell>{fmtSize(file.size)}</TableCell>
        <TableCell className="text-muted-foreground">{file.timeCreated?.toDate().toLocaleDateString()}</TableCell>
        <TableCell className="text-right">
             <div className="flex justify-end gap-2">
                {url && (
                    <Button asChild variant="outline" size="sm">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> View
                        </a>
                    </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleDelete(file)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg transition-colors ${
            noEvent ? 'border-muted bg-muted/50 cursor-not-allowed text-muted-foreground' : isDragActive
              ? 'border-primary bg-primary/10 cursor-copy'
              : 'border-border hover:border-primary/50 cursor-pointer'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-12 w-12" />
          <p className="mt-4 text-center">
            {noEvent 
                ? 'Please create or select an event to enable uploads.'
                : isDragActive
                ? 'Drop the files here...'
                : 'Drag files here, or click to select'
            }
          </p>
        </div>
        {uploads.length > 0 && (
          <div className="mt-6 space-y-4">
            {uploads.map((upload: Upload) => (
              <UploadItem key={upload.id} upload={upload} />
            ))}
          </div>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                        </TableCell>
                    </TableRow>
                    ))
                ) : storedFiles.length > 0 ? (
                    storedFiles.map((file: FileMeta) => (
                    <StoredFileItem key={file.id} file={file} />
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        { noEvent ? "Please select an event." : "No files uploaded to this category."}
                    </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
         {hasMore && (
            <div className="p-4 border-t">
                <Button onClick={loadMore} disabled={isLoading} className="w-full">
                    {isLoading ? 'Loading...' : 'Load More'}
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};
