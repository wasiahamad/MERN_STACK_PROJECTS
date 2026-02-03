import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, ClipboardList, Target } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { useJobAssessment, useStartJobAssessmentAttempt, useSubmitJobAssessmentAttempt } from "@/lib/apiHooks";

export default function JobAssessment() {
  const { id } = useParams();
  const jobId = id || "";
  const navigate = useNavigate();

  const assessmentQuery = useJobAssessment(jobId, { enabled: !!jobId });
  const startAttempt = useStartJobAssessmentAttempt(jobId);
  const submitAttempt = useSubmitJobAssessmentAttempt(jobId);

  const assessment = assessmentQuery.data?.assessment;
  const myAttempt = assessmentQuery.data?.myAttempt;

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const effectiveAttemptId = attemptId || myAttempt?.id || null;

  const total = assessment?.questions?.length || 0;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const canStart = Boolean(assessment?.enabled && total > 0);
  const canSubmit = Boolean(effectiveAttemptId && myAttempt?.status !== "submitted");

  const handleStart = async () => {
    if (!canStart) return;
    try {
      const res = await startAttempt.mutateAsync();
      setAttemptId(res.attempt.id);
      toast({ title: "Assessment started", description: "Answer the questions and submit when ready." });
    } catch (e) {
      toast({
        title: "Failed to start",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!effectiveAttemptId) {
      toast({ title: "Start the assessment", description: "Please start the assessment first.", variant: "destructive" });
      return;
    }

    try {
      const payload = Object.entries(answers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      }));

      const res = await submitAttempt.mutateAsync({ attemptId: effectiveAttemptId, answers: payload });
      toast({
        title: res.attempt.passed ? "Passed" : "Submitted",
        description: `Score: ${res.attempt.percent}% (${res.attempt.scoreMarks}/${res.attempt.totalMarks})`,
      });

      navigate(`/jobs/${jobId}`);
    } catch (e) {
      toast({
        title: "Submit failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                <span className="gradient-text">Job Screening Assessment</span>
              </h1>
              <p className="text-muted-foreground mt-1">Pass the screening test before applying.</p>
            </div>
            <Link to={`/jobs/${jobId}`}>
              <Button variant="outline">Back to Job</Button>
            </Link>
          </div>

          <GlassCard className="p-6" hover={false}>
            {assessmentQuery.isLoading ? (
              <div className="space-y-3">
                <SkeletonLoader className="h-6 w-72 rounded" />
                <SkeletonLoader className="h-4 w-96 rounded" />
                <SkeletonLoader className="h-10 w-40 rounded" />
              </div>
            ) : assessmentQuery.isError ? (
              <p className="text-muted-foreground">Failed to load assessment.</p>
            ) : !assessment ? (
              <p className="text-muted-foreground">Assessment not found.</p>
            ) : !assessment.enabled ? (
              <p className="text-muted-foreground">This job does not require a screening assessment.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Target className="h-4 w-4" /> Pass threshold: <span className="font-medium text-foreground">{assessment.passPercent}%</span>
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" /> Questions: <span className="font-medium text-foreground">{assessment.questionsCount}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <GradientButton onClick={handleStart} disabled={!canStart || startAttempt.isPending}>
                      {myAttempt?.status === "in_progress" || attemptId ? "Continue" : "Start"}
                    </GradientButton>
                    <Button variant="outline" onClick={handleSubmit} disabled={!canSubmit || submitAttempt.isPending}>
                      Submit
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Answered {answeredCount}/{total}</span>
                    {myAttempt?.status === "submitted" ? (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-3 w-3" />
                        Last attempt: {myAttempt.percent}% ({myAttempt.passed ? "Passed" : "Not passed"})
                      </span>
                    ) : null}
                  </div>
                  <Progress value={total ? Math.round((answeredCount / total) * 100) : 0} />
                </div>
              </div>
            )}
          </GlassCard>

          {assessment?.enabled && assessment.questions?.length ? (
            <div className="space-y-4">
              {assessment.questions.map((q, idx) => (
                <GlassCard key={q.questionId} className="p-6" hover={false}>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Question {idx + 1} • {q.difficulty}</p>
                      <p className="font-medium mt-1">{q.text}</p>
                    </div>

                    <RadioGroup
                      value={answers[q.questionId] != null ? String(answers[q.questionId]) : undefined}
                      onValueChange={(v) => {
                        const n = Number(v);
                        if (!Number.isInteger(n)) return;
                        setAnswers((prev) => ({ ...prev, [q.questionId]: n }));
                      }}
                      className="gap-3"
                    >
                      {q.options.map((opt, optIdx) => (
                        <Label
                          key={optIdx}
                          className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/30"
                        >
                          <RadioGroupItem value={String(optIdx)} />
                          <span className="text-sm">{opt}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : null}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
