"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, CheckCircle, XCircle, Building2 } from "lucide-react";

export default function AdminUniversitiesPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBulkApprovalDialog, setShowBulkApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    city: "",
    country: "Haiti",
    contactEmail: "",
    contactPhone: "",
    websiteUrl: "",
    description: "",
  });

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
    loadRegistrations();
    loadUniversities();
  }, [activeTab]);

  const loadUniversities = async () => {
    try {
      const response = await fetch('/api/admin/universities');
      if (response.ok) {
        const data = await response.json();
        setUniversities(data.universities || []);
      }
    } catch (err) {
      console.error("Error loading universities:", err);
    }
  };

  const loadRegistrations = async () => {
    try {
      const status = activeTab === 'pending' ? 'PENDING' : 
                     activeTab === 'approved' ? 'APPROVED' : 'REJECTED';
      
      const response = await fetch(`/api/admin/registrations?status=${status}`);
      
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations || []);
      } else {
        // Fallback to mock data
        setRegistrations(mockRegistrations);
      }
    } catch (err) {
      console.error("Error loading registrations:", err);
      setRegistrations(mockRegistrations);
    }
  };

  const handleApprove = async (registration: any) => {
    if (!confirm(`Approve ${registration.universityName}?`)) return;

    try {
      const response = await fetch(`/api/admin/registrations/${registration.id}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert(`${registration.universityName} has been approved!`);
        loadRegistrations(); // Reload the list
      } else {
        const error = await response.json();
        alert(`Failed to approve: ${error.error}`);
      }
    } catch (err) {
      console.error("Error approving registration:", err);
      alert("An error occurred while approving the registration");
    }
  };

  const handleReject = async () => {
    if (!selectedRegistration || !rejectionReason.trim()) return;

    try {
      const response = await fetch(`/api/admin/registrations/${selectedRegistration.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        alert(`Registration rejected`);
        setShowRejectDialog(false);
        setSelectedRegistration(null);
        setRejectionReason("");
        loadRegistrations(); // Reload the list
      } else {
        const error = await response.json();
        alert(`Failed to reject: ${error.error}`);
      }
    } catch (err) {
      console.error("Error rejecting registration:", err);
      alert("An error occurred while rejecting the registration");
    }
  };

  const openRejectDialog = (registration: any) => {
    setSelectedRegistration(registration);
    setShowRejectDialog(true);
  };

  const handleCreateUniversity = async () => {
    if (!formData.name || !formData.slug || !formData.contactEmail) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("University created successfully!");
        setShowCreateDialog(false);
        setFormData({
          name: "",
          slug: "",
          city: "",
          country: "Haiti",
          contactEmail: "",
          contactPhone: "",
          websiteUrl: "",
          description: "",
        });
        loadUniversities();
      } else {
        const error = await response.json();
        alert(`Failed to create university: ${error.error}`);
      }
    } catch (err) {
      console.error("Error creating university:", err);
      alert("An error occurred while creating the university");
    }
  };

  const handleEditUniversity = async () => {
    if (!selectedUniversity || !formData.name || !formData.contactEmail) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(`/api/admin/universities/${selectedUniversity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("University updated successfully!");
        setShowEditDialog(false);
        setSelectedUniversity(null);
        loadUniversities();
      } else {
        const error = await response.json();
        alert(`Failed to update university: ${error.error}`);
      }
    } catch (err) {
      console.error("Error updating university:", err);
      alert("An error occurred while updating the university");
    }
  };

  const handleDeleteUniversity = async (university: any) => {
    if (!confirm(`Are you sure you want to delete ${university.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/universities/${university.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("University deleted successfully!");
        loadUniversities();
      } else {
        const error = await response.json();
        alert(`Failed to delete university: ${error.error}`);
      }
    } catch (err) {
      console.error("Error deleting university:", err);
      alert("An error occurred while deleting the university");
    }
  };

  const openEditDialog = (university: any) => {
    setSelectedUniversity(university);
    setFormData({
      name: university.name || "",
      slug: university.slug || "",
      city: university.city || "",
      country: university.country || "Haiti",
      contactEmail: university.contactEmail || "",
      contactPhone: university.contactPhone || "",
      websiteUrl: university.websiteUrl || "",
      description: university.description || "",
    });
    setShowEditDialog(true);
  };

  const toggleBulkSelection = (id: string) => {
    const newSelection = new Set(selectedForBulk);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedForBulk(newSelection);
  };

  const handleBulkApproval = async () => {
    if (selectedForBulk.size === 0) {
      alert("Please select at least one registration to approve");
      return;
    }

    try {
      const promises = Array.from(selectedForBulk).map(id =>
        fetch(`/api/admin/registrations/${id}/approve`, { method: 'PUT' })
      );

      await Promise.all(promises);
      alert(`${selectedForBulk.size} registration(s) approved successfully!`);
      setSelectedForBulk(new Set());
      setShowBulkApprovalDialog(false);
      loadRegistrations();
      loadUniversities();
    } catch (err) {
      console.error("Error bulk approving:", err);
      alert("An error occurred during bulk approval");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">University Management</h1>
          <p className="text-muted-foreground">Review registrations and manage universities</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add University
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin">← Admin Dashboard</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval ({registrations.filter(r => r.status === "PENDING").length})
          </TabsTrigger>
          <TabsTrigger value="universities">
            All Universities ({universities.length})
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {registrations.filter(r => r.status === "PENDING").length > 0 && (
            <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedForBulk.size === registrations.filter(r => r.status === "PENDING").length && selectedForBulk.size > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedForBulk(new Set(registrations.filter(r => r.status === "PENDING").map(r => r.id)));
                    } else {
                      setSelectedForBulk(new Set());
                    }
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">
                  {selectedForBulk.size > 0 ? `${selectedForBulk.size} selected` : 'Select all'}
                </span>
              </div>
              {selectedForBulk.size > 0 && (
                <Button size="sm" onClick={() => setShowBulkApprovalDialog(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Selected ({selectedForBulk.size})
                </Button>
              )}
            </div>
          )}

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
                <Card key={registration.id} className={selectedForBulk.has(registration.id) ? "border-blue-500 border-2" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedForBulk.has(registration.id)}
                          onChange={() => toggleBulkSelection(registration.id)}
                          className="mt-1 h-4 w-4"
                        />
                        <div>
                          <CardTitle>{registration.name}</CardTitle>
                          <CardDescription>
                            {registration.city}, {registration.country}
                          </CardDescription>
                        </div>
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

        <TabsContent value="universities" className="space-y-4">
          {universities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No universities yet</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First University
                </Button>
              </CardContent>
            </Card>
          ) : (
            universities.map((university) => (
              <Card key={university.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{university.name}</CardTitle>
                      <CardDescription>
                        {university.city && `${university.city}, `}{university.country || "Haiti"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(university)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteUniversity(university)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Email:</p>
                      <p className="font-medium">{university.contactEmail}</p>
                    </div>
                    {university.contactPhone && (
                      <div>
                        <p className="text-muted-foreground">Phone:</p>
                        <p className="font-medium">{university.contactPhone}</p>
                      </div>
                    )}
                    {university.websiteUrl && (
                      <div>
                        <p className="text-muted-foreground">Website:</p>
                        <a href={university.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {university.websiteUrl}
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Slug:</p>
                      <p className="font-medium font-mono text-xs">{university.slug}</p>
                    </div>
                  </div>
                  {university.description && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{university.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Approved universities appear in the "All Universities" tab
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

      {/* Create University Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New University</DialogTitle>
            <DialogDescription>
              Create a new university in the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">University Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Université d'État d'Haïti"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  placeholder="ueh"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Port-au-Prince"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Haiti"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="admissions@university.edu.ht"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+509 1234 5678"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://www.university.edu.ht"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the university..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUniversity}>
                Create University
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit University Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit University</DialogTitle>
            <DialogDescription>
              Update university information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">University Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug (URL) *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contactEmail">Contact Email *</Label>
                <Input
                  id="edit-contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                <Input
                  id="edit-contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-websiteUrl">Website URL</Label>
              <Input
                id="edit-websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUniversity}>
                Update University
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Approval Dialog */}
      <Dialog open={showBulkApprovalDialog} onOpenChange={setShowBulkApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Approval</DialogTitle>
            <DialogDescription>
              You are about to approve {selectedForBulk.size} university registration(s). This will activate them in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowBulkApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkApproval}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve {selectedForBulk.size} Registration(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
