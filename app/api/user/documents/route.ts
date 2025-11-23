import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";

/**
 * GET /api/user/documents?userId=xxx
 * Fetch all documents for a user from Firestore
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Get all documents for this user
    // Note: Removed orderBy to avoid requiring composite index
    // Documents will be sorted client-side if needed
    const snapshot = await db
      .collection("documents")
      .where("ownerUid", "==", userId)
      .get();

    const documents = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string for JSON serialization
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : null,
      };
    });

    // Sort by createdAt in JavaScript (temporary until index is deployed)
    documents.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime; // DESC order
    });

    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/documents
 * Add a new document metadata to Firestore (after file is uploaded to Storage)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = request.cookies.get("session")?.value;
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      await getAdminAuth().verifySessionCookie(session);
    } catch (authError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      ownerUid,
      kind,
      filename,
      mimeType,
      sizeBytes,
      storagePath,
      downloadURL,
    } = body;

    // Validate required fields
    if (!ownerUid || !kind || !filename || !downloadURL) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Create document record
    const docRef = await db.collection("documents").add({
      ownerUid,
      kind,
      filename,
      mimeType: mimeType || "application/octet-stream",
      sizeBytes: sizeBytes || 0,
      storagePath: storagePath || "",
      downloadURL,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      documentId: docRef.id,
      message: "Document added successfully",
    });
  } catch (error: any) {
    console.error("Error adding document:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/documents?documentId=xxx
 * Delete a document from Firestore
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify session
    const session = request.cookies.get("session")?.value;
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      await getAdminAuth().verifySessionCookie(session);
    } catch (authError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { success: false, message: "documentId is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Delete document
    await db.collection("documents").doc(documentId).delete();

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}
