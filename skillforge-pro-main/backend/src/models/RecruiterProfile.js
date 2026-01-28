import mongoose from "mongoose";

const RecruiterProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    companyName: { type: String, default: "" },
    website: { type: String, default: "" },
    industry: { type: String, default: "" },
    size: { type: String, default: "" },
    about: { type: String, default: "" },
    logo: { type: String, default: "" },
    location: { type: String, default: "" },

    isComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export function computeRecruiterProfileComplete({ user, profile }) {
  const recruiterNameOk = Boolean(user?.name && user.name.trim().length >= 2);
  const recruiterEmailOk = Boolean(user?.email);
  const recruiterPhoneOk = Boolean(user?.phone && user.phone.trim().length >= 6);

  const companyNameOk = Boolean(profile?.companyName && profile.companyName.trim().length >= 2);
  const websiteOk = Boolean(profile?.website && profile.website.trim().length >= 4);
  const industryOk = Boolean(profile?.industry && profile.industry.trim().length >= 2);
  const sizeOk = Boolean(profile?.size && profile.size.trim().length >= 1);
  const aboutOk = Boolean(profile?.about && profile.about.trim().length >= 10);
  const locationOk = Boolean(profile?.location && profile.location.trim().length >= 2);

  return (
    recruiterNameOk &&
    recruiterEmailOk &&
    recruiterPhoneOk &&
    companyNameOk &&
    websiteOk &&
    industryOk &&
    sizeOk &&
    aboutOk &&
    locationOk
  );
}

export const RecruiterProfile = mongoose.model("RecruiterProfile", RecruiterProfileSchema);
