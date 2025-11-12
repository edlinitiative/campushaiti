"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ProgramsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ProgramsStep({ onNext, onBack }: ProgramsStepProps) {
  const t = useTranslations("apply.programs");
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const snapshot = await getDocs(collection(db, "programs"));
      const progs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPrograms(progs);
    } catch (error) {
      console.error("Error loading programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProgram = (programId: string) => {
    setSelectedPrograms((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId]
    );
  };

  const handleContinue = () => {
    if (selectedPrograms.length === 0) {
      alert("Please select at least one program");
      return;
    }
    // Store selected programs in localStorage for payment step
    localStorage.setItem("selectedPrograms", JSON.stringify(selectedPrograms));
    onNext();
  };

  if (loading) {
    return <div>Loading programs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>Select the programs you want to apply to</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {programs.length === 0 ? (
          <p className="text-muted-foreground">No programs available at this time.</p>
        ) : (
          <div className="space-y-4">
            {programs.map((program) => (
              <div key={program.id} className="flex items-start space-x-3 border p-4 rounded">
                <Checkbox
                  id={program.id}
                  checked={selectedPrograms.includes(program.id)}
                  onCheckedChange={() => toggleProgram(program.id)}
                />
                <div className="flex-1">
                  <label htmlFor={program.id} className="font-semibold cursor-pointer">
                    {program.name}
                  </label>
                  <p className="text-sm text-muted-foreground">{program.description}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="secondary">{program.degree}</Badge>
                    <Badge>
                      Fee: {program.currency} {(program.feeCents / 100).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleContinue} className="flex-1" disabled={selectedPrograms.length === 0}>
            Continue ({selectedPrograms.length} selected)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
