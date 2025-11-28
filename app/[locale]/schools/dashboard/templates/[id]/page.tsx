/**
 * Template Editor Page - Create/Edit Templates
 */

import { headers } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { TemplateEditor } from "@/components/uni/TemplateEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TemplateEditorPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Get template if editing (not "new")
  let template = null;
  if (params.id !== "new") {
    const templateDoc = await db
      .collection("messageTemplates")
      .doc(params.id)
      .get();

    if (!templateDoc.exists) {
      return notFound();
    }

    const templateData = templateDoc.data()!;

    // Verify template belongs to this university
    if (templateData.universityId !== universityId) {
      return notFound();
    }

    template = {
      id: templateDoc.id,
      ...templateData,
    };
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/schools/dashboard/templates">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">
          {template ? "Edit Template" : "New Template"}
        </h1>
        <p className="text-gray-500 mt-1">
          Create reusable message templates with dynamic variables
        </p>
      </div>

      <TemplateEditor template={template} universityId={universityId} />
    </div>
  );
}
