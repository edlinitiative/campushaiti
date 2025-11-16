"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Wallet, CheckCircle2, Building2 } from "lucide-react";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface SchoolGroup {
  universityId: string;
  universityName: string;
  programs: any[];
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  const t = useTranslations("apply.payment");
  const [loading, setLoading] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [selectedPrograms, setSelectedPrograms] = useState<any[]>([]);
  const [schoolGroups, setSchoolGroups] = useState<SchoolGroup[]>([]);
  const [programsToPayNow, setProgramsToPayNow] = useState<Set<string>>(new Set());
  const [paidPrograms, setPaidPrograms] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSelectedPrograms();
  }, []);

  useEffect(() => {
    // Group programs by school
    const grouped = selectedPrograms.reduce((acc, program) => {
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
  }, [selectedPrograms]);

  const loadSelectedPrograms = async () => {
    setLoadingPrograms(true);
    try {
      // Load from new format with answers
      const programsDataStr = localStorage.getItem("selectedProgramsData");
      console.log("Loading programs data:", programsDataStr);
      
      if (programsDataStr) {
        const programsData = JSON.parse(programsDataStr);
        console.log("Parsed programs data:", programsData);
        setSelectedPrograms(programsData);
        // By default, select all programs to pay now
        setProgramsToPayNow(new Set(programsData.map((p: any) => p.id)));
        return;
      }

      // Fallback to old format
      const programIds = JSON.parse(localStorage.getItem("selectedPrograms") || "[]");
      console.log("Fallback to old format, program IDs:", programIds);
      
      if (programIds.length === 0) {
        console.warn("No programs found in localStorage");
        return;
      }
      
      const programs = [];

      for (const id of programIds) {
        const programDoc = await getDoc(doc(db, "programs", id));
        if (programDoc.exists()) {
          const data = programDoc.data();
          programs.push({ id, ...data });
        }
      }

      setSelectedPrograms(programs);
      setProgramsToPayNow(new Set(programs.map(p => p.id)));
    } catch (error) {
      console.error("Error loading programs:", error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const toggleProgramPayment = (programId: string) => {
    setProgramsToPayNow(prev => {
      const newSet = new Set(prev);
      if (newSet.has(programId)) {
        newSet.delete(programId);
      } else {
        newSet.add(programId);
      }
      return newSet;
    });
  };

  const getSelectedTotal = () => {
    return selectedPrograms
      .filter(p => programsToPayNow.has(p.id))
      .reduce((sum, p) => sum + p.feeCents, 0);
  };

  const getPrimaryCurrency = () => {
    const programToPay = selectedPrograms.find(p => programsToPayNow.has(p.id));
    return programToPay?.currency || "HTG";
  };

  const handlePayment = async (method: 'stripe' | 'moncash') => {
    const programsToPay = selectedPrograms.filter(p => programsToPayNow.has(p.id));
    
    if (programsToPay.length === 0) {
      alert("Please select at least one program to pay for");
      return;
    }

    setLoading(true);
    try {
      const totalAmount = getSelectedTotal();
      const currency = method === 'stripe' ? 'USD' : 'HTG';
      
      const endpoint = method === 'stripe' 
        ? "/api/payments/stripe/checkout"
        : "/api/payments/moncash/create";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationItemId: "temp_id",
          amountCents: totalAmount,
          currency,
          programs: programsToPay.map(p => ({
            id: p.id,
            name: p.name,
            feeCents: p.feeCents,
          })),
        }),
      });

      const data = await response.json();
      const redirectUrl = data.sessionUrl || data.paymentUrl;
      
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToReview = () => {
    if (programsToPayNow.size > 0) {
      if (!confirm("You have unpaid programs selected. Are you sure you want to skip payment?")) {
        return;
      }
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Fees Payment</CardTitle>
        <CardDescription>
          Pay for application fees. You can pay for all programs now or select individual programs to pay for later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loadingPrograms ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading programs...</p>
          </div>
        ) : selectedPrograms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No programs selected. Please go back and select programs first.</p>
            <Button onClick={onBack} variant="outline">
              Back to Program Selection
            </Button>
          </div>
        ) : (
          <>
            {/* Programs List with Individual Selection - Grouped by School */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center justify-between">
                <span>Select Programs to Pay Now</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (programsToPayNow.size === selectedPrograms.length) {
                      setProgramsToPayNow(new Set());
                    } else {
                      setProgramsToPayNow(new Set(selectedPrograms.map(p => p.id)));
                    }
                  }}
                >
                  {programsToPayNow.size === selectedPrograms.length ? "Deselect All" : "Select All"}
                </Button>
              </h3>
              
              {schoolGroups.map((school) => (
                <div key={school.universityId} className="border-2 rounded-lg overflow-hidden">
                  {/* School Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-muted to-background border-b flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{school.universityName}</span>
                    <Badge variant="outline" className="ml-auto">
                      {school.programs.filter(p => programsToPayNow.has(p.id)).length} of {school.programs.length} selected
                    </Badge>
                  </div>
                  
                  {/* Programs under this school */}
                  <div className="p-3 bg-muted/20 space-y-2">
                    {school.programs.map((program) => {
                      const isPayingNow = programsToPayNow.has(program.id);
                      const isPaid = paidPrograms.has(program.id);
                      
                      return (
                        <div
                          key={program.id}
                          className={`border rounded-lg p-4 bg-white ${isPayingNow ? 'border-primary ring-2 ring-primary/20' : ''} ${isPaid ? 'border-green-500 bg-green-50' : ''}`}
                        >
                          <div className="flex items-start space-x-3">
                            {!isPaid ? (
                              <Checkbox
                                id={`pay-${program.id}`}
                                checked={isPayingNow}
                                onCheckedChange={() => toggleProgramPayment(program.id)}
                              />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <label
                                htmlFor={`pay-${program.id}`}
                                className="font-medium cursor-pointer block"
                              >
                                {program.name}
                              </label>
                              <div className="mt-2 flex gap-2 items-center">
                                <Badge variant="outline" className="font-semibold">
                                  {program.currency} {(program.feeCents / 100).toFixed(2)}
                                </Badge>
                                {isPaid && (
                                  <Badge className="bg-green-600">Paid</Badge>
                                )}
                                {!isPaid && !isPayingNow && (
                                  <Badge variant="secondary">Pay Later</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            {programsToPayNow.size > 0 && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  {selectedPrograms
                    .filter(p => programsToPayNow.has(p.id))
                    .map((program) => (
                      <div key={program.id} className="flex justify-between text-sm">
                        <span>{program.name}</span>
                        <span className="font-medium">
                          {program.currency} {(program.feeCents / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total to Pay Now</span>
                    <span>
                      {getPrimaryCurrency()} {(getSelectedTotal() / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {programsToPayNow.size > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Choose Payment Method</h3>
                <Button
                  onClick={() => handlePayment('stripe')}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay with Credit/Debit Card (Stripe)
                </Button>
                <Button
                  onClick={() => handlePayment('moncash')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Pay with MonCash (Haiti)
                </Button>
              </div>
            )}

            {/* Information Box */}
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <h4 className="font-semibold text-sm mb-2">Payment Information</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• You can pay for all programs at once or individually</li>
                <li>• Uncheck programs you want to pay for later</li>
                <li>• You can return to complete payment anytime</li>
                <li>• Each program has its own application fee</li>
              </ul>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleSkipToReview} className="flex-1">
            {programsToPayNow.size === 0 ? "Continue to Review" : "Pay Later & Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
