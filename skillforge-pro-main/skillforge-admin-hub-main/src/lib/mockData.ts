// Mock data for SkillForge Pro dashboard

export const dashboardStats = [
  { id: "users", label: "Total Users", value: "24,891", change: "+12.5%", trend: "up" as const, icon: "Users", gradient: "gradient-card-1" },
  { id: "recruiters", label: "Total Recruiters", value: "1,247", change: "+8.3%", trend: "up" as const, icon: "Briefcase", gradient: "gradient-card-2" },
  { id: "tests", label: "Skill Tests Taken", value: "89,432", change: "+23.1%", trend: "up" as const, icon: "ClipboardCheck", gradient: "gradient-card-3" },
  { id: "verified", label: "Verified Skills", value: "42,156", change: "+15.7%", trend: "up" as const, icon: "ShieldCheck", gradient: "gradient-card-4" },
  { id: "revenue", label: "Revenue Generated", value: "₹27,45,000", change: "+31.2%", trend: "up" as const, icon: "DollarSign", gradient: "gradient-card-5" },
];

export const monthlyRegistrations = [
  { month: "Jan", users: 1200 }, { month: "Feb", users: 1900 }, { month: "Mar", users: 2400 },
  { month: "Apr", users: 2100 }, { month: "May", users: 2800 }, { month: "Jun", users: 3200 },
  { month: "Jul", users: 3800 }, { month: "Aug", users: 4100 }, { month: "Sep", users: 3900 },
  { month: "Oct", users: 4500 }, { month: "Nov", users: 5200 }, { month: "Dec", users: 5800 },
];

export const skillsVerification = [
  { skill: "React", verified: 4200, pending: 800 }, { skill: "Python", verified: 3800, pending: 650 },
  { skill: "AWS", verified: 2900, pending: 420 }, { skill: "TypeScript", verified: 3500, pending: 550 },
  { skill: "Node.js", verified: 3100, pending: 480 }, { skill: "ML/AI", verified: 2200, pending: 380 },
];

export const verificationRatio = [
  { name: "Verified", value: 42156, fill: "hsl(200, 95%, 55%)" },
  { name: "Pending", value: 12340, fill: "hsl(38, 92%, 50%)" },
  { name: "Failed", value: 8920, fill: "hsl(0, 72%, 51%)" },
];

export const revenueData = [
  { month: "Jan", revenue: 18000 }, { month: "Feb", revenue: 22000 }, { month: "Mar", revenue: 25000 },
  { month: "Apr", revenue: 28000 }, { month: "May", revenue: 32000 }, { month: "Jun", revenue: 35000 },
  { month: "Jul", revenue: 38000 }, { month: "Aug", revenue: 42000 }, { month: "Sep", revenue: 39000 },
  { month: "Oct", revenue: 45000 }, { month: "Nov", revenue: 52000 }, { month: "Dec", revenue: 58000 },
];

