# SkillForge Pro - Complete Technical Documentation

**AI + Blockchain Powered Job Portal Platform**

Version: 1.0  
Last Updated: February 11, 2026

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Complete User Flows](#3-complete-user-flows)
4. [System Architecture](#4-system-architecture)
5. [AI Integration Modules](#5-ai-integration-modules)
6. [Blockchain Integration](#6-blockchain-integration)
7. [Assessment System](#7-assessment-system)
8. [Database Models](#8-database-models)
9. [API Structure](#9-api-structure)
10. [Security Layer](#10-security-layer)
11. [Admin Controls](#11-admin-controls)
12. [Monetization Model](#12-monetization-model)
13. [Future Scope](#13-future-scope)

---

## 1. Product Overview

### 1.1 Platform Type
**SkillForge Pro** is an enterprise-grade job portal platform that combines Artificial Intelligence and Blockchain technology to create a fraud-free, transparent, and efficient hiring ecosystem.

### 1.2 Core Problem Statement
Traditional job portals face:
- Fake skill claims and resume fraud
- Time-consuming candidate screening
- Lack of verifiable credentials
- Poor job-candidate matching
- Trust issues in hiring

### 1.3 Our Solution
- **AI-Powered Resume Analysis**: Automatic skill extraction and profile scoring
- **Blockchain Verified Certificates**: Tamper-proof skill credentials via NFTs
- **Smart Job Matching**: AI-driven compatibility scoring (0-100%)
- **Skill Assessment Tests**: Auto-generated, AI-evaluated skill verification
- **DAO Governance**: Community-driven platform decisions
- **Transparent Hiring**: On-chain reputation and verification

### 1.4 Target Users

| User Type | Primary Use Cases |
|-----------|------------------|
| **Candidates** | Job search, skill verification, resume building, certificate earning |
| **Recruiters** | Job posting, candidate screening, skill verification, hiring |
| **Admin** | Platform management, analytics, moderation, blockchain monitoring |

### 1.5 Key Differentiators
1. **Blockchain Trust Layer**: Immutable skill certificates
2. **Dynamic AI Matching**: Real-time job-candidate compatibility
3. **Resume-Aware Matching**: AI parses resumes to extract hidden skills
4. **Verifiable Reputation**: On-chain reputation scores
5. **DAO Governance**: Token-based platform decisions

---

## 2. User Roles & Permissions

### 2.1 Candidate

**Access Rights:**
- ✅ View/Edit own profile
- ✅ Upload resume (PDF)
- ✅ Take skill assessments
- ✅ Apply to jobs
- ✅ View AI match scores
- ✅ Mint blockchain certificates
- ✅ Link crypto wallet
- ✅ Participate in DAO voting

**Profile Components:**
- Basic Info (name, email, phone, location)
- Headline & About
- Skills (verified & unverified)
- Experience history
- Education
- Certificates (NFT-based)
- Resume (parsed by AI)
- AI Score (0-100)
- Reputation (0-100)

### 2.2 Recruiter

**Access Rights:**
- ✅ Create company profile
- ✅ Post jobs
- ✅ View AI-ranked candidates
- ✅ Verify blockchain certificates
- ✅ Download resumes
- ✅ Manage applications
- ✅ Access analytics dashboard

**Profile Components:**
- Company name & logo
- Industry & size
- About company
- Location
- Website
- Posted jobs
- Application statistics

### 2.3 Admin (Future Scope)

**Access Rights:**
- ✅ User management (suspend/activate)
- ✅ Job moderation
- ✅ Certificate validation
- ✅ Blockchain transaction monitoring
- ✅ Platform analytics
- ✅ DAO proposal management
- ✅ Payment tracking

---

## 3. Complete User Flows

### 3.1 Candidate Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    CANDIDATE COMPLETE FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ↓
   Email → OTP Verification → Account Created
   
2. PROFILE SETUP
   ↓
   Basic Info → Experience → Education → Skills → Upload Resume
   
3. RESUME ANALYSIS (AI)
   ↓
   PDF Text Extraction → OpenAI/Heuristic Parsing → Skill Keys Extracted
   ↓
   Auto-populate skills → Update profile
   
4. SKILL ASSESSMENT
   ↓
   Select Skill → AI Generates Questions → Take Test (10 Q, 15 min)
   ↓
   Auto-Evaluation → Score Calculation → Pass/Fail
   ↓
   If Pass → Blockchain Certificate Minting
   
5. BLOCKCHAIN CERTIFICATE
   ↓
   Smart Contract Called → NFT Minted → TxHash Stored
   ↓
   Certificate visible on profile (verified badge)
   
6. JOB SEARCH
   ↓
   Browse Jobs → AI Match Score Shown → Filter by Skills/Location/Salary
   ↓
   View Job Details → Apply
   
7. APPLICATION TRACKING
   ↓
   View Status (Pending/Shortlisted/Rejected)
   ↓
   Dynamic Match % shown based on profile
   
8. WALLET & DAO
   ↓
   Link MetaMask → Verify Ownership → Vote on Proposals
```

### 3.2 Recruiter Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECRUITER COMPLETE FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ↓
   Email → OTP Verification → Account Created
   
2. COMPANY PROFILE
   ↓
   Company Details → Logo Upload → Industry Selection → Profile Complete
   
3. JOB POSTING
   ↓
   Job Title → Description → Requirements → Skills → Salary Range
   ↓
   Set Min AI Score → Set Required Certificates → Publish
   
4. CANDIDATE DISCOVERY
   ↓
   AI Auto-Ranks Candidates by Match % → View Top Candidates
   ↓
   Filter by: Verified Skills, AI Score, Experience, Location
   
5. PROFILE REVIEW
   ↓
   View Full Profile → Download Resume → Verify Blockchain Certificates
   ↓
   Check Reputation Score → View Assessment History
   
6. APPLICATION MANAGEMENT
   ↓
   Shortlist → Schedule Interview → Reject → Hire
   ↓
   Send notifications → Track application status
   
7. ANALYTICS DASHBOARD
   ↓
   View: Total Applicants, Match % Distribution, Verified vs Non-verified
   ↓
   Export Reports
```

### 3.3 DAO Governance Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DAO GOVERNANCE FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. PROPOSAL CREATION
   ↓
   User creates proposal (platform improvement, fee changes, etc.)
   ↓
   Proposal stored in DB + optional blockchain record
   
2. WALLET VERIFICATION
   ↓
   User links wallet → Sign message → Ownership verified
   
3. VOTING
   ↓
   Users vote (For/Against/Abstain)
   ↓
   If blockchain enabled: On-chain voting via smart contract
   ↓
   Else: Off-chain voting in database
   
4. PROPOSAL MANAGEMENT
   ↓
   Owner can edit/delete proposal
   ↓
   Admin can change status (active/executed/rejected)
   
5. EXECUTION
   ↓
   If proposal passes → Admin executes → Status updated
```

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │  Web Browser   │  │  Mobile App    │  │  MetaMask      │        │
│  │  (React + TS)  │  │  (Future)      │  │  Extension     │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
└──────────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS / WebSocket
┌──────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                   │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Express.js REST API                                       │     │
│  │  - JWT Authentication                                      │     │
│  │  - Rate Limiting                                           │     │
│  │  - CORS & Security Headers                                │     │
│  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Auth Service │  │  AI Service  │  │ Blockchain   │              │
│  │ - OTP        │  │ - OpenAI API │  │ Service      │              │
│  │ - JWT        │  │ - Resume     │  │ - Ethers.js  │              │
│  │ - Sessions   │  │   Parser     │  │ - Web3       │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Job Service  │  │ Assessment   │  │ Certificate  │              │
│  │ - Matching   │  │ Service      │  │ Service      │              │
│  │ - Filtering  │  │ - Questions  │  │ - NFT Mint   │              │
│  │ - AI Rank    │  │ - Evaluation │  │ - Verify     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                    │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │   MongoDB      │  │  Cloudinary    │  │   Redis        │        │
│  │  (NoSQL DB)    │  │  (Media CDN)   │  │  (Cache)       │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER (Polygon)                         │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  CertificateRegistry.sol                                   │     │
│  │  - mintCertificate(candidateHash, skillName)              │     │
│  │  - verifyCertificate(tokenId)                             │     │
│  │  - getCertificatesByHolder(address)                       │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  DAOGovernance.sol (Optional)                              │     │
│  │  - createProposal(description)                             │     │
│  │  - vote(proposalId, support)                               │     │
│  │  - executeProposal(proposalId)                             │     │
│  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  OpenAI API  │  │  SendGrid    │  │  Stripe      │              │
│  │  (ChatGPT)   │  │  (Email)     │  │  (Payments)  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- React Query (data fetching)
- Tailwind CSS + shadcn/ui components
- Framer Motion (animations)
- ethers.js (Web3 wallet integration)

**Backend:**
- Node.js 18+
- Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- pdf-parse for resume parsing

**Blockchain:**
- Solidity ^0.8.0
- Hardhat (development framework)
- Ethers.js v6
- Polygon Mumbai (testnet) / Polygon Mainnet

**AI/ML:**
- OpenAI GPT-4 (via OpenRouter)
- Heuristic fallback for skill extraction
- Custom scoring algorithms

**Infrastructure:**
- Cloudinary (image/file CDN)
- MongoDB Atlas (database hosting)
- Vercel/Netlify (frontend hosting)
- Railway/Render (backend hosting)

---

## 5. AI Integration Modules

### 5.1 Resume Analysis AI

**Purpose:** Extract structured data from uploaded PDF resumes

**Flow:**
```
PDF Upload → Text Extraction → AI Analysis → Skill Extraction → Profile Update
```

**Technical Implementation:**

1. **Text Extraction**
   - Library: `pdf-parse`
   - Normalizes text, converts to lowercase
   - Generates text hash (SHA-256) for change detection

2. **AI Analysis (OpenRouter/OpenAI)**
   ```json
   {
     "model": "openai/gpt-4",
     "messages": [
       {
         "role": "system",
         "content": "Extract skills from resume text"
       },
       {
         "role": "user",
         "content": "<resume_text>"
       }
     ]
   }
   ```

3. **Heuristic Fallback**
   - Skill dictionary matching
   - Common skill patterns (React, Node.js, Python, etc.)
   - Experience level detection

4. **Output Schema**
   ```json
   {
     "provider": "openrouter",
     "skills": ["React", "Node.js", "TypeScript"],
     "skillKeys": ["react", "nodejs", "typescript"],
     "headlineHint": "Full Stack Developer",
     "locationHint": "Remote",
     "summary": "Experienced developer..."
   }
   ```

**Storage:**
```javascript
resumeParsed: {
  textHash: String,
  provider: String,
  analyzedAt: Date,
  skills: [String],
  skillKeys: [String],
  headlineHint: String,
  locationHint: String,
  summary: String
}
```

### 5.2 Job Matching AI

**Purpose:** Calculate compatibility percentage between job and candidate

**Algorithm:**
```javascript
Match Score = (
  Verified Skills Match × 60% +
  Resume Skills Match × 25% +
  Experience Match × 10% +
  AI Score × 5%
) / 100
```

**Skill Matching Logic:**
```javascript
function computeSkillMatch(jobSkills, candidateSkills, resumeSkills) {
  const normalizedJobSkills = normalize(jobSkills);
  const verifiedKeys = extractKeys(candidateSkills);
  const resumeKeys = extractKeys(resumeSkills);
  
  const allCandidateKeys = [...verifiedKeys, ...resumeKeys];
  
  const matched = normalizedJobSkills.filter(skill => 
    allCandidateKeys.includes(skill)
  );
  
  return (matched.length / normalizedJobSkills.length) * 100;
}
```

**Skill Normalization:**
- React → react, reactjs, react.js
- Node.js → nodejs, node
- TypeScript → typescript, ts

### 5.3 AI Assessment Generator

**Purpose:** Generate skill-based assessment questions dynamically

**Flow:**
```
Skill Selection → AI Prompt → Generate 10 Questions → Store → Present to User
```

**Prompt Engineering:**
```json
{
  "system": "You are a technical interviewer generating skill assessment questions",
  "user": "Generate 10 multiple-choice questions for {skillName} assessment. 
           Difficulty: {difficulty}. 
           Format: JSON array with question, options, correctAnswer"
}
```

**Question Schema:**
```json
{
  "questionId": "uuid",
  "text": "What is React?",
  "options": ["Library", "Framework", "Language", "Tool"],
  "correctAnswer": "Library",
  "difficulty": "medium"
}
```

**Evaluation Logic:**
```javascript
function evaluateAssessment(submission) {
  let correct = 0;
  submission.answers.forEach(answer => {
    if (answer.selected === answer.correctAnswer) {
      correct++;
    }
  });
  
  const accuracy = (correct / submission.answers.length) * 100;
  
  const status = accuracy >= 70 ? "verified" : 
                 accuracy >= 50 ? "partially_verified" : 
                 "not_verified";
  
  return { accuracy, status, correct, total: submission.answers.length };
}
```

### 5.4 AI Score Calculation

**Purpose:** Generate deterministic candidate quality score (0-100)

**Formula:**
```
AI Score = Base (10) +
           Verified Skills Component (0-55) +
           Partial Skills Component (0-10) +
           Experience Component (0-20) +
           Certificate Component (0-10) +
           Profile Completion Component (0-5)
```

**Component Breakdown:**

1. **Verified Skills** (max 55 points)
   ```
   Count × 8 + AvgAccuracy × 0.3
   ```

2. **Partial Skills** (max 10 points)
   ```
   Count × 2
   ```

3. **Experience** (max 20 points)
   ```
   YearsOfExperience × 4 (capped at 20)
   ```

4. **Certificates** (max 10 points)
   ```
   VerifiedCerts × 2 + NFTMintedCerts × 1
   ```

5. **Profile Completion** (max 5 points)
   ```
   CompletionPercentage / 20
   ```

**Profile Completion Checks:**
- Basic Info (name, email) ✓
- Location ✓
- About/Headline ✓
- Skills (>0) ✓
- Experience (>0) ✓
- Education (>0) ✓
- Certificates (>0) ✓
- Social Links ✓
- Wallet Linked ✓

---

## 6. Blockchain Integration

### 6.1 Smart Contracts

#### 6.1.1 CertificateRegistry.sol

**Purpose:** Store tamper-proof skill certificates as NFTs

**Core Functions:**

```solidity
contract CertificateRegistry is ERC721URIStorage {
  
  struct Certificate {
    string candidateHash;    // SHA-256 hash of candidate info (no PII)
    string skillName;
    uint256 issuedAt;
    bool isValid;
  }
  
  mapping(uint256 => Certificate) public certificates;
  uint256 private _tokenIdCounter;
  
  // Mint new certificate
  function mintCertificate(
    string memory candidateHash,
    string memory skillName
  ) public returns (uint256)
  
  // Verify certificate
  function verifyCertificate(uint256 tokenId) 
    public view returns (bool)
  
  // Get certificates by holder
  function getCertificatesByHolder(address holder) 
    public view returns (uint256[] memory)
  
  // Revoke certificate (admin only)
  function revokeCertificate(uint256 tokenId) 
    public onlyAdmin
}
```

**Certificate Minting Flow:**

```
Candidate Passes Assessment
    ↓
Backend generates hash = SHA256(userId + email + timestamp)
    ↓
Backend calls Smart Contract: mintCertificate(hash, "React")
    ↓
Smart Contract emits event: CertificateMinted(tokenId, hash, skillName)
    ↓
Backend listens to event → stores txHash + tokenId in MongoDB
    ↓
Certificate visible on candidate profile (verified badge)
```

**Data Storage Strategy:**
- ❌ **Never store** PII on blockchain (name, email, phone)
- ✅ **Store** cryptographic hash of candidate identity
- ✅ **Store** skill name, timestamp, issuer address
- ✅ **Link** tokenId to MongoDB document for frontend display

#### 6.1.2 DAOGovernance.sol

**Purpose:** Community-driven platform governance

**Core Functions:**

```solidity
contract DAOGovernance {
  
  struct Proposal {
    uint256 id;
    address proposer;
    string description;
    uint256 forVotes;
    uint256 againstVotes;
    uint256 abstainVotes;
    uint256 deadline;
    bool executed;
  }
  
  mapping(uint256 => Proposal) public proposals;
  mapping(uint256 => mapping(address => bool)) public hasVoted;
  
  // Create proposal
  function createProposal(string memory description) 
    public returns (uint256)
  
  // Vote on proposal (0=Against, 1=For, 2=Abstain)
  function vote(uint256 proposalId, uint8 support) 
    public
  
  // Execute proposal (if passed)
  function executeProposal(uint256 proposalId) 
    public
}
```

**DAO Voting Flow:**

```
User creates proposal (DB + optional blockchain)
    ↓
Wallet linking required (Sign message to prove ownership)
    ↓
User votes (on-chain if BLOCKCHAIN_ENABLED=true)
    ↓
Backend syncs votes from blockchain → MongoDB
    ↓
Admin executes if proposal passes
```

### 6.2 Wallet Integration

**MetaMask Connection:**

```javascript
// Frontend: Connect Wallet
async function connectWallet() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return address;
}

// Backend: Verify Ownership
function linkWallet(req, res) {
  const { address, signature } = req.body;
  const message = `SkillForge Wallet Linking\nAddress: ${address}\nNonce: ${nonce}`;
  
  const recoveredAddress = ethers.verifyMessage(message, signature);
  
  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new Error("Invalid signature");
  }
  
  user.walletAddress = address.toLowerCase();
  user.walletVerifiedAt = new Date();
  await user.save();
}
```

### 6.3 Transaction Monitoring

**Blockchain Event Listener:**

```javascript
const contract = new ethers.Contract(contractAddress, abi, provider);

contract.on("CertificateMinted", async (tokenId, candidateHash, skillName) => {
  await Certificate.findOneAndUpdate(
    { candidateHash, skillName },
    { 
      nftMinted: true,
      tokenId: tokenId.toString(),
      chainTxHash: event.transactionHash,
      chainContractAddress: contractAddress,
      chainNetwork: "polygon-mumbai"
    }
  );
});
```

---

## 7. Assessment System

### 7.1 Assessment Architecture

**Components:**
1. Question Generator (AI)
2. Test Engine (Frontend)
3. Auto-Evaluator (Backend)
4. Anti-Cheating Layer
5. Certificate Issuer

### 7.2 Test Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ASSESSMENT TEST FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. SKILL SELECTION
   User selects skill (e.g., "React", "Python")
   ↓
   
2. QUESTION GENERATION
   Backend calls AI: "Generate 10 questions for React assessment"
   ↓
   AI returns JSON array of questions
   ↓
   Questions stored in DB with attemptId
   
3. TEST PRESENTATION
   Frontend fetches questions → Start timer (15 minutes)
   ↓
   Anti-cheating enabled:
   - Disable copy/paste
   - Detect tab switching
   - Warn user on suspicious activity
   
4. ANSWER SUBMISSION
   User submits answers → Backend receives
   ↓
   
5. AUTO-EVALUATION
   Backend compares selected answers with correct answers
   ↓
   Calculate:
   - Accuracy = (correct / total) × 100
   - Status = accuracy >= 70% ? "verified" : 
              accuracy >= 50% ? "partially_verified" : 
              "not_verified"
   
6. BLOCKCHAIN MINTING (if verified)
   If status === "verified":
   ↓
   Call CertificateRegistry.mintCertificate(hash, skillName)
   ↓
   Store transaction hash in DB
   ↓
   
7. RESULT DISPLAY
   Show user: Score, Verified Badge, Certificate ID
```

### 7.3 Anti-Cheating Mechanisms

**Frontend Guards:**
```javascript
// Disable copy-paste
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('paste', (e) => e.preventDefault());

// Detect tab switching
let tabSwitchCount = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    tabSwitchCount++;
    if (tabSwitchCount > 3) {
      alert("Test auto-submitted due to suspicious activity");
      submitTest();
    }
  }
});

// Disable right-click
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Full-screen enforcement
function enterFullScreen() {
  document.documentElement.requestFullscreen();
}
```

**Backend Validation:**
```javascript
// Time validation
const timeElapsed = (new Date() - attempt.startedAt) / 1000;
if (timeElapsed > 900) { // 15 min = 900 sec
  throw new Error("Time limit exceeded");
}

// Duplicate submission prevention
if (attempt.status === "submitted") {
  throw new Error("Test already submitted");
}

// Answer count validation
if (answers.length !== questions.length) {
  throw new Error("Invalid answer count");
}
```

### 7.4 Assessment Results Schema

```javascript
SkillAssessmentAttempt {
  userId: ObjectId,
  skillName: String,
  status: "pending" | "in_progress" | "submitted",
  verificationStatus: "verified" | "partially_verified" | "not_verified",
  
  questions: [{
    questionId: String,
    text: String,
    options: [String],
    correctAnswer: String
  }],
  
  answers: [{
    questionId: String,
    selectedAnswer: String
  }],
  
  accuracy: Number,        // 0-100
  correctCount: Number,
  totalCount: Number,
  
  startedAt: Date,
  submittedAt: Date,
  timeSpent: Number,       // seconds
  
  certificateId: ObjectId, // if verified
  nftMinted: Boolean
}
```

---

## 8. Database Models

### 8.1 User Collection

```javascript
User {
  // Authentication
  email: String (unique, required),
  password: String (hashed, select: false),
  role: "candidate" | "recruiter",
  emailVerified: Boolean,
  
  // Profile
  name: String,
  phone: String,
  avatar: String,
  headline: String,
  location: String,
  about: String,
  
  // Candidate-specific
  skills: [{
    name: String,
    level: Number,
    verified: Boolean
  }],
  
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String
  }],
  
  education: [{
    degree: String,
    institution: String,
    year: String,
    gpa: String
  }],
  
  certificates: [{
    name: String,
    issuer: String,
    date: String,
    nftMinted: Boolean,
    tokenId: String,
    verified: Boolean,
    chainTxHash: String,
    chainContractAddress: String
  }],
  
  // Resume
  resumeUrl: String,
  resumeFileName: String,
  resumeParsed: {
    textHash: String,
    provider: String,
    analyzedAt: Date,
    skills: [String],
    skillKeys: [String],
    headlineHint: String
  },
  
  // Blockchain
  walletAddress: String,
  walletVerifiedAt: Date,
  walletNonce: String (select: false),
  
  // Scores
  aiScore: Number,           // 0-100
  reputation: Number,        // 0-100
  yearsOfExperience: Number,
  
  // Settings
  settings: {
    darkMode: Boolean,
    language: String,
    twoFactorEnabled: Boolean,
    notifications: {
      email: Boolean,
      push: Boolean,
      applicationUpdates: Boolean,
      jobMatches: Boolean,
      securityAlerts: Boolean
    }
  },
  
  // Sessions
  activeSessions: [{
    token: String,
    device: String,
    location: String,
    ip: String,
    userAgent: String,
    createdAt: Date,
    lastActive: Date
  }],
  
  // Security
  otpHash: String (select: false),
  otpExpiry: Date (select: false),
  tokenInvalidBefore: Date,
  deletedAt: Date,
  
  savedJobs: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### 8.2 Job Collection

```javascript
Job {
  // Basic Info
  title: String (required),
  description: String,
  requirements: [String],
  
  // Company
  companyName: String,
  companyLogo: String,
  companyDescription: String,
  
  // Location
  location: String,
  type: "Full-time" | "Part-time" | "Contract" | "Remote",
  
  // Compensation
  salaryMin: Number,
  salaryMax: Number,
  currency: String,
  
  // Skills
  skills: [String],
  experienceLevel: String,
  
  // AI Requirements
  minAiScore: Number,        // Minimum AI score required
  requiredCertificates: [String],
  
  // Recruiter
  recruiterId: ObjectId (required),
  recruiterProfile: ObjectId,
  
  // Status
  status: "active" | "closed" | "draft",
  
  // Stats
  views: Number,
  applicantsCount: Number,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date
}
```

### 8.3 Application Collection

```javascript
Application {
  // References
  jobId: ObjectId (required),
  candidateId: ObjectId (required),
  recruiterId: ObjectId (required),
  
  // Match Score
  matchScore: Number,        // Calculated at apply time
  
  // Status
  status: "pending" | "shortlisted" | "rejected" | "interviewed" | "hired" | "withdrawn",
  
  // Cover Letter
  coverLetter: String,
  
  // Notes (recruiter-only)
  recruiterNotes: String,
  
  // Timeline
  appliedAt: Date,
  viewedAt: Date,
  statusChangedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

### 8.4 SkillAssessmentAttempt Collection

```javascript
SkillAssessmentAttempt {
  userId: ObjectId (required),
  skillName: String (required),
  
  status: "pending" | "in_progress" | "submitted",
  verificationStatus: "verified" | "partially_verified" | "not_verified",
  
  questions: [{
    questionId: String,
    text: String,
    options: [String],
    correctAnswer: String,
    difficulty: "easy" | "medium" | "hard"
  }],
  
  answers: [{
    questionId: String,
    selectedAnswer: String
  }],
  
  // Results
  accuracy: Number,
  correctCount: Number,
  totalCount: Number,
  
  // Timing
  startedAt: Date,
  submittedAt: Date,
  timeSpent: Number,
  
  // Certificate
  certificateId: ObjectId,
  nftMinted: Boolean,
  
  timestamp: Date
}
```

### 8.5 DAOProposal Collection

```javascript
DAOProposal {
  title: String (required),
  description: String (required),
  
  // Proposer
  proposerUserId: ObjectId,
  proposerLabel: String,
  
  // Status
  status: "active" | "executed" | "rejected" | "pending",
  
  // Voting
  forVotes: Number,
  againstVotes: Number,
  abstainVotes: Number,
  
  // Blockchain
  chainProposalId: String,
  chainTxHash: String,
  
  // Timeline
  createdAt: Date,
  deadline: Date,
  executedAt: Date,
  deletedAt: Date
}
```

### 8.6 RecruiterProfile Collection

```javascript
RecruiterProfile {
  userId: ObjectId (required, unique),
  
  // Company Info
  companyName: String,
  website: String,
  industry: String,
  size: String,
  about: String,
  logo: String,
  location: String,
  
  // Verification
  isVerified: Boolean,
  isComplete: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

### 8.7 Notification Collection

```javascript
Notification {
  userId: ObjectId (required),
  
  type: "application" | "job_match" | "assessment" | "message" | "system",
  title: String,
  message: String,
  
  // Optional references
  jobId: ObjectId,
  applicationId: ObjectId,
  
  read: Boolean,
  
  createdAt: Date
}
```

---

## 9. API Structure

### 9.1 Authentication APIs

```
POST   /api/auth/register          - User registration
POST   /api/auth/verify-otp        - Email OTP verification
POST   /api/auth/resend-otp        - Resend OTP
POST   /api/auth/login             - User login
POST   /api/auth/refresh-token     - Refresh JWT token
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with OTP
```

### 9.2 User Profile APIs

```
GET    /api/me                     - Get current user profile
PUT    /api/me                     - Update profile
POST   /api/me/avatar              - Upload avatar
POST   /api/me/resume              - Upload resume
POST   /api/me/ai-score/refresh    - Recalculate AI score

POST   /api/me/skills              - Add skill
PUT    /api/me/skills/:name        - Update skill
DELETE /api/me/skills/:name        - Delete skill

POST   /api/me/experience          - Add experience
PUT    /api/me/experience/:id      - Update experience
DELETE /api/me/experience/:id      - Delete experience

POST   /api/me/education           - Add education
PUT    /api/me/education/:id       - Update education
DELETE /api/me/education/:id       - Delete education

GET    /api/me/wallet/nonce        - Get wallet nonce for signing
POST   /api/me/wallet/link         - Link wallet with signature

GET    /api/me/saved-jobs          - Get saved jobs
```

### 9.3 Job APIs

```
GET    /api/jobs                   - List all jobs (public)
GET    /api/jobs/:id               - Get job details
GET    /api/jobs/matched           - Get AI-matched jobs (auth)
GET    /api/jobs/recommended       - Get recommended jobs
POST   /api/jobs/:id/save          - Save/unsave job
```

### 9.4 Recruiter Job APIs

```
POST   /api/recruiter/jobs         - Create job posting
GET    /api/recruiter/jobs         - List recruiter's jobs
GET    /api/recruiter/jobs/:id     - Get job details
PUT    /api/recruiter/jobs/:id     - Update job
DELETE /api/recruiter/jobs/:id     - Delete job
```

### 9.5 Application APIs

```
POST   /api/applications           - Apply to job
GET    /api/applications           - List applications (candidate)
GET    /api/applications/:id       - Get application details
PUT    /api/applications/:id       - Withdraw application
```

### 9.6 Recruiter Candidate APIs

```
GET    /api/recruiter/candidates   - List candidates with filters
GET    /api/recruiter/candidates/:id - Get candidate profile
```

### 9.7 Assessment APIs

```
POST   /api/assessments/start      - Start skill assessment
GET    /api/assessments/:attemptId - Get assessment questions
POST   /api/assessments/:attemptId/submit - Submit answers
GET    /api/assessments/history    - Get assessment history
```

### 9.8 Certificate APIs

```
GET    /api/certificates           - List user certificates
POST   /api/certificates/mint      - Mint NFT certificate
GET    /api/certificates/verify/:tokenId - Verify certificate
```

### 9.9 DAO APIs

```
GET    /api/dao/proposals          - List proposals
POST   /api/dao/proposals          - Create proposal
GET    /api/dao/proposals/:id      - Get proposal details
PATCH  /api/dao/proposals/:id      - Update proposal
DELETE /api/dao/proposals/:id      - Delete proposal
POST   /api/dao/proposals/:id/vote - Vote on proposal
POST   /api/dao/proposals/:id/status - Change proposal status
```

### 9.10 Settings APIs

```
GET    /api/settings               - Get user settings
PUT    /api/settings               - Update settings
POST   /api/settings/password      - Change password
GET    /api/settings/sessions      - Get active sessions
DELETE /api/settings/sessions/:id  - Revoke session
GET    /api/settings/wallet/stats  - Get wallet statistics
POST   /api/settings/delete-account - Delete account
```

---

## 10. Security Layer

### 10.1 Authentication Security

**JWT Token Strategy:**
```javascript
// Token Generation
const token = jwt.sign(
  { userId: user._id, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' }
);

// Token Validation
const decoded = jwt.verify(token, JWT_SECRET);
if (user.tokenInvalidBefore > decoded.iat) {
  throw new Error("Token invalidated");
}
```

**OTP System:**
- 6-digit random code
- Hashed storage (bcrypt)
- 10-minute expiry
- Rate limiting (max 3 attempts, max 5 resends/hour)
- Auto-cleanup on verification

**Password Security:**
- Bcrypt hashing (salt rounds: 10)
- Minimum 8 characters
- Password change invalidates all sessions

### 10.2 API Security

**Rate Limiting:**
```javascript
// Global rate limit
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max requests
  message: "Too many requests"
}));

// Login rate limit
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts"
}));
```

**CORS Configuration:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**Security Headers:**
```javascript
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginResourcePolicy: true
}));
```

### 10.3 Data Security

**Sensitive Field Protection:**
```javascript
// Never select password by default
password: { type: String, select: false }

// Manually select when needed
const user = await User.findById(id).select('+password');
```

**Input Sanitization:**
```javascript
// Escape HTML
import xss from 'xss';
const clean = xss(userInput);

// Validate email
import validator from 'validator';
if (!validator.isEmail(email)) {
  throw new Error("Invalid email");
}
```

**File Upload Security:**
```javascript
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Invalid file type"));
    }
    cb(null, true);
  }
});
```

### 10.4 Blockchain Security

**Wallet Ownership Verification:**
```javascript
// Sign deterministic message
const message = `SkillForge Wallet Linking
Address: ${address}
Nonce: ${nonce}
Sign this message to prove wallet ownership.`;

