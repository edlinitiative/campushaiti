/**
 * Application Board - Kanban View
 * Drag-and-drop interface for managing application pipeline
 */

"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ApplicationStatus, APPLICATION_STATUS_LABELS } from "@/lib/types/uni";
import { ApplicationCard } from "./ApplicationCard";
import { Loader2 } from "lucide-react";

interface Application {
  id: string;
  studentName: string;
  studentEmail: string;
  programName: string;
  status: ApplicationStatus;
  submittedAt?: any;
  assignedReviewerName?: string;
}

interface ApplicationBoardProps {
  universityId: string;
  initialApplications?: Application[];
}

const COLUMN_ORDER: ApplicationStatus[] = [
  "new",
  "in_review",
  "missing_docs",
  "interview",
  "accepted",
  "rejected",
];

export function ApplicationBoard({
  universityId,
  initialApplications = [],
}: ApplicationBoardProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Organize applications by status
  const columns = COLUMN_ORDER.reduce((acc, status) => {
    acc[status] = applications.filter((app) => app.status === status);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ApplicationStatus;
    const applicationId = draggableId;

    // Optimistic update
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    // Update on server
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/uni/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh data to get timeline update
      const updatedApp = await response.json();
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, ...updatedApp } : app))
      );
    } catch (error) {
      console.error("Error updating application status:", error);
      // Revert optimistic update
      setApplications(initialApplications);
      alert("Failed to update application status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="h-full">
      {isUpdating && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating...
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
          {COLUMN_ORDER.map((status) => (
            <div key={status} className="flex-shrink-0 w-80">
              <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col">
                {/* Column Header */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {APPLICATION_STATUS_LABELS[status]}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {columns[status].length} application{columns[status].length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Droppable Column */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 min-h-[200px] ${
                        snapshot.isDraggingOver ? "bg-blue-50 rounded-lg" : ""
                      }`}
                    >
                      {columns[status].map((application, index) => (
                        <Draggable
                          key={application.id}
                          draggableId={application.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? "opacity-50" : ""}
                            >
                              <ApplicationCard application={application} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Empty State */}
                      {columns[status].length === 0 && (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                          No applications
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
