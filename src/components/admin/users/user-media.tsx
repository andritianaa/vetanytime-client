"use client";

import { Eye, FileText, ImageIcon, Trash, Upload } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Media } from '@prisma/client';

interface ClientMediaProps {
  clientId: string;
  media: Media[];
}

export function ClientMedia({ clientId, media }: ClientMediaProps) {
  const { toast } = useToast();
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // Handle delete media
  const handleDeleteMedia = async (mediaId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users/${clientId}/media/${mediaId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete media");
      }

      toast({
        title: "Success",
        description: "Media deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to delete media. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle preview media
  const handlePreviewMedia = (media: Media) => {
    setSelectedMedia(media);
    setIsPreviewOpen(true);
  };

  // Get media type icon
  const getMediaTypeIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-amber-500" />;
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Media</CardTitle>
            <CardDescription>
              Media files uploaded by this client
            </CardDescription>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </CardHeader>
        <CardContent>
          {media.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    {item.type.startsWith("image") ? (
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={item.url}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">
                        {item.type.split("/")[1].toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate" title={item.url}>
                          {item.url}
                        </h3>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewMedia(item)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMedia(item.id)}
                          disabled={isLoading}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No media files found for this client.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.url}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedMedia?.type.startsWith("image/") ? (
              <img
                src={selectedMedia.url || "/placeholder.svg"}
                alt={selectedMedia.url}
                className="max-h-[70vh] mx-auto object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-24 w-24 text-muted-foreground" />
                <p className="mt-4">Preview not available for this file type</p>
                <Button className="mt-4" asChild>
                  <a
                    href={selectedMedia?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download File
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
