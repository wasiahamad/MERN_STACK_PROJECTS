// Mock data for the job portal demo

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "candidate" | "recruiter";
  phone?: string;
  walletAddress?: string;
  walletVerified?: boolean;
  headline?: string;
  location?: string;
  about?: string;
  socials?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  settings?: {
    darkMode?: boolean;
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      applicationUpdates?: boolean;
      jobMatches?: boolean;
      securityAlerts?: boolean;
    };
  };
  emailVerified?: boolean;
  skills?: Skill[];
  experience?: Experience[];
  education?: Education[];
  certificates?: Certificate[];
  resumeUrl?: string;
  resumeFileName?: string;
  resumeMime?: string;
  aiScore?: number;
  reputation?: number;
  yearsOfExperience?: number;
  savedJobIds?: string[];
}

export interface Skill {
  name: string;
  level: number;
  verified: boolean;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  nftMinted: boolean;
  tokenId?: string;
  image: string;
  fileName?: string;
  fileMime?: string;
  verified: boolean;

  // Optional on-chain metadata (real API responses may include these)
  chainHash?: string;
  chainTxHash?: string;
  chainContractAddress?: string;
  chainNetwork?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  companyWebsite?: string;
  industry?: string;
  companySize?: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  salary: string;
  posted: string;
  experience?: string;
  description: string;
  requirements: string[];
  skills: string[];
  minAiScore: number;
  requiredCertificates: string[];
  matchScore?: number;
  verified: boolean;
  applicants: number;
  views: number;
  openPositions?: number;

  assessment?: {
    enabled: boolean;
    passPercent: number;
    marksPerQuestion: number;
    questionsCount: number;
    updatedAt: string | null;
  };

  myAssessment?:
    | {
        attemptId: string;
        status: "in_progress" | "submitted";
        attemptNumber: number;
        percent: number;
        passed: boolean;
        submittedAt: string | null;
      }
    | null;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  userId: string;
  status: "pending" | "reviewing" | "shortlisted" | "interview" | "offered" | "rejected";
  appliedDate: string;
  matchScore: number;
  aiVerified: boolean;
  nftVerified: boolean;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  description: string;
  founded: string;
  trustScore: number;
  verified: boolean;
  openJobs: number;
}

// Current logged in user (candidate)
export const currentUser: User = {
  id: "user-1",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  avatar: "🧑‍💻",
  role: "candidate",
  walletAddress: "0x1234...5678",
  aiScore: 87,
  reputation: 92,
  skills: [
    { name: "React", level: 95, verified: true },
    { name: "TypeScript", level: 90, verified: true },
    { name: "Node.js", level: 85, verified: true },
    { name: "Solidity", level: 78, verified: true },
    { name: "Python", level: 72, verified: false },
    { name: "Web3.js", level: 88, verified: true },
    { name: "MongoDB", level: 80, verified: false },
    { name: "GraphQL", level: 75, verified: false },
  ],
  experience: [
    {
      id: "exp-1",
      title: "Senior Frontend Developer",
      company: "TechCorp Inc",
      location: "San Francisco, CA",
      startDate: "2022-01",
      current: true,
      description: "Leading the frontend team in building scalable React applications with TypeScript.",
    },
    {
      id: "exp-2",
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Remote",
      startDate: "2020-03",
      endDate: "2021-12",
      current: false,
      description: "Developed full-stack applications using MERN stack and integrated blockchain features.",
    },
    {
      id: "exp-3",
      title: "Junior Developer",
      company: "WebAgency",
      location: "New York, NY",
      startDate: "2018-06",
      endDate: "2020-02",
      current: false,
      description: "Built responsive websites and web applications for various clients.",
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "Master of Computer Science",
      institution: "Stanford University",
      year: "2018",
      gpa: "3.9",
    },
    {
      id: "edu-2",
      degree: "Bachelor of Science in Computer Engineering",
      institution: "MIT",
      year: "2016",
      gpa: "3.8",
    },
  ],
  certificates: [
    {
      id: "cert-1",
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023-06",
      nftMinted: true,
      tokenId: "0xabc123",
      image: "🏆",
      verified: true,
    },
    {
      id: "cert-2",
      name: "Certified Blockchain Developer",
      issuer: "Blockchain Council",
      date: "2023-03",
      nftMinted: true,
      tokenId: "0xdef456",
      image: "⛓️",
      verified: true,
    },
    {
      id: "cert-3",
      name: "Google Cloud Professional",
      issuer: "Google",
      date: "2022-11",
      nftMinted: false,
      image: "☁️",
      verified: true,
    },
    {
      id: "cert-4",
      name: "React Advanced Certification",
      issuer: "Meta",
      date: "2022-08",
      nftMinted: true,
      tokenId: "0xghi789",
      image: "⚛️",
      verified: true,
    },
  ],
};

