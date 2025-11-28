/**
 * Application Card - Individual card in kanban board
 */

"use client";

import Link from "next/link";
import { Calendar, User, GripVertical } from "lucide-react";
import { APPLICATION_STATUS_COLORS, ApplicationStatus } from "@/lib/types/uni";
import { formatDistanceToNow } from "date-fns";

interface ApplicationCardProps {
  application: {
    id: string;
    studentName: string;
    studentEmail: string;
    programName: string;
    status: ApplicationStatus;
    submittedAt?: any;
    assignedReviewerName?: string;
  };
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const submittedDate = application.submittedAt?.toDate
    ? application.submittedAt.toDate()
    : application.submittedAt
    ? new Date(application.submittedAt)
    : null;

  return (
    <Link href={`/uni/applications/${application.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group">
        {/* Drag Handle */}
        <div className="flex items-start gap-2">
          <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex-1 min-w-0">
            {/* Student Name */}
            <h4 className="font-medium text-gray-900 truncate">
              {application.studentName}
            </h4>

            {/* Program Name */}
            <p className="text-sm text-gray-600 truncate mt-1">
              {application.programName}
            </p>

            {/* Metadata */}
            <div className="mt-3 space-y-2">
              {/* Submitted Date */}
              {submittedDate && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(submittedDate, { addSuffix: true })}
                  </span>
                </div>
              )}

              {/* Assigned Reviewer */}
              {application.assignedReviewerName && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span className="truncate">{application.assignedReviewerName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
