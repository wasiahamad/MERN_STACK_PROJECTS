import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Edit2,
  Plus,
  Trash2,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  CheckCircle,
  Wallet,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";

export default function Profile() {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "experience" | "education" | "skills">("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl md:text-6xl">
                  {user?.avatar}
                </div>
                <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold">{user?.name}</h1>
                    <p className="text-muted-foreground text-lg">Senior Frontend Developer</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {user?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        San Francisco, CA
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet className="h-4 w-4" />
                        {user?.walletAddress}
                      </span>
                    </div>
                  </div>
                  <GradientButton onClick={() => setEditMode(!editMode)}>
                    <Edit2 className="h-4 w-4" />
                    {editMode ? "Save Changes" : "Edit Profile"}
                  </GradientButton>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold gradient-text">{user?.aiScore}</p>
                    <p className="text-xs text-muted-foreground">AI Score</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold text-success">{user?.reputation}</p>
                    <p className="text-xs text-muted-foreground">Reputation</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">{user?.certificates?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Certificates</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">5+</p>
                    <p className="text-xs text-muted-foreground">Years Exp</p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mt-6">
                  <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <Globe className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* About */}
            <StaggerItem>
              <GlassCard className="p-6">
                <h3 className="font-display text-lg font-semibold mb-4">About Me</h3>
                {editMode ? (
                  <Textarea
                    placeholder="Tell us about yourself..."
                    className="min-h-[150px]"
                    defaultValue="Passionate full-stack developer with 5+ years of experience in building scalable web applications. Specialized in React, Node.js, and blockchain technologies. Love creating intuitive user experiences and solving complex problems."
                  />
                ) : (
                  <p className="text-muted-foreground">
                    Passionate full-stack developer with 5+ years of experience in building scalable web applications. Specialized in React, Node.js, and blockchain technologies. Love creating intuitive user experiences and solving complex problems.
                  </p>
                )}
              </GlassCard>
            </StaggerItem>

            {/* Top Skills */}
            <StaggerItem>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">Top Skills</h3>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="space-y-4">
                  {user?.skills?.slice(0, 5).map((skill) => (
                    <div key={skill.name} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            {skill.verified && (
                              <CheckCircle className="h-4 w-4 text-success" />
                            )}
                            <span className="text-xs text-muted-foreground">{skill.level}%</span>
                          </div>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </StaggerItem>

            {/* Recent Certificates */}
            <StaggerItem className="lg:col-span-2">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">Certificates</h3>
                  <a href="/certificates" className="text-primary text-sm hover:underline">
                    View All
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {user?.certificates?.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{cert.image}</span>
                        {cert.nftMinted && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            NFT
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-sm">{cert.name}</h4>
                      <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cert.date}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </StaggerItem>
          </StaggerContainer>
        )}

        {activeTab === "experience" && (
          <StaggerContainer className="space-y-4">
            <div className="flex justify-end">
              <GradientButton size="sm">
                <Plus className="h-4 w-4" />
                Add Experience
              </GradientButton>
            </div>
            {user?.experience?.map((exp) => (
              <StaggerItem key={exp.id}>
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{exp.title}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {exp.location}
                          <span className="mx-2">•</span>
                          {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                        </div>
                        <p className="mt-3 text-muted-foreground">{exp.description}</p>
                      </div>
                    </div>
                    {editMode && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {activeTab === "education" && (
          <StaggerContainer className="space-y-4">
            <div className="flex justify-end">
              <GradientButton size="sm">
                <Plus className="h-4 w-4" />
                Add Education
              </GradientButton>
            </div>
            {user?.education?.map((edu) => (
              <StaggerItem key={edu.id}>
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-muted-foreground">{edu.institution}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>Class of {edu.year}</span>
                          {edu.gpa && (
                            <>
                              <span className="mx-2">•</span>
                              <span>GPA: {edu.gpa}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {activeTab === "skills" && (
          <StaggerContainer className="space-y-4">
            <div className="flex justify-end">
              <GradientButton size="sm">
                <Plus className="h-4 w-4" />
                Add Skill
              </GradientButton>
            </div>
            <StaggerItem>
              <GlassCard className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user?.skills?.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{skill.name}</span>
                            {skill.verified && (
                              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-3" />
                      </div>
                      {editMode && (
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </StaggerItem>
          </StaggerContainer>
        )}
      </div>
    </DashboardLayout>
  );
}