// Mock jobs data
export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Senior Blockchain Developer",
    company: "ChainTech Labs",
    logo: "🔗",
    location: "Remote",
    type: "Full-time",
    salary: "$120k - $180k",
    posted: "2 days ago",
    description: "We're looking for an experienced blockchain developer to join our team and help build the next generation of decentralized applications. You'll be working with cutting-edge technologies including Ethereum, Solidity, and Web3.js.",
    requirements: [
      "5+ years of software development experience",
      "3+ years of blockchain development experience",
      "Strong knowledge of Ethereum and smart contracts",
      "Experience with Web3.js, Ethers.js, or similar libraries",
      "Understanding of DeFi protocols and tokenomics",
    ],
    skills: ["Solidity", "Web3.js", "React", "Node.js", "Ethereum"],
    minAiScore: 80,
    requiredCertificates: ["Certified Blockchain Developer"],
    matchScore: 95,
    verified: true,
    applicants: 45,
    views: 1250,
  },
  {
    id: "job-2",
    title: "AI/ML Engineer",
    company: "Neural Networks Inc",
    logo: "🧠",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$150k - $200k",
    posted: "1 day ago",
    description: "Join our AI research team to develop state-of-the-art machine learning models. You'll work on challenging problems in natural language processing, computer vision, and reinforcement learning.",
    requirements: [
      "PhD or Master's in Computer Science, AI, or related field",
      "Strong publication record in top ML conferences",
      "Experience with PyTorch or TensorFlow",
      "Strong mathematical background",
      "Excellent problem-solving skills",
    ],
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Deep Learning"],
    minAiScore: 85,
    requiredCertificates: [],
    matchScore: 72,
    verified: true,
    applicants: 78,
    views: 2100,
  },
  {
    id: "job-3",
    title: "Full Stack Developer",
    company: "Web3 Ventures",
    logo: "🚀",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100k - $140k",
    posted: "3 days ago",
    description: "Looking for a versatile full-stack developer to build innovative web applications. You'll work on both frontend and backend, creating seamless user experiences.",
    requirements: [
      "4+ years of full-stack development experience",
      "Proficiency in React and Node.js",
      "Experience with PostgreSQL or MongoDB",
      "Understanding of RESTful APIs and GraphQL",
      "Strong communication skills",
    ],
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "GraphQL"],
    minAiScore: 75,
    requiredCertificates: [],
    matchScore: 88,
    verified: false,
    applicants: 120,
    views: 890,
  },
  {
    id: "job-4",
    title: "Smart Contract Auditor",
    company: "SecureChain",
    logo: "🔒",
    location: "Remote",
    type: "Contract",
    salary: "$150k - $200k",
    posted: "5 hours ago",
    description: "We need an experienced smart contract auditor to review and secure DeFi protocols. You'll identify vulnerabilities and provide recommendations for fixes.",
    requirements: [
      "Deep understanding of Solidity and EVM",
      "Experience auditing smart contracts",
      "Knowledge of common vulnerabilities",
      "Strong attention to detail",
      "Excellent written communication",
    ],
    skills: ["Solidity", "Vyper", "Security", "Audit", "DeFi"],
    minAiScore: 90,
    requiredCertificates: ["Certified Blockchain Developer"],
    matchScore: 78,
    verified: true,
    applicants: 23,
    views: 567,
  },
  {
    id: "job-5",
    title: "DevOps Engineer",
    company: "CloudScale",
    logo: "☁️",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110k - $150k",
    posted: "1 week ago",
    description: "Join our infrastructure team to build and maintain scalable cloud infrastructure. You'll work with AWS, Kubernetes, and modern CI/CD pipelines.",
    requirements: [
      "3+ years of DevOps experience",
      "Strong knowledge of AWS services",
      "Experience with Kubernetes and Docker",
      "Proficiency in Terraform or CloudFormation",
      "Scripting skills in Python or Bash",
    ],
    skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"],
    minAiScore: 70,
    requiredCertificates: ["AWS Solutions Architect"],
    matchScore: 82,
    verified: true,
    applicants: 89,
    views: 1456,
  },
  {
    id: "job-6",
    title: "Frontend React Developer",
    company: "DesignTech",
    logo: "🎨",
    location: "Los Angeles, CA",
    type: "Full-time",
    salary: "$90k - $130k",
    posted: "4 days ago",
    description: "Create beautiful, responsive user interfaces with React. You'll collaborate with designers to bring stunning designs to life.",
    requirements: [
      "3+ years of React development experience",
      "Strong CSS and animation skills",
      "Experience with state management libraries",
      "Eye for design and attention to detail",
      "Familiarity with design tools like Figma",
    ],
    skills: ["React", "TypeScript", "CSS", "Framer Motion", "Tailwind"],
    minAiScore: 65,
    requiredCertificates: [],
    matchScore: 94,
    verified: true,
    applicants: 156,
    views: 2340,
  },
  {
    id: "job-7",
    title: "Web3 Product Manager",
    company: "DeFi Protocol",
    logo: "💎",
    location: "Remote",
    type: "Full-time",
    salary: "$130k - $170k",
    posted: "2 days ago",
    description: "Lead product development for our DeFi platform. You'll work closely with engineering, design, and community teams to ship features users love.",
    requirements: [
      "5+ years of product management experience",
      "Deep understanding of DeFi and Web3",
      "Experience shipping crypto products",
      "Strong analytical and communication skills",
      "Passion for decentralization",
    ],
    skills: ["Product Management", "DeFi", "Web3", "Analytics", "Agile"],
    minAiScore: 75,
    requiredCertificates: [],
    matchScore: 65,
    verified: true,
    applicants: 67,
    views: 980,
  },
  {
    id: "job-8",
    title: "Backend Engineer - Rust",
    company: "Solana Labs",
    logo: "⚡",
    location: "San Diego, CA",
    type: "Full-time",
    salary: "$140k - $190k",
    posted: "6 hours ago",
    description: "Build high-performance blockchain infrastructure using Rust. You'll work on core protocol development and optimization.",
    requirements: [
      "4+ years of systems programming experience",
      "Strong Rust proficiency",
      "Understanding of distributed systems",
      "Experience with blockchain protocols",
      "Performance optimization skills",
    ],
    skills: ["Rust", "Solana", "Systems Programming", "Blockchain", "C++"],
    minAiScore: 85,
    requiredCertificates: [],
    matchScore: 58,
    verified: true,
    applicants: 34,
    views: 789,
  },
];

