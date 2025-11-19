"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Search, GraduationCap, Building2, Plus, Edit, Trash2, DollarSign, Calendar } from "lucide-react";

interface Program {
  id: string;
  name: string;
  degree: string;
  universityId: string;
  universityName: string;
  feeCents: number;
  currency: string;
  deadline: any;
  description?: string;
  isActive?: boolean;
  requirements?: string[];
}

export default function AdminProgramsPage() {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    degree: "BACHELOR",
    universityId: "",
    feeCents: 0,
    currency: "HTG",
    deadline: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    loadPrograms();
    loadUniversities();
  }, []);

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

  const loadPrograms = async () => {
    try {
      const response = await fetch('/api/admin/programs');
      
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
        setDemoMode(false);
      } else {
        // Demo mode
        setDemoMode(true);
        setPrograms([
          {
            id: "1",
            name: "Bachelor of Science in Computer Science",
            degree: "BACHELOR",
            universityId: "u1",
            universityName: "Université d'État d'Haïti",
            feeCents: 50000,
            currency: "HTG",
            deadline: new Date("2025-08-01"),
          },
          {
            id: "2",
            name: "Master of Business Administration",
            degree: "MASTER",
            universityId: "u1",
            universityName: "Université d'État d'Haïti",
            feeCents: 75000,
            currency: "HTG",
            deadline: new Date("2025-07-15"),
          },
          {
            id: "3",
            name: "Bachelor of Engineering",
            degree: "BACHELOR",
            universityId: "u2",
            universityName: "Université Quisqueya",
            feeCents: 45000,
            currency: "HTG",
            deadline: new Date("2025-08-15"),
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading programs:", err);
      setDemoMode(true);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!formData.name || !formData.universityId) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Program created successfully!");
        setShowCreateDialog(false);
        setFormData({
          name: "",
          degree: "BACHELOR",
          universityId: "",
          feeCents: 0,
          currency: "HTG",
          deadline: "",
          description: "",
          isActive: true,
        });
        loadPrograms();
      } else {
        const error = await response.json();
        alert(`Failed to create program: ${error.error}`);
      }
    } catch (err) {
      console.error("Error creating program:", err);
      alert("An error occurred while creating the program");
    }
  };

  const handleEditProgram = async () => {
    if (!selectedProgram || !formData.name || !formData.universityId) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(`/api/admin/programs/${selectedProgram.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Program updated successfully!");
        setShowEditDialog(false);
        setSelectedProgram(null);
        loadPrograms();
      } else {
        const error = await response.json();
        alert(`Failed to update program: ${error.error}`);
      }
    } catch (err) {
      console.error("Error updating program:", err);
      alert("An error occurred while updating the program");
    }
  };

  const handleDeleteProgram = async (program: Program) => {
    if (!confirm(`Are you sure you want to delete ${program.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/programs/${program.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Program deleted successfully!");
        loadPrograms();
      } else {
        const error = await response.json();
        alert(`Failed to delete program: ${error.error}`);
      }
    } catch (err) {
      console.error("Error deleting program:", err);
      alert("An error occurred while deleting the program");
    }
  };

  const handleToggleActive = async (program: Program) => {
    try {
      const response = await fetch(`/api/admin/programs/${program.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !program.isActive }),
      });

      if (response.ok) {
        loadPrograms();
      } else {
        const error = await response.json();
        alert(`Failed to update program status: ${error.error}`);
      }
    } catch (err) {
      console.error("Error updating program status:", err);
      alert("An error occurred while updating the program status");
    }
  };

  const openEditDialog = (program: Program) => {
    setSelectedProgram(program);
    setFormData({
      name: program.name || "",
      degree: program.degree || "BACHELOR",
      universityId: program.universityId || "",
      feeCents: program.feeCents || 0,
      currency: program.currency || "HTG",
      deadline: program.deadline ? new Date(program.deadline).toISOString().split('T')[0] : "",
      description: program.description || "",
      isActive: program.isActive !== false,
    });
    setShowEditDialog(true);
  };

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.universityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDegreeLabel = (degree: string) => {
    const labels: Record<string, string> = {
      BACHELOR: "Bachelor's",
      MASTER: "Master's",
      DOCTORATE: "PhD",
      ASSOCIATE: "Associate",
      CERTIFICATE: "Certificate",
      DIPLOMA: "Diploma",
    };
    return labels[degree] || degree;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading programs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {demoMode && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">Demo Mode</h3>
              <p className="text-sm text-amber-800">
                Viewing sample program data. Sign in as admin to see real programs.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Program Management</h1>
          <p className="text-muted-foreground">
            {programs.length} programs across all universities
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Program
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search programs or universities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No programs found</p>
            {programs.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Program
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className={program.isActive === false ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{getDegreeLabel(program.degree)}</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(program)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteProgram(program)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{program.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {program.universityName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Application Fee:
                    </span>
                    <span className="font-semibold">
                      {program.feeCents / 100} {program.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Deadline:
                    </span>
                    <span className="font-medium">
                      {new Date(program.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {program.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {program.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">
                    {program.isActive === false ? "Inactive" : "Active"}
                  </span>
                  <Switch
                    checked={program.isActive !== false}
                    onCheckedChange={() => handleToggleActive(program)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Program Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Programs</p>
              <p className="text-2xl font-bold">{programs.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {programs.filter(p => p.isActive !== false).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bachelor&apos;s</p>
              <p className="text-2xl font-bold">
                {programs.filter(p => p.degree === "BACHELOR").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Master&apos;s</p>
              <p className="text-2xl font-bold">
                {programs.filter(p => p.degree === "MASTER").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Other</p>
              <p className="text-2xl font-bold">
                {programs.filter(p => !["BACHELOR", "MASTER"].includes(p.degree)).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Program Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Program</DialogTitle>
            <DialogDescription>
              Create a new academic program
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="program-name">Program Name *</Label>
              <Input
                id="program-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bachelor of Science in Computer Science"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree Type *</Label>
                <Select value={formData.degree} onValueChange={(value) => setFormData({ ...formData, degree: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACHELOR">Bachelor's</SelectItem>
                    <SelectItem value="MASTER">Master's</SelectItem>
                    <SelectItem value="DOCTORATE">PhD/Doctorate</SelectItem>
                    <SelectItem value="ASSOCIATE">Associate</SelectItem>
                    <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                    <SelectItem value="DIPLOMA">Diploma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">University *</Label>
                <Select value={formData.universityId} onValueChange={(value) => setFormData({ ...formData, universityId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">Application Fee (cents) *</Label>
                <Input
                  id="fee"
                  type="number"
                  value={formData.feeCents}
                  onChange={(e) => setFormData({ ...formData, feeCents: parseInt(e.target.value) || 0 })}
                  placeholder="50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HTG">HTG (Gourde)</SelectItem>
                    <SelectItem value="USD">USD (Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the program..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Program Status</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.isActive ? "Active and accepting applications" : "Inactive"}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProgram}>
                Create Program
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Program Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>
              Update program information and fees
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-program-name">Program Name *</Label>
              <Input
                id="edit-program-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-degree">Degree Type *</Label>
                <Select value={formData.degree} onValueChange={(value) => setFormData({ ...formData, degree: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACHELOR">Bachelor's</SelectItem>
                    <SelectItem value="MASTER">Master's</SelectItem>
                    <SelectItem value="DOCTORATE">PhD/Doctorate</SelectItem>
                    <SelectItem value="ASSOCIATE">Associate</SelectItem>
                    <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                    <SelectItem value="DIPLOMA">Diploma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-university">University *</Label>
                <Select value={formData.universityId} onValueChange={(value) => setFormData({ ...formData, universityId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fee">Application Fee (cents) *</Label>
                <Input
                  id="edit-fee"
                  type="number"
                  value={formData.feeCents}
                  onChange={(e) => setFormData({ ...formData, feeCents: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HTG">HTG (Gourde)</SelectItem>
                    <SelectItem value="USD">USD (Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-deadline">Application Deadline</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
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

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Program Status</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.isActive ? "Active and accepting applications" : "Inactive"}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditProgram}>
                Update Program
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