const recoveredAddress = ethers.verifyMessage(message, signature);
if (recoveredAddress !== address) {
  throw new Error("Invalid signature");
}
```

**Smart Contract Security:**
- OpenZeppelin libraries (audited)
- Access control (onlyOwner, onlyAdmin)
- Reentrancy guards
- Event emission for transparency
- Gas optimization

### 10.5 Anti-Fraud Measures

**Resume Fraud Detection:**
- Text hash comparison (detect duplicate resumes)
- Skill consistency checking (resume vs claimed skills)
- Experience validation (realistic timelines)

**Assessment Anti-Cheating:**
- Full-screen enforcement
- Tab-switch detection (max 3 warnings)
- Copy-paste disabled
- Right-click disabled
- Time tracking
- Question randomization
- Answer shuffling

**Application Spam Prevention:**
- Rate limit: Max 10 applications per day
- Duplicate application blocking
- Profile completion check (min 50%)

---

## 11. Admin Controls

### 11.1 User Management

**Features:**
- View all users (candidates + recruiters)
- Search/filter by role, status, verification
- Suspend/activate accounts
- View user activity logs
- Manually verify profiles

**API Endpoints (Future):**
```
GET    /api/admin/users            - List all users
GET    /api/admin/users/:id        - Get user details
PUT    /api/admin/users/:id/suspend - Suspend user
PUT    /api/admin/users/:id/verify  - Verify user
DELETE /api/admin/users/:id        - Delete user (soft)
```

### 11.2 Job Moderation

**Features:**
- Review flagged jobs
- Approve/reject job postings
- Edit job details
- Feature jobs (promoted listing)

### 11.3 Certificate Validation

**Features:**
- View all certificates
- Verify NFT minting status
- Revoke fraudulent certificates
- Bulk certificate audits

### 11.4 DAO Governance

**Features:**
- Create admin proposals
- Force-execute urgent proposals
- Change proposal status
- Delete spam proposals

### 11.5 Analytics Dashboard

**Metrics:**
- Total users (candidates vs recruiters)
- Active jobs vs closed
- Application conversion rate
- Assessment pass rate
- Blockchain transaction count
- Revenue tracking

**Visualizations:**
- User growth chart
- Job posting trends
- Skill demand heatmap
- Geographic distribution
- Revenue over time

---

## 12. Monetization Model

### 12.1 Freemium Model

**Free Tier (Candidates):**
- ✅ Profile creation
- ✅ Resume upload
- ✅ 3 free skill assessments/month
- ✅ Basic job search
- ✅ AI match scores
- ✅ 10 job applications/month

**Premium Tier (Candidates) - $19/month:**
- ✅ Unlimited skill assessments
- ✅ Unlimited job applications
- ✅ Priority in recruiter search
- ✅ Resume download analytics
- ✅ Advanced AI insights
- ✅ Profile boost

### 12.2 Recruiter Pricing

**Basic Plan - $99/month:**
- 5 job postings
- Access to verified candidates
- Basic candidate filtering
- 50 resume downloads/month

**Pro Plan - $299/month:**
- Unlimited job postings
- Advanced AI candidate ranking
- Unlimited resume downloads
- Featured job listings
- Blockchain certificate verification
- Priority support

**Enterprise Plan - Custom:**
- Dedicated account manager
- API access
- Custom integrations
- Bulk hiring tools
- Analytics dashboard
- White-label option

### 12.3 Pay-Per-Action

**Job Posting:**
- Single job post: $49
- Featured listing: $99
- Urgent hiring badge: $29

**Assessments:**
- Custom assessment creation: $199
- Bulk assessment credits: $0.50/test

**Candidate Unlocks:**
- Contact info reveal: $5/candidate
- Resume download: $2/resume

### 12.4 Blockchain Services

**Certificate Minting:**
- Platform-issued (included free)
- Third-party verification: $10/certificate
- Bulk minting: $5/certificate (min 50)

**DAO Participation:**
- Voting credits (free for token holders)
- Proposal creation fee: 10 tokens
- Featured proposals: 50 tokens

### 12.5 Revenue Streams Summary

```
Monthly Recurring Revenue (MRR):
├── Candidate Premium: $19 × N users
├── Recruiter Basic: $99 × M companies
├── Recruiter Pro: $299 × P companies
└── Enterprise: Custom