// Mock applications
export const mockApplications: Application[] = [
  {
    id: "app-1",
    jobId: "job-1",
    job: mockJobs[0],
    userId: "user-1",
    status: "interview",
    appliedDate: "2024-01-15",
    matchScore: 95,
    aiVerified: true,
    nftVerified: true,
  },
  {
    id: "app-2",
    jobId: "job-6",
    job: mockJobs[5],
    userId: "user-1",
    status: "shortlisted",
    appliedDate: "2024-01-18",
    matchScore: 94,
    aiVerified: true,
    nftVerified: false,
  },
  {
    id: "app-3",
    jobId: "job-3",
    job: mockJobs[2],
    userId: "user-1",
    status: "reviewing",
    appliedDate: "2024-01-20",
    matchScore: 88,
    aiVerified: true,
    nftVerified: false,
  },
  {
    id: "app-4",
    jobId: "job-5",
    job: mockJobs[4],
    userId: "user-1",
    status: "pending",
    appliedDate: "2024-01-22",
    matchScore: 82,
    aiVerified: true,
    nftVerified: true,
  },
  {
    id: "app-5",
    jobId: "job-2",
    job: mockJobs[1],
    userId: "user-1",
    status: "rejected",
    appliedDate: "2024-01-10",
    matchScore: 72,
    aiVerified: true,
    nftVerified: false,
  },
];

