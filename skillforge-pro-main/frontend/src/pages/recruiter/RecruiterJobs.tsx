import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Users,
  Eye,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { CardSkeleton } from "@/components/ui/skeleton-loader";
import { toast } from "@/hooks/use-toast";
import { useDeleteRecruiterJob, useRecruiterJobs } from "@/lib/apiHooks";
import { formatInrRange } from "@/lib/formatters";

const statusOptions = [
  { id: "all", label: "All Jobs" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "closed", label: "Closed" },
];

type RecruiterJob = {
  id: string;
  title: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  skills?: string[];
  status: "active" | "paused" | "closed";
  applicantsCount?: number;
  companyName?: string;
  companyLogo?: string;
  createdAt?: string;
};

function formatSalary(min?: number, max?: number) {
  return formatInrRange(min ?? null, max ?? null);
}

export default function RecruiterJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError } = useRecruiterJobs({
    search: searchQuery || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 50,
  });
  const deleteJob = useDeleteRecruiterJob();

  const jobs = useMemo(() => {
    const items = (data?.items || []) as RecruiterJob[];
    return items;
  }, [data?.items]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Manage <span className="gradient-text">Job Posts</span>
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage your job listings</p>
          </div>
          <Link to="/recruiter/jobs/new">
            <GradientButton>
              <Plus className="h-4 w-4" />
              Post New Job
            </GradientButton>
          </Link>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard hover={false} className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setStatusFilter(status.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      statusFilter === status.id
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-muted-foreground">Failed to load jobs.</p>
          </motion.div>
        ) : jobs.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onDelete={() => {
                  deleteJob.mutate(job.id, {
                    onSuccess: () => toast({ title: "Deleted", description: "Job deleted" }),
                    onError: (err: any) =>
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: err?.message || "Failed to delete job",
                      }),
                  });
                }}
              />
            ))}
          </StaggerContainer>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            <Link to="/recruiter/jobs/new">
              <GradientButton className="mt-4">
                <Plus className="h-4 w-4" />
                Create Your First Job
              </GradientButton>
            </Link>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

