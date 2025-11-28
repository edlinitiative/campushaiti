/**
 * Application Overview Component
 * Display application details and scorecard
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApplicationOverviewProps {
  application: any;
}

export function ApplicationOverview({ application }: ApplicationOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{application.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{application.studentEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Program</p>
            <p className="font-medium">{application.programName}</p>
          </div>
        </CardContent>
      </Card>

      {/* Application Data */}
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{application.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Submitted</p>
            <p className="font-medium">
              {application.createdAt?.toDate
                ? application.createdAt.toDate().toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          {application.assignedReviewerName && (
            <div>
              <p className="text-sm text-gray-500">Assigned Reviewer</p>
              <p className="font-medium">{application.assignedReviewerName}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add scorecard component here in future */}
    </div>
  );
}