// Mock companies
export const mockCompanies: Company[] = [
  {
    id: "comp-1",
    name: "ChainTech Labs",
    logo: "🔗",
    industry: "Blockchain",
    size: "50-200 employees",
    location: "San Francisco, CA",
    website: "https://chaintechlabs.io",
    description: "Building the future of decentralized finance with cutting-edge blockchain solutions.",
    founded: "2019",
    trustScore: 95,
    verified: true,
    openJobs: 8,
  },
  {
    id: "comp-2",
    name: "Neural Networks Inc",
    logo: "🧠",
    industry: "Artificial Intelligence",
    size: "200-500 employees",
    location: "San Francisco, CA",
    website: "https://neuralnetworks.ai",
    description: "Advancing AI research and bringing intelligent solutions to real-world problems.",
    founded: "2017",
    trustScore: 92,
    verified: true,
    openJobs: 12,
  },
  {
    id: "comp-3",
    name: "Web3 Ventures",
    logo: "🚀",
    industry: "Web3",
    size: "10-50 employees",
    location: "New York, NY",
    website: "https://web3ventures.io",
    description: "Investing in and building the next generation of internet applications.",
    founded: "2021",
    trustScore: 78,
    verified: false,
    openJobs: 5,
  },
];

// Mock notifications
export interface Notification {
  id: string;
  type: "application" | "interview" | "message" | "system" | "status" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "interview",
    title: "Interview Scheduled",
    message: "Your interview with ChainTech Labs is scheduled for Jan 25, 2024 at 2:00 PM",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "notif-2",
    type: "application",
    title: "Application Shortlisted",
    message: "Your application for Frontend React Developer at DesignTech has been shortlisted!",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "notif-3",
    type: "message",
    title: "New Message",
    message: "Recruiter from CloudScale sent you a message regarding your application",
    time: "1 day ago",
    read: true,
  },
  {
    id: "notif-4",
    type: "system",
    title: "Profile Updated",
    message: "Your AI skill score has been recalculated: 87/100",
    time: "2 days ago",
    read: true,
  },
];

// Recruiter user
export const recruiterUser: User = {
  id: "recruiter-1",
  name: "Sarah Chen",
  email: "sarah.chen@chaintechlabs.io",
  avatar: "👩‍💼",
  role: "recruiter",
  walletAddress: "0x9876...4321",
};

// Mock candidates for recruiter view
export interface Candidate {
  id: string;
  applicationId?: string;
  jobId?: string;
  jobTitle?: string;
  name: string;
  avatar: string;
  title: string;
  location: string;
  skills: string[];
  email?: string;
  phone?: string;
  about?: string;
  socials?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  aiScore: number;
  matchScore: number;
  profileMatchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  experience: string;
  appliedDate: string;
  status: "new" | "reviewed" | "shortlisted" | "interview" | "offered" | "rejected";
  nftCertificates: string[];
  certificates?: Certificate[];
  resumeUrl?: string;
  resumeFileName?: string;
  resumeMime?: string;
  reputation: number;
}

