import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Briefcase, Calendar, Edit2, MapPin, Save, Trash2, Users } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { toast } from "@/hooks/use-toast";
import { useDeleteRecruiterJob, useRecruiterCandidates, useRecruiterJob, useUpdateRecruiterJob } from "@/lib/apiHooks";
import { formatInrRange } from "@/lib/formatters";

const jobTypes = ["Full-time", "Part-time", "Contract", "Remote"];

function asNumberOrNull(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function RecruiterJobDetail() {
  const { id } = useParams();
  const jobId = id || "";
  const navigate = useNavigate();

  const jobQuery = useRecruiterJob(jobId);
  const candidatesQuery = useRecruiterCandidates({ jobId, limit: 100, sort: "matchScore" });
  const updateJob = useUpdateRecruiterJob();
  const deleteJob = useDeleteRecruiterJob();

  const [editOpen, setEditOpen] = useState(false);

  const job = jobQuery.data?.job;

  const salaryText = useMemo(() => {
    const min = typeof job?.salaryMin === "number" ? job.salaryMin : null;
    const max = typeof job?.salaryMax === "number" ? job.salaryMax : null;
    return formatInrRange(min, max);
  }, [job?.salaryMin, job?.salaryMax]);

  const applicants = candidatesQuery.data?.items || [];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                <span className="gradient-text">Job Details</span>
              </h1>
              <p className="text-muted-foreground mt-1">Recruiter-only view (edit/delete + match verification)</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)} disabled={!job}>
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => {
                  if (!jobId) return;
                  if (!confirm("Delete this job? This cannot be undone.")) return;
                  deleteJob.mutate(jobId, {
                    onSuccess: () => {
                      toast({ title: "Deleted", description: "Job deleted" });
                      navigate("/recruiter/jobs");
                    },
                    onError: (err: any) =>
                      toast({ variant: "destructive", title: "Error", description: err?.message || "Failed to delete" }),
                  });
                }}
                disabled={!job}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Job summary */}
        <GlassCard className="p-6" hover={false}>
          {jobQuery.isLoading ? (
            <div className="space-y-3">
              <SkeletonLoader className="h-6 w-56 rounded" />
              <SkeletonLoader className="h-4 w-72 rounded" />
              <SkeletonLoader className="h-4 w-80 rounded" />
            </div>
          ) : jobQuery.isError ? (
            <p className="text-muted-foreground">Failed to load job.</p>
          ) : !job ? (
            <p className="text-muted-foreground">Job not found.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.type}</span>
                    {salaryText ? <span>{salaryText}</span> : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{job.status}</Badge>
                  {typeof job.minAiScore === "number" ? (
                    <Badge className="bg-primary/10 text-primary">
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      Min AI: {job.minAiScore}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Required skills</p>
                <div className="flex flex-wrap gap-2">
                  {(job.skills || []).map((s: string) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>

              {(job.requirements || []).length ? (
                <div>
                  <p className="text-sm font-medium mb-2">Requirements</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {(job.requirements || [])
                      .flatMap((r: string) => String(r).split(/\r?\n|,/g))
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                      .map((r: string) => (
                        <li key={r}>{r}</li>
                      ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" /> {applicants.length} applicants
                </span>
                <Link to={`/recruiter/candidates?job=${jobId}`}>
                  <Button variant="outline" size="sm">View in Candidates</Button>
                </Link>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Applicants + match verification */}
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Applicants & Match</h3>
            <p className="text-xs text-muted-foreground">Match is based on candidate VERIFIED skills</p>
          </div>

          {candidatesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonLoader key={i} className="h-14 w-full rounded" />
              ))}
            </div>
          ) : applicants.length ? (
            <div className="space-y-3">
              {applicants.map((c: any) => (
                <div key={c.applicationId || c.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.title || ""}</p>
                    {c.matchedSkills || c.missingSkills ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Matched: {(c.matchedSkills || []).join(", ") || "—"} • Missing: {(c.missingSkills || []).join(", ") || "—"}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className="gradient-primary text-primary-foreground">{c.matchScore ?? 0}% Match</Badge>
                    <Link to={`/recruiter/candidates?job=${jobId}`}>
                      <Button variant="outline" size="sm">Open</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No applicants yet.</p>
          )}
        </GlassCard>

        <EditJobSheet
          open={editOpen}
          onOpenChange={setEditOpen}
          job={job}
          onSave={async (body) => {
            await updateJob.mutateAsync({ jobId, body });
          }}
        />
      </div>
    </DashboardLayout>
  );
}

function EditJobSheet({
  open,
  onOpenChange,
  job,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  job: any;
  onSave: (body: any) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  if (!job) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Edit job</SheetTitle>
            <SheetDescription>Job not loaded yet.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit job</SheetTitle>
          <SheetDescription>Update job details. Salary must be valid and skills cannot be empty.</SheetDescription>
        </SheetHeader>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget as HTMLFormElement);

            const title = String(form.get("title") || "").trim();
            const location = String(form.get("location") || "").trim();
            const type = String(form.get("type") || "").trim();
            const experience = String(form.get("experience") || "").trim();
            const description = String(form.get("description") || "").trim();

            const salaryMin = asNumberOrNull(String(form.get("salaryMin") ?? "").trim());
            const salaryMax = asNumberOrNull(String(form.get("salaryMax") ?? "").trim());
            const minAiScoreRaw = String(form.get("minAiScore") ?? "").trim();
            const minAiScore = minAiScoreRaw === "" ? null : asNumberOrNull(minAiScoreRaw);
            const status = String(form.get("status") || "").trim();

            const skillsRaw = String(form.get("skills") || "");
            const skills = skillsRaw
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            const requirementsRaw = String(form.get("requirements") || "");
            const requirements = requirementsRaw
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);

            if (!skills.length) {
              toast({ variant: "destructive", title: "Validation", description: "Please add at least 1 skill." });
              return;
            }
            if (salaryMin == null || salaryMax == null || salaryMin < 0 || salaryMax < 0 || salaryMax < salaryMin) {
              toast({ variant: "destructive", title: "Validation", description: "Invalid salary range." });
              return;
            }
            if (minAiScore != null && (minAiScore < 0 || minAiScore > 100)) {
              toast({ variant: "destructive", title: "Validation", description: "Min AI score must be 0..100" });
              return;
            }

            setSaving(true);
            try {
              await onSave({
                title,
                location,
                type,
                experience,
                description,
                salaryMin,
                salaryMax,
                requirements,
                skills,
                minAiScore,
                status,
              });
              toast({ title: "Updated", description: "Job updated" });
              onOpenChange(false);
            } catch (err: any) {
              toast({ variant: "destructive", title: "Error", description: err?.message || "Failed to update" });
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input name="title" id="title" defaultValue={job.title || ""} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="location">Location</Label>
              <Input name="location" id="location" defaultValue={job.location || ""} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="type">Type</Label>
              <select
                name="type"
                id="type"
                defaultValue={job.type || ""}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {jobTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="salaryMin">Salary Min</Label>
              <Input name="salaryMin" id="salaryMin" type="number" min={0} defaultValue={String(job.salaryMin ?? "")} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="salaryMax">Salary Max</Label>
              <Input name="salaryMax" id="salaryMax" type="number" min={0} defaultValue={String(job.salaryMax ?? "")} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="minAiScore">Min AI Score</Label>
              <Input name="minAiScore" id="minAiScore" type="number" min={0} max={100} defaultValue={job.minAiScore ?? ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <select
                name="status"
                id="status"
                defaultValue={job.status || "active"}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="active">active</option>
                <option value="paused">paused</option>
                <option value="closed">closed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="experience">Experience</Label>
            <Input name="experience" id="experience" defaultValue={job.experience || ""} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input name="skills" id="skills" defaultValue={Array.isArray(job.skills) ? job.skills.join(", ") : ""} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea
              name="requirements"
              id="requirements"
              defaultValue={Array.isArray(job.requirements) ? job.requirements.join("\n") : ""}
              className="min-h-[110px]"
              placeholder="e.g.\nGood communication\nTeam player\nProblem solving"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea name="description" id="description" defaultValue={job.description || ""} className="min-h-[140px]" required />
          </div>

          <div className="pt-2 flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Link to={`/recruiter/candidates?job=${job.id || ""}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                <Calendar className="h-4 w-4" />
                View candidates
              </Button>
            </Link>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