export const usersTableData = [
  { id: 1, name: "Sarah Chen", email: "sarah@example.com", skillsVerified: 12, accuracy: 94, status: "active", phone: "+1-555-0101", joinedAt: "2023-06-15", location: "San Francisco, CA", bio: "Full-stack developer with 5+ years of experience in React and Node.js", topSkills: ["React", "TypeScript", "Node.js"], assessmentsTaken: 18, rank: "Gold" },
  { id: 2, name: "James Wilson", email: "james@example.com", skillsVerified: 8, accuracy: 87, status: "active", phone: "+1-555-0102", joinedAt: "2023-08-22", location: "New York, NY", bio: "Backend engineer specializing in Python and cloud infrastructure", topSkills: ["Python", "AWS", "Docker"], assessmentsTaken: 12, rank: "Silver" },
  { id: 3, name: "Maria Garcia", email: "maria@example.com", skillsVerified: 15, accuracy: 96, status: "active", phone: "+1-555-0103", joinedAt: "2023-04-10", location: "Austin, TX", bio: "Senior software architect with expertise in distributed systems", topSkills: ["AWS", "Kubernetes", "Python"], assessmentsTaken: 22, rank: "Platinum" },
  { id: 4, name: "Alex Kumar", email: "alex@example.com", skillsVerified: 6, accuracy: 78, status: "suspended", phone: "+1-555-0104", joinedAt: "2023-11-05", location: "Seattle, WA", bio: "Junior developer learning modern web technologies", topSkills: ["React", "JavaScript"], assessmentsTaken: 8, rank: "Bronze" },
  { id: 5, name: "Emily Park", email: "emily@example.com", skillsVerified: 10, accuracy: 91, status: "active", phone: "+1-555-0105", joinedAt: "2023-07-20", location: "Chicago, IL", bio: "Data scientist with strong ML/AI background", topSkills: ["ML/AI", "Python", "TypeScript"], assessmentsTaken: 14, rank: "Gold" },
  { id: 6, name: "David Liu", email: "david@example.com", skillsVerified: 9, accuracy: 85, status: "active", phone: "+1-555-0106", joinedAt: "2023-09-12", location: "Boston, MA", bio: "DevOps engineer focused on CI/CD and containerization", topSkills: ["Docker", "Kubernetes", "AWS"], assessmentsTaken: 11, rank: "Silver" },
  { id: 7, name: "Priya Patel", email: "priya@example.com", skillsVerified: 14, accuracy: 93, status: "active", phone: "+1-555-0107", joinedAt: "2023-05-18", location: "Denver, CO", bio: "Frontend architect with deep React ecosystem knowledge", topSkills: ["React", "TypeScript", "Node.js"], assessmentsTaken: 20, rank: "Gold" },
  { id: 8, name: "Tom Brown", email: "tom@example.com", skillsVerified: 3, accuracy: 65, status: "suspended", phone: "+1-555-0108", joinedAt: "2024-01-02", location: "Portland, OR", bio: "Beginner developer exploring web technologies", topSkills: ["JavaScript"], assessmentsTaken: 5, rank: "Bronze" },
];

export const recruitersTableData = [
  { id: 1, company: "TechCorp", activeJobs: 24, hires: 156, status: "active", contactName: "John Smith", email: "john@techcorp.com", phone: "+1-555-1001", location: "San Francisco, CA", joinedAt: "2023-03-15", industry: "Technology", employees: "500-1000", website: "techcorp.com", description: "Leading enterprise software solutions provider" },
  { id: 2, company: "InnovateLab", activeJobs: 18, hires: 89, status: "active", contactName: "Lisa Wong", email: "lisa@innovatelab.com", phone: "+1-555-1002", location: "New York, NY", joinedAt: "2023-05-20", industry: "AI/ML", employees: "100-500", website: "innovatelab.io", description: "AI startup focused on natural language processing" },
  { id: 3, company: "DataStream", activeJobs: 31, hires: 234, status: "active", contactName: "Mark Johnson", email: "mark@datastream.com", phone: "+1-555-1003", location: "Austin, TX", joinedAt: "2023-02-10", industry: "Data Analytics", employees: "1000-5000", website: "datastream.com", description: "Big data analytics and cloud infrastructure company" },
  { id: 4, company: "CloudNine", activeJobs: 12, hires: 67, status: "inactive", contactName: "Emma Davis", email: "emma@cloudnine.com", phone: "+1-555-1004", location: "Seattle, WA", joinedAt: "2023-07-08", industry: "Cloud Computing", employees: "50-100", website: "cloudnine.dev", description: "Cloud-native solutions and consulting services" },
  { id: 5, company: "AI Solutions", activeJobs: 42, hires: 312, status: "active", contactName: "Robert Chen", email: "robert@aisolutions.com", phone: "+1-555-1005", location: "Boston, MA", joinedAt: "2023-01-25", industry: "AI/ML", employees: "1000-5000", website: "aisolutions.ai", description: "Enterprise AI platform and services" },
];

export const notifications = [
  { id: 1, title: "New user registered", message: "Sarah Chen just signed up", time: "2 min ago", read: false, type: "user" as const },
  { id: 2, title: "Skill test completed", message: "James Wilson passed React Advanced", time: "15 min ago", read: false, type: "test" as const },
  { id: 3, title: "NFT minted", message: "Certificate #4521 minted successfully", time: "1 hr ago", read: false, type: "nft" as const },
  { id: 4, title: "Cheat attempt detected", message: "Suspicious activity on Assessment #892", time: "2 hrs ago", read: true, type: "alert" as const },
  { id: 5, title: "Revenue milestone", message: "Monthly revenue exceeded $50k", time: "5 hrs ago", read: true, type: "revenue" as const },
  { id: 6, title: "New recruiter onboarded", message: "AI Solutions joined the platform", time: "1 day ago", read: true, type: "user" as const },
];