export const mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    name: "Alex Johnson",
    avatar: "🧑‍💻",
    title: "Senior Frontend Developer",
    location: "San Francisco, CA",
    skills: ["React", "TypeScript", "Solidity", "Web3.js"],
    aiScore: 87,
    matchScore: 95,
    experience: "5 years",
    appliedDate: "2024-01-15",
    status: "interview",
    nftCertificates: ["AWS Solutions Architect", "Certified Blockchain Developer"],
    reputation: 92,
  },
  {
    id: "cand-2",
    name: "Emily Rodriguez",
    avatar: "👩‍💻",
    title: "Blockchain Developer",
    location: "Austin, TX",
    skills: ["Solidity", "Rust", "Web3.js", "Ethereum"],
    aiScore: 91,
    matchScore: 92,
    experience: "4 years",
    appliedDate: "2024-01-16",
    status: "shortlisted",
    nftCertificates: ["Certified Blockchain Developer"],
    reputation: 88,
  },
  {
    id: "cand-3",
    name: "Michael Park",
    avatar: "👨‍💻",
    title: "Full Stack Developer",
    location: "Seattle, WA",
    skills: ["React", "Node.js", "Python", "MongoDB"],
    aiScore: 78,
    matchScore: 85,
    experience: "3 years",
    appliedDate: "2024-01-17",
    status: "reviewed",
    nftCertificates: [],
    reputation: 75,
  },
  {
    id: "cand-4",
    name: "Lisa Wang",
    avatar: "👩‍🔬",
    title: "Smart Contract Developer",
    location: "Remote",
    skills: ["Solidity", "Vyper", "Security", "DeFi"],
    aiScore: 94,
    matchScore: 89,
    experience: "6 years",
    appliedDate: "2024-01-14",
    status: "offered",
    nftCertificates: ["Certified Blockchain Developer", "Smart Contract Security"],
    reputation: 96,
  },
  {
    id: "cand-5",
    name: "David Kim",
    avatar: "🧑‍🎓",
    title: "Junior Developer",
    location: "Los Angeles, CA",
    skills: ["React", "JavaScript", "Node.js"],
    aiScore: 65,
    matchScore: 72,
    experience: "1 year",
    appliedDate: "2024-01-18",
    status: "new",
    nftCertificates: [],
    reputation: 60,
  },
];

// DAO Proposals
export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  proposerUserId?: string;
  status: "active" | "passed" | "rejected" | "pending";
  votesFor: number;
  votesAgainst: number;
  endDate: string;
  category: "governance" | "feature" | "moderation" | "treasury" | "general";

  // Optional auth-derived flags (real API responses may include these)
  canManage?: boolean;

  // Optional on-chain metadata
  chainHash?: string;
  chainTxHash?: string;
  chainContractAddress?: string;
  chainNetwork?: string;
}

export const mockDAOProposals: DAOProposal[] = [
  {
    id: "prop-1",
    title: "Increase Minimum AI Score for Job Posts",
    description: "Proposal to increase the minimum AI score requirement from 60 to 70 for all job postings to ensure higher quality matches.",
    proposer: "0x1234...5678",
    status: "active",
    votesFor: 1250,
    votesAgainst: 450,
    endDate: "2024-01-30",
    category: "governance",
  },
  {
    id: "prop-2",
    title: "Add New Certificate Category: AI/ML",
    description: "Add a new NFT certificate category for AI and Machine Learning certifications to better serve the growing demand.",
    proposer: "0x9876...4321",
    status: "active",
    votesFor: 890,
    votesAgainst: 120,
    endDate: "2024-02-05",
    category: "feature",
  },
  {
    id: "prop-3",
    title: "Ban Recruiter ID: rec-456",
    description: "Proposal to ban a recruiter account for repeated violations of community guidelines and fraudulent job postings.",
    proposer: "0xabcd...efgh",
    status: "passed",
    votesFor: 2100,
    votesAgainst: 150,
    endDate: "2024-01-20",
    category: "moderation",
  },
  {
    id: "prop-4",
    title: "Allocate 10 ETH for Developer Grants",
    description: "Allocate 10 ETH from the treasury for developer grants to encourage platform improvement contributions.",
    proposer: "0xijkl...mnop",
    status: "pending",
    votesFor: 0,
    votesAgainst: 0,
    endDate: "2024-02-15",
    category: "treasury",
  },
];
