import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building,
  MapPin,
  Globe,
  Users,
  Calendar,
  Edit2,
  Save,
  Shield,
  Briefcase,
  Star,
  CheckCircle,
  Upload,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockCompanies, mockJobs } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

export default function CompanyProfile() {
  const [editMode, setEditMode] = useState(false);
  const company = mockCompanies[0]; // Using first company as demo

  const handleSave = () => {
    setEditMode(false);
    toast({
      title: "Company Profile Updated!",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="relative">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl md:text-6xl">
                  {company.logo}
                </div>
                {editMode && (
                  <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Upload className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    {editMode ? (
                      <Input defaultValue={company.name} className="font-display text-2xl font-bold h-auto text-foreground" />
                    ) : (
                      <div className="flex items-center gap-3">
                        <h1 className="font-display text-2xl md:text-3xl font-bold">{company.name}</h1>
                        {company.verified && (
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="text-lg text-muted-foreground mt-1">{company.industry}</p>
                  </div>
                  <GradientButton onClick={editMode ? handleSave : () => setEditMode(true)}>
                    {editMode ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                    {editMode ? "Save Changes" : "Edit Profile"}
                  </GradientButton>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield className="h-4 w-4 text-success" />
                    </div>
                    <p className="text-2xl font-bold text-success">{company.trustScore}%</p>
                    <p className="text-xs text-muted-foreground">Trust Score</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">{company.openJobs}</p>
                    <p className="text-xs text-muted-foreground">Open Jobs</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">234</p>
                    <p className="text-xs text-muted-foreground">Total Hires</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {company.size}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {company.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <a href={company.website} className="text-primary hover:underline">
                      {company.website}
                    </a>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Founded {company.founded}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">About the Company</h2>
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <Label>Company Description</Label>
                    <Textarea
                      defaultValue={company.description}
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Industry</Label>
                      <Input defaultValue={company.industry} className="mt-1" />
                    </div>
                    <div>
                      <Label>Company Size</Label>
                      <Input defaultValue={company.size} className="mt-1" />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input defaultValue={company.location} className="mt-1" />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input defaultValue={company.website} className="mt-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{company.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p className="font-medium">{company.industry}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Company Size</p>
                      <p className="font-medium">{company.size}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{company.location}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Founded</p>
                      <p className="font-medium">{company.founded}</p>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Trust Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">DAO Trust Score</h2>
              <div className="relative h-40 w-40 mx-auto mb-4">
                <svg className="h-40 w-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#trustGradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${company.trustScore * 4.4} 440`}
                  />
                  <defs>
                    <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(152, 70%, 45%)" />
                      <stop offset="100%" stopColor="hsl(172, 70%, 45%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="font-display text-4xl font-bold text-success">{company.trustScore}</span>
                    <p className="text-xs text-muted-foreground">out of 100</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Response Rate", value: 98 },
                  { label: "Hiring Success", value: 95 },
                  { label: "Candidate Rating", value: 92 },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="font-medium">{metric.value}%</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Verified by DAO governance
              </p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Active Job Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold">Active Job Posts</h2>
              <Badge>{company.openJobs} Open</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {job.logo}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{job.title}</h3>
                      <p className="text-xs text-muted-foreground">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {job.applicants} applicants
                    </span>
                    <span>{job.posted}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