export const skillsData = [
  { id: 1, name: "React", category: "Frontend", tests: 4200, verified: 3800, passRate: 90, status: "active", price: 49, originalPrice: 79, hasOffer: true, offerLabel: "38% OFF", description: "Master React with hooks, context, and advanced patterns" },
  { id: 2, name: "Python", category: "Backend", tests: 3800, verified: 3200, passRate: 84, status: "active", price: 59, originalPrice: 59, hasOffer: false, offerLabel: "", description: "Learn Python from basics to advanced including Django and Flask" },
  { id: 3, name: "AWS", category: "Cloud", tests: 2900, verified: 2400, passRate: 83, status: "active", price: 99, originalPrice: 149, hasOffer: true, offerLabel: "33% OFF", description: "AWS cloud services, architecture, and deployment" },
  { id: 4, name: "TypeScript", category: "Frontend", tests: 3500, verified: 3100, passRate: 89, status: "active", price: 39, originalPrice: 39, hasOffer: false, offerLabel: "", description: "Type-safe JavaScript development with TypeScript" },
  { id: 5, name: "Node.js", category: "Backend", tests: 3100, verified: 2700, passRate: 87, status: "active", price: 49, originalPrice: 49, hasOffer: false, offerLabel: "", description: "Server-side JavaScript with Express and APIs" },
  { id: 6, name: "ML/AI", category: "Data Science", tests: 2200, verified: 1800, passRate: 82, status: "active", price: 129, originalPrice: 199, hasOffer: true, offerLabel: "35% OFF", description: "Machine learning, deep learning, and AI fundamentals" },
  { id: 7, name: "Docker", category: "DevOps", tests: 1800, verified: 1500, passRate: 83, status: "active", price: 39, originalPrice: 39, hasOffer: false, offerLabel: "", description: "Containerization and Docker orchestration" },
  { id: 8, name: "Kubernetes", category: "DevOps", tests: 1200, verified: 950, passRate: 79, status: "inactive", price: 79, originalPrice: 79, hasOffer: false, offerLabel: "", description: "Container orchestration at scale with K8s" },
];

