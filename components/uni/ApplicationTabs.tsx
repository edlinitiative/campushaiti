/**
 * Application Tabs Component
 * Tabbed interface for overview, documents, notes, timeline
 */

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentChecklist } from "./DocumentChecklist";
import { NotesThread } from "./NotesThread";
import { TimelineView } from "./TimelineView";
import { ApplicationOverview } from "./ApplicationOverview";
import { FileText, MessageSquare, Clock, User } from "lucide-react";

interface ApplicationTabsProps {
  application: any;
  universityId: string;
  staff: any[];
}

export function ApplicationTabs({
  application,
  universityId,
  staff,
}: ApplicationTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents ({application.documents?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Notes ({application.notes?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="timeline" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Timeline
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <ApplicationOverview application={application} />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <DocumentChecklist
          applicationId={application.id}
          documents={application.documents}
        />
      </TabsContent>

      <TabsContent value="notes" className="mt-6">
        <NotesThread
          applicationId={application.id}
          notes={application.notes}
        />
      </TabsContent>

      <TabsContent value="timeline" className="mt-6">
        <TimelineView timeline={application.timeline} />
      </TabsContent>
    </Tabs>
  );
}
