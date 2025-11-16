"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getAllDemoPrograms } from "@/lib/demo-data";

export default function SchoolProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    degree: "",
    description: "",
    requirements: "",
    feeCents: "",
    currency: "HTG",
    deadline: "",
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      // TODO: Fetch programs from API
      // For now, using comprehensive demo data
      setDemoMode(true); // Always in demo mode until API is implemented
      const demoPrograms = getAllDemoPrograms();
      setPrograms(demoPrograms.map(p => ({
        id: p.id,
        name: p.name,
        degree: p.degree,
        description: p.description,
        requirements: p.requirements,
        feeCents: p.feeCents,
        currency: p.currency,
        deadline: p.deadline,
        duration: p.duration,
        language: p.language,
      })));
    } catch (err) {
      console.error("Error loading programs:", err);
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: Call API to create/update program
      console.log("Saving program:", formData);
      
      // Close dialog and reset form
      setShowDialog(false);
      setEditingProgram(null);
      setFormData({
        name: "",
        degree: "",
        description: "",
        requirements: "",
        feeCents: "",
        currency: "HTG",
        deadline: "",
      });
      
      // Reload programs
      loadPrograms();
    } catch (err) {
      console.error("Error saving program:", err);
    }
  };

  const handleEdit = (program: any) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      degree: program.degree,
      description: program.description || "",
      requirements: program.requirements || "",
      feeCents: (program.feeCents / 100).toString(),
      currency: program.currency,
      deadline: program.deadline,
    });
    setShowDialog(true);
  };

  const handleDelete = async (programId: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;
    
    try {
      // TODO: Call API to delete program
      console.log("Deleting program:", programId);
      loadPrograms();
    } catch (err) {
      console.error("Error deleting program:", err);
    }
  };

  const formatCurrency = (cents: number, currency: string) => {
    const amount = cents / 100;
    if (currency === "HTG") {
      return `${amount.toLocaleString()} HTG`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Demo Mode Alert */}
      {demoMode && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Demo Mode</h3>
              <p className="text-sm text-amber-800 mb-2">
                You&apos;re viewing sample program data. To manage real programs, please{' '}
                <Link href="/auth/signin" className="underline font-medium">sign in</Link>
                {' '}or{' '}
                <Link href="/schools/register" className="underline font-medium">register your institution</Link>.
              </p>
              <p className="text-xs text-amber-700">
                This demo includes sample programs to demonstrate the program management interface.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Programs</h1>
          <p className="text-muted-foreground">Manage your university programs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/schools/dashboard">← Dashboard</Link>
          </Button>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Program
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      ) : programs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No programs yet</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Program
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card key={program.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{program.name}</CardTitle>
                    <CardDescription>{program.degree} Degree</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(program)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(program.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.description && (
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {program.description}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Application Fee</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(program.feeCents, program.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">
                      {new Date(program.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {program.duration && (
                  <div>
                    <p className="text-sm text-muted-foreground">Duration: <span className="font-medium text-foreground">{program.duration}</span></p>
                  </div>
                )}

                {program.language && (
                  <div>
                    <p className="text-sm text-muted-foreground">Language: <span className="font-medium text-foreground">{program.language}</span></p>
                  </div>
                )}

                <div className="pt-4 flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/schools/dashboard/questions?programId=${program.id}`}>
                      Custom Questions
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/schools/dashboard/applications?programId=${program.id}`}>
                      Applications
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Program Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? "Edit Program" : "Create New Program"}
            </DialogTitle>
            <DialogDescription>
              Configure program details and application requirements
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree">Degree Level *</Label>
                <select
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="">Select degree</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Associate">Associate</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="Doctorate">Doctorate</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the program"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Admission requirements"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="feeCents">Application Fee (Amount) *</Label>
                <Input
                  id="feeCents"
                  type="number"
                  value={formData.feeCents}
                  onChange={(e) => setFormData({ ...formData, feeCents: e.target.value })}
                  placeholder="1500.00"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="HTG">HTG (Gourde)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingProgram ? "Save Changes" : "Create Program"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
