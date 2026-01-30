import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  X,
  Briefcase,
  MapPin,
  IndianRupee,
  Clock,
  Award,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useCreateRecruiterJob } from "@/lib/apiHooks";

const jobTypes = ["Full-time", "Part-time", "Contract", "Remote"];
const commonSkills = [
  "React", "TypeScript", "Node.js", "Python", "Solidity", "Web3.js",
  "AWS", "Docker", "Kubernetes", "MongoDB", "PostgreSQL", "GraphQL",
];

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newCert, setNewCert] = useState("");
  const createJob = useCreateRecruiterJob();

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addCertificate = () => {
    if (newCert && !certificates.includes(newCert)) {
      setCertificates([...certificates, newCert]);
    }
    setNewCert("");
  };

  const removeCertificate = (cert: string) => {
    setCertificates(certificates.filter((c) => c !== cert));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget as HTMLFormElement);

    const title = String(form.get("title") || "").trim();
    const location = String(form.get("location") || "").trim();
    const type = String(form.get("type") || "").trim();
    const salaryMinRaw = String(form.get("salaryMin") ?? "").trim();
    const salaryMaxRaw = String(form.get("salaryMax") ?? "").trim();
    const salaryMin = salaryMinRaw ? Number(salaryMinRaw) : NaN;
    const salaryMax = salaryMaxRaw ? Number(salaryMaxRaw) : NaN;
    const experience = String(form.get("experience") || "").trim();
    const description = String(form.get("description") || "").trim();
    const minAiScoreRaw = String(form.get("minAiScore") || "").trim();
    const minAiScore = minAiScoreRaw ? Number(minAiScoreRaw) : null;

    try {
      if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin < 0 || salaryMax < 0 || salaryMax < salaryMin) {
        toast({
          variant: "destructive",
          title: "Invalid salary range",
          description: "Please enter a valid min and max salary.",
        });
        return;
      }

      await createJob.mutateAsync({
        title,
        location,
        type,
        salaryMin,
        salaryMax,
        experience,
        description,
        skills,
        minAiScore,
        requiredCertificates: certificates,
      });

      toast({
        title: "Job Posted Successfully!",
        description: "Your job listing is now live and visible to candidates.",
      });
      navigate("/recruiter/jobs");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to post job",
        description: error?.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Create <span className="gradient-text">New Job</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details to post a new job listing
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input name="title" id="title" placeholder="e.g., Senior Blockchain Developer" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input name="location" id="location" placeholder="e.g., San Francisco, CA or Remote" className="pl-10" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Job Type *</Label>
                  <select
                    name="type"
                    id="type"
                    className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select type</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="salaryMin">Salary Range *</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="relative flex-1">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input name="salaryMin" id="salaryMin" type="number" min={0} placeholder="Min" className="pl-10" required />
                    </div>
                    <span className="flex items-center text-muted-foreground">-</span>
                    <div className="relative flex-1">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input name="salaryMax" id="salaryMax" type="number" min={0} placeholder="Max" className="pl-10" required />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="experience">Experience Required</Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input name="experience" id="experience" placeholder="e.g., 3-5 years" className="pl-10" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Job Description *</h2>
              <Textarea
                name="description"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                className="min-h-[200px]"
                required
              />
            </GlassCard>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Required Skills *</h2>

              {/* Selected Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill) => (
                  <Badge key={skill} className="gradient-primary text-primary-foreground pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 p-0.5 rounded-full hover:bg-white/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Add Skill */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
                />
                <Button type="button" variant="outline" onClick={() => addSkill(newSkill)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Common Skills */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Popular skills:</p>
                <div className="flex flex-wrap gap-2">
                  {commonSkills.filter((s) => !skills.includes(s)).slice(0, 8).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="px-3 py-1 rounded-full border border-border text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* AI & Blockchain Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI & Blockchain Requirements
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="minAiScore">Minimum AI Score</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Only candidates with this score or higher will be prioritized
                  </p>
                  <Input
                    name="minAiScore"
                    id="minAiScore"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 75"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Required NFT Certificates</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Candidates must have these verified certificates
                  </p>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {certificates.map((cert) => (
                      <Badge key={cert} variant="outline" className="bg-primary/10 text-primary border-primary/20 pr-1">
                        <Award className="h-3 w-3 mr-1" />
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeCertificate(cert)}
                          className="ml-2 p-0.5 rounded-full hover:bg-primary/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., AWS Solutions Architect"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertificate())}
                    />
                    <Button type="button" variant="outline" onClick={addCertificate}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end gap-4"
          >
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <GradientButton type="submit" loading={loading}>
              {loading ? "Publishing..." : "Publish Job"}
            </GradientButton>
          </motion.div>
        </form>
      </div>
    </DashboardLayout>
  );
}
