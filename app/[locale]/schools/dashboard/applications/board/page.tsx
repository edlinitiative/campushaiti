/**
 * Application Board Page - Kanban View
 * Visual pipeline for managing applications
 */

import { headers } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { ApplicationBoard } from "@/components/uni/ApplicationBoard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutList } from "lucide-react";
import Link from "next/link";

export default async function ApplicationBoardPage() {
  const headersList = headers();
  const schoolSlug = headersList.get("x-school-slug");

  if (!schoolSlug) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">School not found</p>
      </div>
    );
  }

  const db = getAdminDb();

  // Get university
  const universitiesSnapshot = await db
    .collection("universities")
    .where("slug", "==", schoolSlug)
    .limit(1)
    .get();

  if (universitiesSnapshot.empty) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">University not found</p>
      </div>
    );
  }

  const universityId = universitiesSnapshot.docs[0].id;
  const universityData = universitiesSnapshot.docs[0].data();

  // Get all applications for this university
  const applicationsSnapshot = await db
    .collection("applicationItems")
    .where("universityId", "==", universityId)
    .orderBy("createdAt", "desc")
    .get();

  // Get programs for program names
  const programsSnapshot = await db
    .collection("programs")
    .where("universityId", "==", universityId)
    .get();

  const programsMap = new Map(
    programsSnapshot.docs.map((doc) => [doc.id, doc.data()])
  );

  // Get user profiles for student names
  const userIds = [...new Set(applicationsSnapshot.docs.map((doc) => doc.data().userId))];
  const usersPromises = userIds.map((userId) =>
    db.collection("users").doc(userId).get()
  );
  const usersSnapshots = await Promise.all(usersPromises);
  const usersMap = new Map(
    usersSnapshots
      .filter((snap) => snap.exists)
      .map((snap) => [snap.id, snap.data()])
  );

  // Get staff for reviewer names
  const staffSnapshot = await db
    .collection("universities")
    .doc(universityId)
    .collection("staff")
    .get();

  const staffMap = new Map(
    staffSnapshot.docs.map((doc) => [doc.id, doc.data()])
  );

  // Transform applications
  const applications = applicationsSnapshot.docs.map((doc) => {
    const data = doc.data();
    const userData = usersMap.get(data.userId);
    const programData = programsMap.get(data.programId);
    const reviewerData = data.assignedReviewer
      ? staffMap.get(data.assignedReviewer)
      : null;

    return {
      id: doc.id,
      studentName: userData?.name || userData?.displayName || "Unknown Student",
      studentEmail: userData?.email || "",
      programName: programData?.name || "Unknown Program",
      status: data.status || "new",
      submittedAt: data.createdAt,
      assignedReviewerName: reviewerData?.name,
    };
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/schools/dashboard/applications">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Pipeline</h1>
                <p className="text-gray-500 mt-1">
                  {applications.length} application{applications.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <Link href="/schools/dashboard/applications">
              <Button variant="outline">
                <LayoutList className="h-4 w-4 mr-2" />
                List View
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-6">
        <ApplicationBoard
          universityId={universityId}
          initialApplications={applications}
        />
      </div>
    </div>
  );
}
