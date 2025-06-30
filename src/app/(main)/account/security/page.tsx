"use client";

import { ActivityManagement } from '@/components/activity/activity-management';
import { SessionManagement } from '@/components/session/session-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SessionsPage() {
  return (
    <div className="flex w-full justify-center">
      <div className="container max-w-screen-xl mt-24 space-y-8  mx-auto px-4 sm:px-6">
        <Tabs defaultValue="session">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="session">Sessions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="session">
            <SessionManagement />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
