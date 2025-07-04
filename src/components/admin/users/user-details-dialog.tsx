"use client";

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ClientMedia } from '@/components/admin/users/user-media';
import { ClientPermissions } from '@/components/admin/users/user-permissions';
import { ClientProfile } from '@/components/admin/users/user-profile';
import { ClientSessions } from '@/components/admin/users/user-sessions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { fetcher } from '@/lib/utils';

import type { ClientDetailsResponse } from "@/types/admin-users";

interface ClientDetailsDialogProps {
  clientId: string | undefined;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClientUpdated: () => void;
}

export function ClientDetailsDialog({
  clientId,
  isOpen,
  setIsOpen,
  onClientUpdated,
}: ClientDetailsDialogProps) {
  const { toast } = useToast();
  const [clientData, setClientData] = useState<ClientDetailsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch client details when dialog opens
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientId || !isOpen) return;

      setIsLoading(true);
      try {
        const data = (await fetcher(
          `/api/admin/users/${clientId}/details`
        )) as ClientDetailsResponse;
        setClientData(data);
      } catch (error) {
        console.error("Error fetching client details:", error);
        toast({
          title: "Error",
          description: "Failed to load client details. Please try again.",
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId, isOpen, toast]);

  if (!clientId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Détails du client</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement des données du client...</span>
          </div>
        ) : clientData ? (
          <Tabs
            defaultValue="profile"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              {/* <TabsTrigger value="activities">Activities</TabsTrigger> */}
              <TabsTrigger value="media">Média</TabsTrigger>
              <TabsTrigger value="permissions">Pérmissions</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[70vh]">
                <ClientProfile
                  client={clientData}
                  onClientUpdated={onClientUpdated}
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sessions" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[70vh]">
                <ClientSessions
                  clientId={clientData.id}
                  sessions={clientData.Session}
                />
              </ScrollArea>
            </TabsContent>

            {/* <TabsContent value="activities" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[70vh]">
                <ClientActivities
                  clientId={clientData.id}
                  activities={clientData.activities}
                />
              </ScrollArea>
            </TabsContent> */}

            <TabsContent value="media" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[70vh]">
                <ClientMedia
                  clientId={clientData.id}
                  media={clientData.Media}
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="permissions" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[70vh]">
                <ClientPermissions
                  client={clientData}
                  onClientUpdated={onClientUpdated}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Failed to load client details.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