function JobCard({ job, onDelete }: { job: RecruiterJob; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusConfig = {
    active: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
    paused: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
    closed: { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted" },
  };

  const status = statusConfig[job.status];

  const logoSrc = (() => {
    const a = (job.companyLogo || "").trim();
    if (a.startsWith("http://") || a.startsWith("https://") || a.startsWith("/uploads")) return a;
    return "";
  })();

  const logoFallback = (() => {
    const name = (job.companyName || job.title || "").trim();
    return name ? name.slice(0, 1).toUpperCase() : "🏢";
  })();

  return (
    <StaggerItem>
      <GlassCard className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center text-2xl">
              {logoSrc ? <img src={logoSrc} alt="Logo" className="h-full w-full object-cover" /> : logoFallback}
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg}`}>
              <status.icon className={`h-3 w-3 ${status.color}`} />
              <span className={`text-xs capitalize ${status.color}`}>{job.status}</span>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-muted">
              <MoreVertical className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-lg z-10">
                <button
                  onClick={() => toast({ title: "Coming soon", description: "Edit job will be added next" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => toast({ title: "Coming soon", description: "Duplicate job will be added next" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-display font-semibold text-lg mb-1">{job.title}</h3>
        <p className="text-sm text-muted-foreground mb-1">
          {job.location} • {job.type}
        </p>
        {formatSalary(job.salaryMin, job.salaryMax) ? (
          <p className="text-xs text-muted-foreground mb-4">{formatSalary(job.salaryMin, job.salaryMax)}</p>
        ) : (
          <div className="mb-4" />
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {(job.skills || []).slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {(job.skills || []).length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{(job.skills || []).length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {job.applicantsCount || 0} applicants
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            — views
          </span>
        </div>

        <div className="flex gap-2">
          <Link to={`/recruiter/candidates?job=${job.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Applicants
            </Button>
          </Link>
          <Link to={`/jobs/${job.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </GlassCard>
    </StaggerItem>
  );
}
// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Plus,
//   Search,
//   Users,
//   Eye,
//   MoreVertical,
//   Edit2,
//   Trash2,
//   Copy,
//   CheckCircle,
//   Clock,
//   AlertCircle,
// } from "lucide-react";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";
// import { GlassCard } from "@/components/ui/glass-card";
// import { GradientButton } from "@/components/ui/gradient-button";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
// import { mockJobs, Job } from "@/data/mockData";

// const statusOptions = [
//   { id: "all", label: "All Jobs" },
//   { id: "active", label: "Active" },
//   { id: "paused", label: "Paused" },
//   { id: "closed", label: "Closed" },
// ];

// export default function RecruiterJobs() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   // Simulate job statuses
//   const jobsWithStatus = mockJobs.map((job, index) => ({
//     ...job,
//     status: index === 0 ? "active" : index === 1 ? "active" : index === 2 ? "paused" : "active",
//   }));

//   const filteredJobs = jobsWithStatus.filter((job) => {
//     const matchesSearch =
//       job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       job.company.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesStatus = statusFilter === "all" || job.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex flex-col md:flex-row md:items-center justify-between gap-4"
//         >
//           <div>
//             <h1 className="font-display text-2xl md:text-3xl font-bold">
//               Manage <span className="gradient-text">Job Posts</span>
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Create and manage your job listings
//             </p>
//           </div>
//           <Link to="/recruiter/jobs/new">
//             <GradientButton>
//               <Plus className="h-4 w-4" />
//               Post New Job
//             </GradientButton>
//           </Link>
//         </motion.div>

//         {/* Search & Filters */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           <GlassCard hover={false} className="p-4">
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//                 <Input
//                   placeholder="Search jobs..."
//                   className="pl-10"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {statusOptions.map((status) => (
//                   <button
//                     key={status.id}
//                     onClick={() => setStatusFilter(status.id)}
//                     className={`px-4 py-2 rounded-full text-sm transition-all ${
//                       statusFilter === status.id
//                         ? "gradient-primary text-primary-foreground"
//                         : "bg-muted text-muted-foreground hover:bg-muted/80"
//                     }`}
//                   >
//                     {status.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </GlassCard>
//         </motion.div>

//         {/* Jobs Grid */}
//         <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredJobs.map((job) => (
//             <JobCard key={job.id} job={job} />
//           ))}
//         </StaggerContainer>

//         {filteredJobs.length === 0 && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
//             <p className="text-muted-foreground">No jobs found matching your criteria.</p>
//             <Link to="/recruiter/jobs/new">
//               <GradientButton className="mt-4">
//                 <Plus className="h-4 w-4" />
//                 Create Your First Job
//               </GradientButton>
//             </Link>
//           </motion.div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }

// function JobCard({ job }: { job: Job & { status: string } }) {
//   const [menuOpen, setMenuOpen] = useState(false);

//   const statusConfig = {
//     active: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
//     paused: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
//     closed: { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted" },
//   };

//   const status = statusConfig[job.status as keyof typeof statusConfig];

//   return (
//     <StaggerItem>
//       <GlassCard className="p-5">
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex items-center gap-3">
//             <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
//               {job.logo}
//             </div>
//             <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg}`}>
//               <status.icon className={`h-3 w-3 ${status.color}`} />
//               <span className={`text-xs capitalize ${status.color}`}>{job.status}</span>
//             </div>
//           </div>
//           <div className="relative">
//             <button
//               onClick={() => setMenuOpen(!menuOpen)}
//               className="p-2 rounded-lg hover:bg-muted"
//             >
//               <MoreVertical className="h-5 w-5" />
//             </button>
//             {menuOpen && (
//               <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-lg z-10">
//                 <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
//                   <Edit2 className="h-4 w-4" />
//                   Edit
//                 </button>
//                 <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
//                   <Copy className="h-4 w-4" />
//                   Duplicate
//                 </button>
//                 <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-destructive">
//                   <Trash2 className="h-4 w-4" />
//                   Delete
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <h3 className="font-display font-semibold text-lg mb-1">{job.title}</h3>
//         <p className="text-sm text-muted-foreground mb-4">{job.location} • {job.type}</p>

//         <div className="flex flex-wrap gap-2 mb-4">
//           {job.skills.slice(0, 3).map((skill) => (
//             <Badge key={skill} variant="outline" className="text-xs">
//               {skill}
//             </Badge>
//           ))}
//           {job.skills.length > 3 && (
//             <Badge variant="outline" className="text-xs">
//               +{job.skills.length - 3}
//             </Badge>
//           )}
//         </div>

//         <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
//           <span className="flex items-center gap-1">
//             <Users className="h-4 w-4" />
//             {job.applicants} applicants
//           </span>
//           <span className="flex items-center gap-1">
//             <Eye className="h-4 w-4" />
//             {job.views} views
//           </span>
//         </div>

//         <div className="flex gap-2">
//           <Link to={`/recruiter/candidates?job=${job.id}`} className="flex-1">
//             <Button variant="outline" size="sm" className="w-full">
//               View Applicants
//             </Button>
//           </Link>
//           <Link to={`/jobs/${job.id}`}>
//             <Button variant="ghost" size="sm">
//               <Eye className="h-4 w-4" />
//             </Button>
//           </Link>
//         </div>
//       </GlassCard>
//     </StaggerItem>
//   );
// }
