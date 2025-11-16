"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Building2 } from "lucide-react";

interface ProgramsStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface SchoolGroup {
  universityId: string;
  universityName: string;
  programs: any[];
}

export default function ProgramsStep({ onNext, onBack }: ProgramsStepProps) {
  const t = useTranslations("apply.programs");
  const [programs, setPrograms] = useState<any[]>([]);
  const [schoolGroups, setSchoolGroups] = useState<SchoolGroup[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());
  const [programAnswers, setProgramAnswers] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    // Group programs by school
    const grouped = programs.reduce((acc, program) => {
      const universityId = program.universityId || 'unknown';
      const universityName = program.universityName || 'Unknown University';
      
      const existing = acc.find((g: SchoolGroup) => g.universityId === universityId);
      if (existing) {
        existing.programs.push(program);
      } else {
        acc.push({
          universityId,
          universityName,
          programs: [program]
        });
      }
      return acc;
    }, [] as SchoolGroup[]);
    
    setSchoolGroups(grouped);
  }, [programs]);

  const loadPrograms = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching programs from /api/programs");
      const response = await fetch("/api/programs", {
        cache: "no-store"
      });
      
      console.log("Response status:", response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch programs: ${response.status}`);
      }
      
      const progs = await response.json();
      console.log("Loaded programs:", progs, "Count:", progs.length);
      
      if (!Array.isArray(progs)) {
        throw new Error("Invalid response format");
      }
      
      setPrograms(progs);
    } catch (err) {
      console.error("Error loading programs:", err);
      setError(err instanceof Error ? err.message : "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const toggleSchool = (schoolId: string) => {
    setSelectedSchools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(schoolId)) {
        newSet.delete(schoolId);
        // Deselect all programs from this school
        const schoolPrograms = schoolGroups.find(g => g.universityId === schoolId)?.programs || [];
        const programIds = schoolPrograms.map(p => p.id);
        setSelectedPrograms(prev => prev.filter(id => !programIds.includes(id)));
        // Remove answers for deselected programs
        const newAnswers = { ...programAnswers };
        programIds.forEach(id => delete newAnswers[id]);
        setProgramAnswers(newAnswers);
      } else {
        newSet.add(schoolId);
      }
      return newSet;
    });
  };

  const toggleProgram = (programId: string) => {
    setSelectedPrograms((prev) => {
      if (prev.includes(programId)) {
        // Remove program and its answers
        const newAnswers = { ...programAnswers };
        delete newAnswers[programId];
        setProgramAnswers(newAnswers);
        return prev.filter((id) => id !== programId);
      } else {
        // Add program
        return [...prev, programId];
      }
    });
  };

  const toggleExpanded = (programId: string) => {
    setExpandedPrograms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(programId)) {
        newSet.delete(programId);
      } else {
        newSet.add(programId);
      }
      return newSet;
    });
  };

  const handleAnswerChange = (programId: string, questionId: string, answer: string) => {
    setProgramAnswers((prev) => ({
      ...prev,
      [programId]: {
        ...(prev[programId] || {}),
        [questionId]: answer,
      },
    }));
  };

  const validateAnswers = () => {
    for (const programId of selectedPrograms) {
      const program = programs.find(p => p.id === programId);
      if (program?.additionalQuestions) {
        for (const question of program.additionalQuestions) {
          if (question.required && !programAnswers[programId]?.[question.id]?.trim()) {
            return { valid: false, message: `Please answer all required questions for ${program.name}` };
          }
        }
      }
    }
    return { valid: true };
  };

  const handleContinue = () => {
    if (selectedPrograms.length === 0) {
      alert("Please select at least one program");
      return;
    }
    
    // Validate all required questions are answered
    const validation = validateAnswers();
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    
    // Store selected programs and answers in localStorage for payment step
    const programsData = selectedPrograms.map(programId => {
      const program = programs.find(p => p.id === programId);
      return {
        id: programId,
        name: program?.name,
        feeCents: program?.feeCents,
        currency: program?.currency,
        universityName: program?.universityName,
        answers: programAnswers[programId] || {},
      };
    });
    
    localStorage.setItem("selectedProgramsData", JSON.stringify(programsData));
    localStorage.setItem("selectedPrograms", JSON.stringify(selectedPrograms));
    onNext();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>Select the programs you want to apply to</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border p-4 rounded animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="flex gap-2 mt-2">
                    <div className="h-5 w-20 bg-gray-200 rounded"></div>
                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>First select schools, then choose programs within each school</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold">Error loading programs</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <Button 
              onClick={loadPrograms} 
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        )}
        
        {!error && schoolGroups.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No programs available at this time.</p>
            <Button onClick={loadPrograms} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        )}
        
        {!error && schoolGroups.length > 0 && (
          <div className="space-y-6">
            {schoolGroups.map((school) => {
              const isSchoolSelected = selectedSchools.has(school.universityId);
              const schoolProgramCount = school.programs.filter(p => selectedPrograms.includes(p.id)).length;
              
              return (
                <div key={school.universityId} className="border-2 rounded-lg overflow-hidden">
                  {/* School Header */}
                  <div className={`p-4 bg-gradient-to-r ${isSchoolSelected ? 'from-primary/10 to-primary/5 border-b-2 border-primary' : 'from-muted to-background border-b'}`}>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={school.universityId}
                        checked={isSchoolSelected}
                        onCheckedChange={() => toggleSchool(school.universityId)}
                        className="h-5 w-5"
                      />
                      <div className="flex-1">
                        <label htmlFor={school.universityId} className="flex items-center gap-2 cursor-pointer">
                          <Building2 className="h-5 w-5 text-primary" />
                          <span className="font-bold text-lg">{school.universityName}</span>
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {school.programs.length} {school.programs.length === 1 ? 'program' : 'programs'} available
                          {schoolProgramCount > 0 && ` · ${schoolProgramCount} selected`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Programs List - Only show if school is selected */}
                  {isSchoolSelected && (
                    <div className="p-4 bg-muted/30 space-y-3">
                      {school.programs.map((program) => {
                        const isProgramSelected = selectedPrograms.includes(program.id);
                        const isExpanded = expandedPrograms.has(program.id);
                        const hasQuestions = program.additionalQuestions && program.additionalQuestions.length > 0;
                        
                        return (
                          <div 
                            key={program.id} 
                            className={`border rounded-lg bg-white ${isProgramSelected ? 'ring-2 ring-primary' : ''}`}
                          >
                            <div className="flex items-start space-x-3 p-4">
                              <Checkbox
                                id={program.id}
                                checked={isProgramSelected}
                                onCheckedChange={() => toggleProgram(program.id)}
                              />
                              <div className="flex-1">
                                <label htmlFor={program.id} className="font-semibold cursor-pointer block">
                                  {program.name}
                                </label>
                                {program.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                                )}
                                <div className="mt-2 flex gap-2 flex-wrap">
                                  <Badge variant="secondary">{program.degree}</Badge>
                                  <Badge>
                                    Fee: {program.currency} {(program.feeCents / 100).toFixed(2)}
                                  </Badge>
                                  {hasQuestions && (
                                    <Badge variant="secondary">
                                      {program.additionalQuestions.length} additional {program.additionalQuestions.length === 1 ? 'question' : 'questions'}
                                    </Badge>
                                  )}
                                </div>
                                
                                {hasQuestions && isProgramSelected && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExpanded(program.id)}
                                    className="mt-2 px-2 h-8"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="h-4 w-4 mr-1" />
                                        Hide Questions
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-4 w-4 mr-1" />
                                        Answer Additional Questions
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {/* Additional Questions Section */}
                            {hasQuestions && isProgramSelected && isExpanded && (
                              <div className="border-t bg-muted/50 p-4 space-y-4">
                                <h4 className="font-semibold text-sm">Additional Questions for {program.name}</h4>
                                {program.additionalQuestions.map((question: any) => (
                                  <div key={question.id} className="space-y-2">
                                    <Label htmlFor={`${program.id}-${question.id}`}>
                                      {question.question}
                                      {question.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
                                    <Textarea
                                      id={`${program.id}-${question.id}`}
                                      value={programAnswers[program.id]?.[question.id] || ''}
                                      onChange={(e) => handleAnswerChange(program.id, question.id, e.target.value)}
                                      placeholder="Type your answer here..."
                                      rows={4}
                                      required={question.required}
                                      className="resize-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleContinue} className="flex-1" disabled={selectedPrograms.length === 0}>
            Continue ({selectedPrograms.length} {selectedPrograms.length === 1 ? 'program' : 'programs'} selected)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
