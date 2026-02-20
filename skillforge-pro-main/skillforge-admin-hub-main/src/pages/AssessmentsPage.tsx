import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, AlertTriangle, ToggleLeft, ToggleRight, Plus, Sparkles, Eye, Users, Trophy, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { assessmentsData } from "@/lib/mockData";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { SkeletonTable } from "@/components/dashboard/SkeletonCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

export default function AssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState(assessmentsData);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<"manual" | "ai">("manual");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [form, setForm] = useState({ name: "", skill: "", questions: 20, passPercent: 70, retakeLimit: 3, easy: 30, medium: 50, hard: 20 });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const toggleStatus = (id: number) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a))
    );
  };

  const handleManualCreate = () => {
    const newAssessment = {
      id: assessments.length + 1,
      name: form.name,
      skill: form.skill,
      questions: form.questions,
      passPercent: form.passPercent,
      retakeLimit: form.retakeLimit,
      difficulty: { easy: form.easy, medium: form.medium, hard: form.hard },
      cheats: 0,
      status: "active",
      createdBy: "manual" as const,
      totalParticipants: 0,
      participants: [],
      questionsList: [],
    };
    setAssessments((prev) => [newAssessment, ...prev]);
    setShowCreate(false);
    setForm({ name: "", skill: "", questions: 20, passPercent: 70, retakeLimit: 3, easy: 30, medium: 50, hard: 20 });
  };

  const handleAICreate = () => {
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const generated = {
        id: assessments.length + 1,
        name: `${aiTopic} Assessment`,
        skill: aiTopic,
        questions: Math.floor(Math.random() * 20) + 25,
        passPercent: Math.floor(Math.random() * 15) + 70,
        retakeLimit: Math.floor(Math.random() * 3) + 2,
        difficulty: { easy: 20, medium: 50, hard: 30 },
        cheats: 0,
        status: "active",
        createdBy: "AI" as const,
        totalParticipants: 0,
        participants: [],
        questionsList: [
          { qId: 1, question: `What are the core concepts of ${aiTopic}?`, type: "MCQ", difficulty: "easy" },
          { qId: 2, question: `Explain advanced patterns in ${aiTopic}.`, type: "Descriptive", difficulty: "medium" },
          { qId: 3, question: `How do you optimize performance in ${aiTopic}?`, type: "MCQ", difficulty: "hard" },
        ],
      };
      setAssessments((prev) => [generated, ...prev]);
      setAiGenerating(false);
      setAiTopic("");
      setShowCreate(false);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assessments</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage skill tests, passing criteria, and cheat detection</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <ClipboardCheck className="h-4 w-4" /> Create Assessment
          </button>
        </div>
      </motion.div>

      {/* Create Assessment Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Assessment</DialogTitle>
            <DialogDescription>Create manually or let AI generate from a topic</DialogDescription>
          </DialogHeader>

          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setCreateMode("manual")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${createMode === "manual" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <Plus className="h-4 w-4" /> Manual
            </button>
            <button onClick={() => setCreateMode("ai")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${createMode === "ai" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <Sparkles className="h-4 w-4" /> AI Generate
            </button>
          </div>

          {createMode === "manual" ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Assessment Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. React Advanced" className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Skill</label>
                <input value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} placeholder="e.g. React" className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Questions</label>
                  <input type="number" value={form.questions} onChange={(e) => setForm({ ...form, questions: +e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Pass %</label>
                  <input type="number" value={form.passPercent} onChange={(e) => setForm({ ...form, passPercent: +e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Retake Limit</label>
                  <input type="number" value={form.retakeLimit} onChange={(e) => setForm({ ...form, retakeLimit: +e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Difficulty Distribution (%)</label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  <div>
                    <span className="text-xs text-accent">Easy</span>
                    <input type="number" value={form.easy} onChange={(e) => setForm({ ...form, easy: +e.target.value })} className="mt-0.5 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <span className="text-xs text-warning">Medium</span>
                    <input type="number" value={form.medium} onChange={(e) => setForm({ ...form, medium: +e.target.value })} className="mt-0.5 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <span className="text-xs text-destructive">Hard</span>
                    <input type="number" value={form.hard} onChange={(e) => setForm({ ...form, hard: +e.target.value })} className="mt-0.5 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button onClick={handleManualCreate} disabled={!form.name || !form.skill} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  Create Assessment
                </button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Enter Topic / Skill</label>
                <p className="text-xs text-muted-foreground mb-2">AI will generate questions, difficulty, and passing criteria automatically</p>
                <textarea value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. Advanced React Hooks, Python Data Structures, AWS Lambda..." rows={3}
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <DialogFooter>
                <button onClick={handleAICreate} disabled={!aiTopic.trim() || aiGenerating} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {aiGenerating ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                      Generating with AI...
                    </>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate Assessment</>
                  )}
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading ? <SkeletonTable /> : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {assessments.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{a.name}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${a.createdBy === "AI" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {a.createdBy === "AI" && <Sparkles className="h-3 w-3" />}{a.createdBy}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Skill: {a.skill} · {a.questions} questions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Users className="h-4 w-4" />
                      <span>{a.totalParticipants}</span>
                      {expandedId === a.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button onClick={() => toggleStatus(a.id)} className="flex items-center gap-2 text-sm">
                      {a.status === "active" ? (
                        <><ToggleRight className="h-6 w-6 text-accent" /><span className="text-accent font-medium">Active</span></>
                      ) : (
                        <><ToggleLeft className="h-6 w-6 text-muted-foreground" /><span className="text-muted-foreground font-medium">Inactive</span></>
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Pass %</p>
                    <p className="text-lg font-semibold text-foreground">{a.passPercent}%</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Retake Limit</p>
                    <p className="text-lg font-semibold text-foreground">{a.retakeLimit}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                    <p className="text-xs font-medium text-foreground mt-1">E:{a.difficulty.easy}% M:{a.difficulty.medium}% H:{a.difficulty.hard}%</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Cheat Attempts</p>
                    <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                      {a.cheats} {a.cheats > 5 && <AlertTriangle className="h-4 w-4 text-warning" />}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Participants</p>
                    <p className="text-lg font-semibold text-foreground">{a.totalParticipants}</p>
                  </div>
                </div>
              </div>

              {/* Expanded: Participants & Rankings */}
              <AnimatePresence>
                {expandedId === a.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    {/* Questions List */}
                    {a.questionsList && a.questionsList.length > 0 && (
                      <div className="border-t border-border px-6 py-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" /> Questions ({a.questionsList.length} of {a.questions})
                        </h4>
                        <div className="space-y-2">
                          {a.questionsList.map((q, qi) => (
                            <div key={q.qId} className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{qi + 1}</span>
                              <div className="flex-1">
                                <p className="text-sm text-foreground">{q.question}</p>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">{q.type}</span>
                                  <span className={`text-xs font-medium ${q.difficulty === "easy" ? "text-accent" : q.difficulty === "medium" ? "text-warning" : "text-destructive"}`}>{q.difficulty}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Performers */}
                    {a.participants.length > 0 && (
                      <div className="border-t border-border px-6 py-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-warning" /> Top Performers
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted-foreground border-b border-border">
                                <th className="pb-2 pr-4 font-medium">Rank</th>
                                <th className="pb-2 pr-4 font-medium">User</th>
                                <th className="pb-2 pr-4 font-medium">Score</th>
                                <th className="pb-2 font-medium">Completed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {a.participants.map((p) => (
                                <tr key={p.userId} className="border-b border-border/50">
                                  <td className="py-2 pr-4">
                                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                      p.rank === 1 ? "bg-warning/20 text-warning" : p.rank === 2 ? "bg-muted text-muted-foreground" : p.rank === 3 ? "bg-warning/10 text-warning" : "text-muted-foreground"
                                    }`}>
                                      #{p.rank}
                                    </span>
                                  </td>
                                  <td className="py-2 pr-4 font-medium text-foreground">{p.name}</td>
                                  <td className="py-2 pr-4">
                                    <span className={`font-medium ${p.score >= 90 ? "text-accent" : p.score >= 75 ? "text-warning" : "text-destructive"}`}>{p.score}%</span>
                                  </td>
                                  <td className="py-2 text-muted-foreground">{p.completedAt}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {a.totalParticipants > a.participants.length && (
                          <p className="text-xs text-muted-foreground mt-2">Showing top {a.participants.length} of {a.totalParticipants} participants</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      )}
    </DashboardLayout>
  );
}
