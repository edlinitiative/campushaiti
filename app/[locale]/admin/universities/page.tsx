"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AdminUniversitiesPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const mockRegistrations = [
    {
      id: "1",
      name: "Université Quisqueya",
      slug: "uniq",
      city: "Port-au-Prince",
      country: "Haiti",
      contactEmail: "admissions@uniq.edu.ht",
      contactPhone: "+509 2222 3333",
      websiteUrl: "https://www.uniq.edu.ht",
      description: "Private university offering programs in business, engineering, and health sciences",
      contactPersonName: "Dr. Marie Laurent",
      contactPersonEmail: "m.laurent@uniq.edu.ht",
      contactPersonTitle: "Registrar",
      status: "PENDING",
      submittedAt: "2025-11-10T14:30:00Z",
    },
    {
      id: "2",
      name: "Université Notre Dame d'Haïti",
      slug: "undh",
      city: "Port-au-Prince",
      country: "Haiti",
      contactEmail: "info@undh.edu.ht",
      contactPhone: "+509 3333 4444",
      websiteUrl: "https://www.undh.edu.ht",
      description: "Catholic university with strong programs in education and social sciences",
      contactPersonName: "Jean Baptiste",
      contactPersonEmail: "j.baptiste@undh.edu.ht",
      contactPersonTitle: "Director of Admissions",
      status: "PENDING",
      submittedAt: "2025-11-09T10:15:00Z",
    },
  ];

  useEffect(() => {
    // Load pending registrations from Firestore
    setRegistrations(mockRegistrations);
  }, []);

  const handleApprove = async (registration: any) => {
    if (!confirm(`Approve ${registration.name}?`)) return;

    try {
      // 1. Update registration status to APPROVED
      // 2. Create university document
      // 3. Send approval email
      // 4. Create initial admin user account
      
      alert(`${registration.name} has been approved!`);
      setRegistrations(registrations.filter(r => r.id !== registration.id));
    } catch (err) {
      console.error("Error approving registration:", err);
    }
  };

  const handleReject = async () => {
    if (!selectedRegistration || !rejectionReason.trim()) return;

    try {
      // 1. Update registration status to REJECTED
      // 2. Save rejection reason
      // 3. Send rejection email
      
      alert(`${selectedRegistration.name} has been rejected`);
      setRegistrations(registrations.filter(r => r.id !== selectedRegistration.id));
      setShowRejectDialog(false);
      setSelectedRegistration(null);
      setRejectionReason("");
    } catch (err) {
      console.error("Error rejecting registration:", err);
    }
  };

  const openRejectDialog = (registration: any) => {
    setSelectedRegistration(registration);
    setShowRejectDialog(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">University Management</h1>
          <p className="text-muted-foreground">Review and approve university registrations</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">← Admin Dashboard</Link>
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval ({registrations.filter(r => r.status === "PENDING").length})
          </TabsTrigger>
          <TabsTrigger value="approved">Approved Universities</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {registrations.filter(r => r.status === "PENDING").length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No pending registrations</p>
              </CardContent>
            </Card>
          ) : (
            registrations
              .filter(r => r.status === "PENDING")
              .map((registration) => (
                <Card key={registration.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{registration.name}</CardTitle>
                        <CardDescription>
                          {registration.city}, {registration.country}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">University Details</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground">Email:</span>{" "}
                            {registration.contactEmail}
                          </p>
                          {registration.contactPhone && (
                            <p>
                              <span className="text-muted-foreground">Phone:</span>{" "}
                              {registration.contactPhone}
                            </p>
                          )}
                          {registration.websiteUrl && (
                            <p>
                              <span className="text-muted-foreground">Website:</span>{" "}
                              <a
                                href={registration.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {registration.websiteUrl}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Contact Person</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground">Name:</span>{" "}
                            {registration.contactPersonName}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Title:</span>{" "}
                            {registration.contactPersonTitle || "N/A"}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Email:</span>{" "}
                            {registration.contactPersonEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {registration.description && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {registration.description}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Submitted: {new Date(registration.submittedAt).toLocaleString()}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => openRejectDialog(registration)}
                      >
                        Reject
                      </Button>
                      <Button onClick={() => handleApprove(registration)}>
                        Approve University
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                No approved universities to display
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No rejected registrations</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject University Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedRegistration?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this registration is being rejected..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedRegistration(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Reject Registration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
