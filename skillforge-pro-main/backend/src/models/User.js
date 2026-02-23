import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },

    role: { type: String, required: true, enum: ["candidate", "recruiter", "admin"] },

    name: { type: String, default: "" },
    phone: { type: String, default: "" },

    // Frontend profile fields
    avatar: { type: String, default: "" },
    walletAddress: { type: String, default: "" },
    walletNonce: { type: String, default: "", select: false },
    walletVerifiedAt: { type: Date, default: null },
    headline: { type: String, default: "" },
    location: { type: String, default: "" },
    about: { type: String, default: "" },
    socials: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    settings: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: "en-US" },
      twoFactorEnabled: { type: Boolean, default: false },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
        applicationUpdates: { type: Boolean, default: true },
        jobMatches: { type: Boolean, default: true },
        securityAlerts: { type: Boolean, default: true },
      },
    },

    // Active sessions tracking (login history)
    activeSessions: {
      type: [
        {
          token: { type: String, required: true },
          device: { type: String, default: "" },
          location: { type: String, default: "" },
          ip: { type: String, default: "" },
          userAgent: { type: String, default: "" },
          createdAt: { type: Date, default: Date.now },
          lastActive: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    // Soft delete
    deletedAt: { type: Date, default: null },

    // Candidate-only (still stored here for simplicity)
    aiScore: { type: Number, default: null },
    reputation: { type: Number, default: null },
    yearsOfExperience: { type: Number, default: null },

    savedJobs: { type: [mongoose.Schema.Types.ObjectId], ref: "Job", default: [] },

    skills: {
      type: [
        {
          name: { type: String, required: true },
          level: { type: Number, required: true },
          verified: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    experience: {
      type: [
        {
          title: { type: String, required: true },
          company: { type: String, required: true },
          location: { type: String, required: true },
          startDate: { type: String, required: true },
          endDate: { type: String },
          current: { type: Boolean, default: false },
          description: { type: String, default: "" },
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          degree: { type: String, required: true },
          institution: { type: String, required: true },
          year: { type: String, required: true },
          gpa: { type: String },
        },
      ],
      default: [],
    },

    // Candidate resume (stored as an uploaded file URL)
    resumeUrl: { type: String, default: "" },
    resumeFileName: { type: String, default: "" },
    resumeMime: { type: String, default: "" },
    resumeUploadedAt: { type: Date, default: null },

    // Resume-derived profile signals (NOT verified skills)
    resumeParsed: {
      textHash: { type: String, default: "" },
      provider: { type: String, default: "" }, // "openrouter" | "openai" | "heuristic"
      analyzedAt: { type: Date, default: null },
      skills: { type: [String], default: [] },
      skillKeys: { type: [String], default: [] },
      headlineHint: { type: String, default: "" },
      locationHint: { type: String, default: "" },
      summary: { type: String, default: "" },
    },
    certificates: {
      type: [
        {
          name: { type: String, required: true },
          issuer: { type: String, required: true },
          date: { type: String, required: true },
          nftMinted: { type: Boolean, default: false },
          tokenId: { type: String },
          // Stored path/url for uploaded certificate file (image or pdf)
          image: { type: String, default: "" },
          fileName: { type: String, default: "" },
          fileMime: { type: String, default: "" },
          verified: { type: Boolean, default: false },

          // On-chain certificate registry metadata (no PII; stores only hash + tx)
          chainHash: { type: String, default: "" },
          chainTxHash: { type: String, default: "" },
          chainContractAddress: { type: String, default: "" },
          chainNetwork: { type: String, default: "" },
          chainIssuedAt: { type: Date, default: null },
        },
      ],
      default: [],
    },

    emailVerified: { type: Boolean, default: false },

    // Email verification (OTP) — account is not usable until verified
    otpHash: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpResendCount: { type: Number, default: 0, select: false },

    // Password reset (OTP)
    resetOtpHash: { type: String, select: false },
    resetOtpExpiry: { type: Date, select: false },
    resetOtpUsed: { type: Boolean, default: false, select: false },
    resetOtpAttempts: { type: Number, default: 0, select: false },

    // JWT session invalidation without changing payload
    tokenInvalidBefore: { type: Date, default: new Date(0), select: false },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model("User", UserSchema);
