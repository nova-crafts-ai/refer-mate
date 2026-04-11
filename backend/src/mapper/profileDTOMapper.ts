import { ProfileRequest } from "../schema/profileSchema.js";

export const toProfileDTO = (profile: any): ProfileRequest | null => {
  if (!profile) return null;

  return {
    summary: profile.summary,
    education: profile.education,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phoneNo: profile.phoneNo,
    status: profile.status,
    credits: profile.credits,
    skills: profile.profileSkills.map((ps: any) => ({ name: ps.Skills?.name })),
    experience: profile.experiences.map((exp: any) => ({
      role: exp.role,
      company: exp.companyName,
      startDate: exp.startDate?.toISOString(),
      endDate: exp.endDate?.toISOString(),
      description: exp.description
    })),
  };
};