export const assessmentsData = [
  { id: 1, name: "React Advanced", skill: "React", questions: 40, passPercent: 75, retakeLimit: 3, difficulty: { easy: 20, medium: 50, hard: 30 }, cheats: 12, status: "active", createdBy: "manual" as const, totalParticipants: 342, participants: [
    { userId: 1, name: "Sarah Chen", score: 92, rank: 1, completedAt: "2024-01-10" },
    { userId: 3, name: "Maria Garcia", score: 88, rank: 2, completedAt: "2024-01-11" },
    { userId: 7, name: "Priya Patel", score: 85, rank: 3, completedAt: "2024-01-09" },
    { userId: 5, name: "Emily Park", score: 78, rank: 4, completedAt: "2024-01-12" },
    { userId: 6, name: "David Liu", score: 72, rank: 5, completedAt: "2024-01-13" },
  ], questionsList: [
    { qId: 1, question: "What is the difference between useEffect and useLayoutEffect?", type: "MCQ", difficulty: "hard" },
    { qId: 2, question: "Explain React reconciliation algorithm.", type: "Descriptive", difficulty: "hard" },
    { qId: 3, question: "What are React Portals and when would you use them?", type: "MCQ", difficulty: "medium" },
    { qId: 4, question: "How does React.memo differ from useMemo?", type: "MCQ", difficulty: "medium" },
    { qId: 5, question: "What is the purpose of useCallback hook?", type: "MCQ", difficulty: "easy" },
    { qId: 6, question: "How do you handle error boundaries in React?", type: "MCQ", difficulty: "medium" },
    { qId: 7, question: "Explain the Context API and its limitations.", type: "Descriptive", difficulty: "medium" },
    { qId: 8, question: "What is Suspense and how does it work with lazy loading?", type: "MCQ", difficulty: "hard" },
  ]},
  { id: 2, name: "Python Fundamentals", skill: "Python", questions: 30, passPercent: 70, retakeLimit: 5, difficulty: { easy: 40, medium: 40, hard: 20 }, cheats: 8, status: "active", createdBy: "AI" as const, totalParticipants: 518, participants: [
    { userId: 2, name: "James Wilson", score: 95, rank: 1, completedAt: "2024-01-08" },
    { userId: 5, name: "Emily Park", score: 90, rank: 2, completedAt: "2024-01-09" },
    { userId: 3, name: "Maria Garcia", score: 87, rank: 3, completedAt: "2024-01-10" },
  ], questionsList: [
    { qId: 1, question: "Python me list aur tuple me kya fark hai?", type: "MCQ", difficulty: "easy" },
    { qId: 2, question: "Explain decorators in Python with an example.", type: "Descriptive", difficulty: "medium" },
    { qId: 3, question: "What are generators and how do they differ from iterators?", type: "MCQ", difficulty: "medium" },
    { qId: 4, question: "Explain the GIL (Global Interpreter Lock) in Python.", type: "MCQ", difficulty: "hard" },
    { qId: 5, question: "How does memory management work in Python?", type: "Descriptive", difficulty: "hard" },
  ]},
  { id: 3, name: "AWS Solutions Architect", skill: "AWS", questions: 50, passPercent: 80, retakeLimit: 2, difficulty: { easy: 10, medium: 40, hard: 50 }, cheats: 3, status: "active", createdBy: "manual" as const, totalParticipants: 189, participants: [
    { userId: 3, name: "Maria Garcia", score: 96, rank: 1, completedAt: "2024-01-07" },
    { userId: 6, name: "David Liu", score: 82, rank: 2, completedAt: "2024-01-11" },
  ], questionsList: [
    { qId: 1, question: "What is the AWS Shared Responsibility Model?", type: "MCQ", difficulty: "easy" },
    { qId: 2, question: "Explain the difference between S3 storage classes.", type: "MCQ", difficulty: "medium" },
    { qId: 3, question: "Design a highly available architecture on AWS.", type: "Descriptive", difficulty: "hard" },
    { qId: 4, question: "How do you implement auto-scaling in AWS?", type: "MCQ", difficulty: "medium" },
  ]},
  { id: 4, name: "TypeScript Pro", skill: "TypeScript", questions: 35, passPercent: 72, retakeLimit: 3, difficulty: { easy: 25, medium: 50, hard: 25 }, cheats: 5, status: "active", createdBy: "AI" as const, totalParticipants: 276, participants: [
    { userId: 7, name: "Priya Patel", score: 91, rank: 1, completedAt: "2024-01-06" },
    { userId: 1, name: "Sarah Chen", score: 88, rank: 2, completedAt: "2024-01-08" },
    { userId: 2, name: "James Wilson", score: 80, rank: 3, completedAt: "2024-01-10" },
    { userId: 4, name: "Alex Kumar", score: 68, rank: 4, completedAt: "2024-01-12" },
  ], questionsList: [
    { qId: 1, question: "What are TypeScript utility types? Give examples.", type: "MCQ", difficulty: "medium" },
    { qId: 2, question: "Explain conditional types in TypeScript.", type: "Descriptive", difficulty: "hard" },
    { qId: 3, question: "What is the difference between interface and type alias?", type: "MCQ", difficulty: "easy" },
    { qId: 4, question: "How do mapped types work in TypeScript?", type: "MCQ", difficulty: "medium" },
  ]},
  { id: 5, name: "ML Engineering", skill: "ML/AI", questions: 45, passPercent: 78, retakeLimit: 2, difficulty: { easy: 15, medium: 45, hard: 40 }, cheats: 2, status: "inactive", createdBy: "manual" as const, totalParticipants: 94, participants: [
    { userId: 5, name: "Emily Park", score: 94, rank: 1, completedAt: "2024-01-05" },
  ], questionsList: [
    { qId: 1, question: "What is backpropagation and how does it work?", type: "Descriptive", difficulty: "hard" },
    { qId: 2, question: "Explain precision vs recall in classification.", type: "MCQ", difficulty: "medium" },
    { qId: 3, question: "What are the types of machine learning?", type: "MCQ", difficulty: "easy" },
  ]},
];

