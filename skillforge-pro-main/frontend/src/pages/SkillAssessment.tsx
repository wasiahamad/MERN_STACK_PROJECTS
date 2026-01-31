import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, ArrowLeft, ShieldAlert } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { toast } from "@/hooks/use-toast";

import { useGenerateAssessment, useSubmitAssessment, type AssessmentQuestion } from "@/lib/apiHooks";
import { useExamSecurity } from "@/hooks/useExamSecurity";

type ExamState =
  | { status: "idle" }
  | { status: "starting" }
  | { status: "in_exam"; attemptId: string; questions: AssessmentQuestion[] }
  | {
      status: "completed";
      skillName: string;
      accuracy: number;
      verification: "verified" | "partially_verified" | "not_verified";
      correctAnswers: number;
      violationCount: number;
      autoSubmitted: boolean;
    };

export default function SkillAssessment() {
  const navigate = useNavigate();
  const { skillName: skillNameParam } = useParams();
  const skillName = useMemo(() => String(skillNameParam || "").trim(), [skillNameParam]);

  const [exam, setExam] = useState<ExamState>({ status: "idle" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const generateMutation = useGenerateAssessment();
  const submitMutation = useSubmitAssessment();

  const inExam = exam.status === "in_exam";

  const { violationCount, requestFullscreen, exitFullscreen } = useExamSecurity({
    enabled: inExam,
    maxViolations: 2,
    onFirstViolation: () => {
      toast({
        title: "Warning",
        description: "Exam rule violation detected. Next time the exam will be auto-submitted.",
        variant: "destructive",
      });
    },
    onMaxViolations: () => {
      setAutoSubmitted(true);
      toast({
        title: "Exam auto-submitted",
        description: "Multiple violations detected. Submitting your test.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!skillName) return;
    // Reset when route changes
    setExam({ status: "idle" });
    setCurrentIndex(0);
    setAnswers({});
    setAutoSubmitted(false);
  }, [skillName]);

  const questions = exam.status === "in_exam" ? exam.questions : [];
  const attemptId = exam.status === "in_exam" ? exam.attemptId : null;

  const currentQuestion = questions[currentIndex];
  const total = questions.length || 10;

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = Math.min(100, Math.round((answeredCount / 10) * 100));

  const startExam = async () => {
    if (!skillName) {
      toast({ title: "Skill missing", description: "Please select a skill first.", variant: "destructive" });
      return;
    }

    try {
      setExam({ status: "starting" });

      // Must be triggered directly from the user gesture to avoid browser blocks.
      await requestFullscreen();

      const { attempt, questions } = await generateMutation.mutateAsync({ skillName });

      setExam({ status: "in_exam", attemptId: attempt.id, questions });
      setCurrentIndex(0);
      setAnswers({});
      setAutoSubmitted(false);
    } catch (e) {
      await exitFullscreen();
      setExam({ status: "idle" });
      toast({
        title: "Unable to start test",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitExam = async (forcedAutoSubmit = false) => {
    if (!attemptId || !questions.length) return;

    const payload = questions.map((q) => ({
      questionId: q.questionId,
      selectedIndex: typeof answers[q.questionId] === "number" ? answers[q.questionId] : -1,
    }));

    // Require all answers unless autosubmitting.
    if (!forcedAutoSubmit) {
      const unanswered = payload.filter((a) => a.selectedIndex < 0);
      if (unanswered.length) {
        toast({
          title: "Incomplete",
          description: "Please answer all 10 questions before submitting.",
          variant: "destructive",
        });
        return;
      }
    }

    // Fill unanswered with 0 when autosubmitting/failing.
    const normalizedAnswers = payload.map((a) => ({
      questionId: a.questionId,
      selectedIndex: a.selectedIndex < 0 ? 0 : a.selectedIndex,
    }));

    try {
      const res = await submitMutation.mutateAsync({
        attemptId,
        answers: normalizedAnswers,
        violationCount,
        autoSubmitted: forcedAutoSubmit || autoSubmitted,
      });

      await exitFullscreen();

      setExam({
        status: "completed",
        skillName,
        accuracy: res.result.accuracy,
        verification: res.result.status,
        correctAnswers: res.result.correctAnswers,
        violationCount: res.result.violationCount,
        autoSubmitted: res.result.autoSubmitted,
      });
    } catch (e) {
      toast({
        title: "Submit failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Auto-submit when violations exceed limit.
  useEffect(() => {
    if (!inExam) return;
    if (violationCount < 2) return;
    submitExam(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [violationCount]);

  const verificationBadge = (v: "verified" | "partially_verified" | "not_verified") => {
    if (v === "verified") return <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>;
    if (v === "partially_verified") return <Badge className="bg-warning/10 text-warning border-warning/20">Partially Verified</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Not Verified</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <button
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {inExam ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldAlert className="h-4 w-4 text-warning" />
                Violations: <span className="font-semibold text-foreground">{violationCount}</span>/2
              </div>
            ) : null}
          </div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Skill Assessment: <span className="gradient-text">{skillName || "—"}</span>
            </h1>
            <p className="text-muted-foreground mt-1">10 questions • 10% weight each • No negative marking</p>
          </motion.div>

          {exam.status === "idle" || exam.status === "starting" ? (
            <GlassCard className="p-6">
              <h2 className="font-display text-lg font-semibold mb-3">Exam Rules</h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Test has exactly 10 MCQs (5 easy, 3 medium, 2 hard).</li>
                <li>• Each correct answer increases accuracy by 10%.</li>
                <li>• Fullscreen is required and anti-cheat is enabled.</li>
                <li>• First violation shows warning, multiple violations auto-submit the test.</li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <GradientButton loading={exam.status === "starting"} onClick={startExam}>
                  Start Test
                </GradientButton>
                <Button variant="outline" onClick={() => navigate("/profile")}>Go to Profile</Button>
              </div>

              {!skillName ? (
                <div className="mt-4 rounded-lg border border-border p-4 text-sm text-muted-foreground">
                  Open this page using a skill name: <span className="font-medium">/assessment/React</span>
                </div>
              ) : null}
            </GlassCard>
          ) : null}

          {exam.status === "in_exam" ? (
            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div className="text-sm text-muted-foreground">
                    Question <span className="font-semibold text-foreground">{currentIndex + 1}</span> / 10
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{currentQuestion?.difficulty || ""}</Badge>
                    <Badge variant="secondary">Progress: {progress}%</Badge>
                  </div>
                </div>

                <Progress value={progress} className="h-3" />

                <div className="mt-6">
                  {currentQuestion ? (
                    <>
                      <h3 className="font-display text-lg font-semibold">{currentQuestion.text}</h3>
                      <div className="mt-4 grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((opt, idx) => {
                          const selected = answers[currentQuestion.questionId] === idx;
                          return (
                            <button
                              key={idx}
                              className={
                                "text-left rounded-xl border p-4 transition-colors " +
                                (selected
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-card hover:border-primary/50")
                              }
                              onClick={() => selectOption(currentQuestion.questionId, idx)}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={
                                    "mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center text-xs " +
                                    (selected ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground")
                                  }
                                >
                                  {String.fromCharCode(65 + idx)}
                                </div>
                                <div className="text-sm">{opt}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3 justify-between">
                        <Button
                          variant="outline"
                          disabled={currentIndex === 0}
                          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                        >
                          Previous
                        </Button>

                        <div className="flex gap-3">
                          {currentIndex < 9 ? (
                            <GradientButton
                              disabled={typeof answers[currentQuestion.questionId] !== "number"}
                              onClick={() => setCurrentIndex((i) => Math.min(9, i + 1))}
                            >
                              Next
                            </GradientButton>
                          ) : (
                            <GradientButton onClick={() => submitExam(false)} loading={submitMutation.isPending}>
                              Submit Test
                            </GradientButton>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <SkeletonLoader className="h-6 w-2/3 rounded" />
                      <SkeletonLoader className="h-4 w-full rounded" />
                      <SkeletonLoader className="h-4 w-11/12 rounded" />
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-lg border border-border p-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                    <p>
                      Exam mode is active. Leaving the tab/window or using shortcuts will be counted as violations.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          ) : null}

          {exam.status === "completed" ? (
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Result</h2>
                  <p className="text-sm text-muted-foreground">{exam.skillName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="font-display text-3xl font-bold">{exam.accuracy}%</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="font-display text-3xl font-bold">{exam.correctAnswers}/10</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-2">{verificationBadge(exam.verification)}</div>
                </div>
              </div>

              {exam.autoSubmitted ? (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  This test was auto-submitted due to exam rule violations. Violations: {exam.violationCount}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <GradientButton onClick={() => startExam()}>Retry</GradientButton>
                <Button variant="outline" onClick={() => navigate("/profile")}>Go to Profile</Button>
              </div>
            </GlassCard>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
