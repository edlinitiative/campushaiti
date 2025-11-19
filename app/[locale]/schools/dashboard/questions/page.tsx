"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type QuestionType = "TEXT" | "TEXTAREA" | "SELECT" | "MULTISELECT" | "FILE" | "DATE" | "NUMBER";

interface CustomQuestion {
  id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  order: number;
  isActive: boolean;
}

export default function CustomQuestionsPage() {
  const t = useTranslations("schools.questions");
  const [demoMode] = useState(true); // Demo mode until API is implemented
  const [questions, setQuestions] = useState<CustomQuestion[]>([
    {
      id: "1",
      question: "Why do you want to study at our university?",
      type: "TEXTAREA",
      required: true,
      placeholder: "Tell us your motivation...",
      order: 1,
      isActive: true,
    },
    {
      id: "2",
      question: "Do you have previous work experience?",
      type: "SELECT",
      required: false,
      options: ["No experience", "Less than 1 year", "1-3 years", "3+ years"],
      order: 2,
      isActive: true,
    },
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    type: "TEXT" as QuestionType,
    required: true,
    placeholder: "",
    helpText: "",
    options: "",
  });

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      question: "",
      type: "TEXT",
      required: true,
      placeholder: "",
      helpText: "",
      options: "",
    });
    setShowDialog(true);
  };

  const handleEditQuestion = (question: CustomQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      type: question.type,
      required: question.required,
      placeholder: question.placeholder || "",
      helpText: question.helpText || "",
      options: question.options?.join("\n") || "",
    });
    setShowDialog(true);
  };

  const handleSaveQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: editingQuestion?.id || String(Date.now()),
      question: formData.question,
      type: formData.type,
      required: formData.required,
      placeholder: formData.placeholder,
      helpText: formData.helpText,
      options: formData.options ? formData.options.split("\n").filter(o => o.trim()) : undefined,
      order: editingQuestion?.order || questions.length + 1,
      isActive: true,
    };

    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? newQuestion : q));
    } else {
      setQuestions([...questions, newQuestion]);
    }

    setShowDialog(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm(t("confirmDelete"))) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, isActive: !q.isActive } : q
    ));
  };

  const moveQuestion = (id: string, direction: "up" | "down") => {
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === questions.length - 1) return;

    const newQuestions = [...questions];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
    
    // Update order
    newQuestions.forEach((q, i) => {
      q.order = i + 1;
    });

    setQuestions(newQuestions);
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
              <h3 className="font-semibold text-amber-900 mb-1">{t("demoMode")}</h3>
              <p className="text-sm text-amber-800 mb-2">
                {t("demoModeMessage")}{' '}
                <Link href="/auth/signin" className="underline font-medium">{t("signIn")}</Link>
                {' '}{t("or")}{' '}
                <Link href="/schools/register" className="underline font-medium">{t("registerInstitution")}</Link>.
              </p>
              <p className="text-xs text-amber-700">
                {t("demoModeDescription")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href="/schools/dashboard">{t("dashboard")}</Link>
          </Button>
          <Button onClick={handleAddQuestion}>
            {t("addQuestion")}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>{t("noteTitle")}</strong> {t("noteMessage")}
          </p>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t("noQuestions")}</p>
              <Button onClick={handleAddQuestion}>{t("addFirstQuestion")}</Button>
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id} className={!question.isActive ? "opacity-50" : ""}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveQuestion(question.id, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveQuestion(question.id, "down")}
                      disabled={index === questions.length - 1}
                    >
                      ↓
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{question.order}.</span>
                          <h3 className="font-semibold">{question.question}</h3>
                          {question.required && (
                            <Badge variant="destructive" className="text-xs">{t("required")}</Badge>
                          )}
                          {!question.isActive && (
                            <Badge variant="outline" className="text-xs">{t("disabled")}</Badge>
                          )}
                        </div>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{question.type}</Badge>
                          {question.placeholder && (
                            <span>• {t("placeholder")}: {question.placeholder}</span>
                          )}
                        </div>
                        {question.helpText && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("help")}: {question.helpText}
                          </p>
                        )}
                        {question.options && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">{t("options")}:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {question.options.map((opt, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {opt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(question.id)}
                        >
                          {question.isActive ? t("disabled") : t("toggleActive")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          {t("edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          {t("delete")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? t("editQuestion") : t("addNewQuestion")}
            </DialogTitle>
            <DialogDescription>
              {t("dialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">{t("questionLabel")}</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder={t("questionPlaceholder")}
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">{t("questionType")}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: QuestionType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">{t("shortText")}</SelectItem>
                    <SelectItem value="TEXTAREA">{t("longText")}</SelectItem>
                    <SelectItem value="SELECT">{t("singleChoice")}</SelectItem>
                    <SelectItem value="MULTISELECT">{t("multipleChoice")}</SelectItem>
                    <SelectItem value="FILE">{t("fileUpload")}</SelectItem>
                    <SelectItem value="DATE">{t("date")}</SelectItem>
                    <SelectItem value="NUMBER">{t("number")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, required: checked as boolean })
                  }
                />
                <Label htmlFor="required">{t("requiredField")}</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder">{t("placeholderText")}</Label>
              <Input
                id="placeholder"
                value={formData.placeholder}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                placeholder={t("placeholderPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpText">{t("helpText")}</Label>
              <Input
                id="helpText"
                value={formData.helpText}
                onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                placeholder={t("helpTextPlaceholder")}
              />
            </div>

            {(formData.type === "SELECT" || formData.type === "MULTISELECT") && (
              <div className="space-y-2">
                <Label htmlFor="options">{t("optionsLabel")}</Label>
                <Textarea
                  id="options"
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  placeholder={t("optionsPlaceholder")}
                  rows={5}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleSaveQuestion} disabled={!formData.question.trim()}>
                {editingQuestion ? t("updateQuestion") : t("addQuestionButton")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
