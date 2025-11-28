/**
 * Timeline View Component
 * Display audit trail of all actions on application
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, UserPlus, FileText, MessageSquare, Clock } from "lucide-react";

interface TimelineViewProps {
  timeline: any[];
}

const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  status_changed: {
    icon: CheckCircle,
    color: "text-blue-600",
    label: "Status Changed",
  },
  reviewer_assigned: {
    icon: UserPlus,
    color: "text-purple-600",
    label: "Reviewer Assigned",
  },
  document_uploaded: {
    icon: FileText,
    color: "text-green-600",
    label: "Document Uploaded",
  },
  note_added: {
    icon: MessageSquare,
    color: "text-amber-600",
    label: "Note Added",
  },
  default: {
    icon: Clock,
    color: "text-gray-600",
    label: "Action",
  },
};

export function TimelineView({ timeline = [] }: TimelineViewProps) {
  if (timeline.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No activity yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {timeline.map((event, index) => {
        const config = ACTION_CONFIG[event.action] || ACTION_CONFIG.default;
        const Icon = config.icon;

        return (
          <div key={event.id} className="relative">
            {/* Connecting Line */}
            {index < timeline.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium">{config.label}</h4>
                      <p className="text-xs text-gray-500">
                        {event.performedAt?.toDate
                          ? event.performedAt.toDate().toLocaleString()
                          : "Recently"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      by {event.performedByName}
                    </p>
                    {event.previousValue && event.newValue && (
                      <p className="text-sm text-gray-500">
                        Changed from{" "}
                        <span className="font-medium">{event.previousValue}</span> to{" "}
                        <span className="font-medium">{event.newValue}</span>
                      </p>
                    )}
                    {event.details?.note && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{event.details.note}"
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