export const nftData = {
  totalMinted: 8452,
  pendingMints: 124,
  blockchainStatus: "Healthy",
  avgGasFee: "0.0042 ETH",
  certificates: [
    { id: 1, tokenId: "#4521", user: "Sarah Chen", skill: "React Advanced", mintedAt: "2024-01-15", status: "minted", txHash: "0x1a2b...3c4d" },
    { id: 2, tokenId: "#4520", user: "James Wilson", skill: "Python Pro", mintedAt: "2024-01-14", status: "minted", txHash: "0x5e6f...7g8h" },
    { id: 3, tokenId: "#4519", user: "Maria Garcia", skill: "AWS Architect", mintedAt: "2024-01-14", status: "pending", txHash: "-" },
    { id: 4, tokenId: "#4518", user: "Alex Kumar", skill: "TypeScript", mintedAt: "2024-01-13", status: "minted", txHash: "0x9i0j...1k2l" },
    { id: 5, tokenId: "#4517", user: "Emily Park", skill: "Node.js", mintedAt: "2024-01-13", status: "failed", txHash: "-" },
  ],
};

export const analyticsData = {
  matchScoreDistribution: [
    { range: "0-20", count: 120 }, { range: "21-40", count: 340 }, { range: "41-60", count: 890 },
    { range: "61-80", count: 1450 }, { range: "81-100", count: 2100 },
  ],
  skillPopularity: [
    { skill: "React", searches: 8900 }, { skill: "Python", searches: 7800 }, { skill: "AWS", searches: 6500 },
    { skill: "TypeScript", searches: 6200 }, { skill: "Node.js", searches: 5800 }, { skill: "ML/AI", searches: 5200 },
    { skill: "Docker", searches: 4100 }, { skill: "Kubernetes", searches: 3200 },
  ],
  topUsers: [
    { name: "Maria Garcia", score: 98, skills: 15 }, { name: "Sarah Chen", score: 96, skills: 12 },
    { name: "Priya Patel", score: 95, skills: 14 }, { name: "Emily Park", score: 93, skills: 10 },
    { name: "David Liu", score: 91, skills: 9 },
  ],
  recruiterActivity: [
    { month: "Jan", searches: 450, hires: 32 }, { month: "Feb", searches: 520, hires: 41 },
    { month: "Mar", searches: 610, hires: 48 }, { month: "Apr", searches: 580, hires: 45 },
    { month: "May", searches: 700, hires: 56 }, { month: "Jun", searches: 820, hires: 67 },
  ],
};

export const monetizationData = {
  stats: [
    { label: "MRR", value: "₹4,34,000", change: "+18%", trend: "up" as const },
    { label: "ARR", value: "₹52,08,000", change: "+22%", trend: "up" as const },
    { label: "Avg. Revenue/User", value: "₹1,785", change: "+5%", trend: "up" as const },
    { label: "Churn Rate", value: "2.3%", change: "-0.5%", trend: "down" as const },
  ],
  plans: [
    { name: "Free", users: 12400, revenue: 0 },
    { name: "Pro", users: 8200, revenue: 1367400 },
    { name: "Enterprise", users: 4291, revenue: 1373200 },
  ],
  revenueBySource: [
    { source: "Subscriptions", value: 58, amount: "₹15,87,000" },
    { source: "NFT Minting", value: 22, amount: "₹6,03,000" },
    { source: "Enterprise Deals", value: 15, amount: "₹4,11,400" },
    { source: "API Access", value: 5, amount: "₹1,39,600" },
  ],
};

export const settingsData = {
  general: { platformName: "SkillForge Pro", tagline: "AI-Powered Skill Verification", timezone: "UTC", language: "English" },
  notifications: { emailAlerts: true, pushNotifications: true, weeklyDigest: true, cheatAlerts: true },
  security: { twoFactor: true, sessionTimeout: 30, ipWhitelist: false, auditLog: true },
};
