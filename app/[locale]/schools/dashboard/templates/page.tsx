/**
 * Message Templates Page
 * Manage reusable communication templates for applications
 */

import { headers } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { TemplateList } from "@/components/uni/TemplateList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TemplatesPage() {
  const headersList = headers();
  const schoolSlug = headersList.get("x-school-slug");

  if (!schoolSlug) {
    return notFound();
  }

  const db = getAdminDb();

  // Get university
  const universitiesSnapshot = await db
    .collection("universities")
    .where("slug", "==", schoolSlug)
    .limit(1)
    .get();

  if (universitiesSnapshot.empty) {
    return notFound();
  }

  const universityId = universitiesSnapshot.docs[0].id;
  const universityData = universitiesSnapshot.docs[0].data();

  // Get templates for this university
  const templatesSnapshot = await db
    .collection("messageTemplates")
    .where("universityId", "==", universityId)
    .orderBy("type", "asc")
    .orderBy("createdAt", "desc")
    .get();

  const templates = templatesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/schools/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Message Templates</h1>
          <p className="text-gray-500 mt-1">
            Create reusable templates for applicant communications
          </p>
        </div>

        <Link href="/schools/dashboard/templates/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </Link>
      </div>

      <TemplateList templates={templates} universityId={universityId} />
    </div>
  );
}