One-Time Revenue:
├── Job posting fees
├── Featured listings
├── Certificate verifications
└── Assessment credits

Transaction Fees:
├── Platform commission (future)
├── Blockchain gas fee markup
└── Payment processing (3%)
```

---

## 13. Future Scope

### 13.1 Advanced Features

**1. AI Interview Bot**
- Voice-based technical interviews
- Real-time code evaluation
- Behavioral analysis
- Auto-generate interview reports

**2. Decentralized Identity (DID)**
- Self-sovereign identity on blockchain
- Portable credentials across platforms
- Zero-knowledge proof verification
- Privacy-preserving hiring

**3. On-Chain Resume (IPFS)**
- Store resume hash on blockchain
- Content-addressed storage
- Version control
- Encrypted private data

**4. Multi-Chain Support**
- Ethereum mainnet
- Polygon (current)
- Arbitrum (Layer 2)
- Solana (high throughput)

**5. NFT Marketplace**
- Trade skill certificates
- Reputation tokens
- Achievement badges
- Course completion NFTs

### 13.2 Platform Enhancements

**1. Video Assessments**
- Record video answers
- AI-powered facial analysis
- Speech-to-text evaluation
- Confidence scoring

**2. Live Coding Tests**
- Real-time code editor
- Language support (JS, Python, Java, etc.)
- Test case execution
- Plagiarism detection

**3. Gamification**
- Skill badges and levels
- Leaderboards
- Daily challenges
- Referral rewards

**4. Social Features**
- Candidate networking
- Recruiter community
- Knowledge sharing
- Mentorship program

**5. Mobile App**
- React Native app
- Push notifications
- Job alerts
- Quick apply

### 13.3 Business Expansion

**1. International Markets**
- Multi-language support
- Regional compliance (GDPR, CCPA)
- Local payment gateways
- Currency conversion

**2. Industry Verticals**
- Healthcare hiring
- Finance sector
- Technology focus
- Remote-first jobs

**3. B2B Services**
- Recruitment agency portal
- College placement cell
- Government job portal
- Freelancer marketplace

**4. Educational Integration**
- University partnerships
- Skill certification programs
- Online courses + certificates
- Campus recruitment

### 13.4 Technical Roadmap

**Q1 2026:**
- ✅ Core platform launch
- ✅ AI resume parsing
- ✅ Skill assessments
- ✅ Blockchain certificates

**Q2 2026:**
- ⏳ Mobile app (iOS + Android)
- ⏳ Advanced analytics
- ⏳ Video interviews
- ⏳ Live coding tests

**Q3 2026:**
- 📋 DAO governance activation
- 📋 NFT marketplace
- 📋 AI interview bot
- 📋 Multi-chain support

**Q4 2026:**
- 📋 Decentralized identity
- 📋 On-chain resume
- 📋 International expansion
- 📋 Enterprise partnerships

---

## Appendix

### A. API Response Formats

**Success Response:**
```json
{
  "ok": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### B. Environment Variables

```bash
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/skillforge

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-key

# AI
OPENROUTER_API_KEY=sk-or-xxx
OPENAI_MODEL=openai/gpt-4

# Blockchain
BLOCKCHAIN_ENABLED=true
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/xxx
PRIVATE_KEY=0xabc123...
CERTIFICATE_CONTRACT_ADDRESS=0x123...

# Storage
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=xxx

# Frontend
FRONTEND_URL=https://skillforge.com
```

### C. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION SETUP                        │
└─────────────────────────────────────────────────────────────┘

Frontend (Render):
- React build deployed to Render
- CDN edge caching
- Automatic HTTPS
- Domain: app.skillforge.com

Backend (Render):
- Node.js API server
- Auto-scaling enabled
- Health checks (/health)
- Domain: api.skillforge.com

Database (MongoDB Atlas):
- M10 cluster (Production)
- Multi-region replica set
- Automated backups
- Monitoring enabled

Blockchain (Polygon):
- Mainnet deployment
- Alchemy RPC provider
- Gas optimization
- Event monitoring

Storage (Cloudinary):
- Image optimization
- CDN delivery
- Transformation API
- Video encoding (future)
```

### D. Contact & Support

**Development Team:**
- Lead Developer: [MD WASI AHMAD]
- Blockchain Engineer: [MD WASI AHMAD]
- AI/ML Engineer: [MD WASI AHMAD]

**Documentation:**
- GitHub: github.com/skillforge/platform
- Docs: docs.skillforge.com
- API Reference: api.skillforge.com/docs

**Support:**
- Email: support@skillforge.com
- Discord: discord.gg/skillforge
- Twitter: @skillforge

---

**Document Version:** 1.0  
**Last Updated:** February 11, 2026  
**Next Review:** Q2 2026  

© 2026 SkillForge Pro. All rights reserved.
