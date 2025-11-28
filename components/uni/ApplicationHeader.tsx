/**
 * Application Header Component
 * Top section with student info, status, and quick actions
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  ApplicationStatus,
} from "@/lib/types/uni";
import { User, Mail, Calendar, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApplicationHeaderProps {
  application: any;
  universityId: string;
  staff: any[];
}

export function ApplicationHeader({
  application,
  universityId,
  staff,
}: ApplicationHeaderProps) {
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignReviewer = async (reviewerId: string) => {
    setIsAssigning(true);
    try {
      const reviewer = staff.find((s) => s.id === reviewerId);
      const response = await fetch(`/api/uni/applications/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: [application.id],
          reviewerId,
          reviewerName: reviewer?.name || "Unknown",
        }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      alert("Failed to assign reviewer");
    } finally {
      setIsAssigning(false);
    }
  };

  const submittedDate = application.createdAt?.toDate
    ? application.createdAt.toDate()
    : application.createdAt
    ? new Date(application.createdAt)
    : null;

  return (
    <div className="space-y-4">
      {/* Student Info & Status */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {application.studentName}
            </h1>
            <p className="text-lg text-gray-600">{application.programName}</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {application.studentEmail}
            </div>
            {submittedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(submittedDate, { addSuffix: true })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            className={APPLICATION_STATUS_COLORS[application.status as ApplicationStatus] || ""}
          >
            {APPLICATION_STATUS_LABELS[application.status as ApplicationStatus] || application.status}
          </Badge>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-3 pt-3 border-t">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Assigned to:</span>
          <Select
            value={application.assignedReviewer || "unassigned"}
            onValueChange={handleAssignReviewer}
            disabled={isAssigning}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Assign reviewer..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {staff.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
