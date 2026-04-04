import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { CheckCircle } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { SkillsSection } from "./SkillsSection";
// import { ProjectsSection } from "./ProjectsSection";
import { useProfileActions } from "@/hooks/profile/useProfileActions";
import { useProfile } from "@/hooks/profile/useProfileData";
import { Experience, Skill } from "@/lib/types/profileTypes";
import { useNavigate } from "react-router";
import Layout from "../Layout";
import { ROUTES } from "@/lib/consts/routesConsts";

// TODO:
// 1. On click of edit on any data, edit form should open there itself and not at the bottom
// 2. Properly validate with the correct type. Use zod schema.
// 3. Add "I currently work here in experiences"

export default function ProfessionalInfoPage() {
  const navigate = useNavigate();

  const MAX_POLL_COUNT = 6;
  const [pollCount, setPollCount] = useState(0);

  const { data: profile, isPolling } = useProfile({
    maxPoll: MAX_POLL_COUNT,
    pollCount,
    setPollCount,
  });
  const { updateProfile } = useProfileActions();

  const [skills, setSkills] = useState<Skill[]>([]);
  // const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useLayoutEffect(() => {
    if (profile?.status === "PARTIAL" || profile?.status === "INCOMPLETE") {
      setSkills(profile.skills || []);
      // setProjects(profile.projects || []);
      setEducation(profile.education || []);
      setExperiences(profile.experience || []);
    }
  }, [profile]);

  const handleFinish = () => {
    updateProfile.mutate(
      {
        skills,
        // projects,
        education,
        experience: experiences,
        status: "COMPLETE",
      },
      {
        onSuccess: () => {
          navigate(ROUTES.DASHBOARD.fullPath);
        },
      },
    );
  };

  if (profile?.status === "PROCESSING" && isPolling) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <div className="flex flex-col gap-1 justify-center items-center">
            <p className="text-lg font-medium">We are processing your resume</p>
            <p className="text-sm text-muted-foreground">
              Please wait for a while. This may take a few moments
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout
      header="Professional Details"
      description="Add your professional background to complete your profile."
    >
      <div className="space-y-6">
        <SkillsSection skills={skills} setSkills={setSkills} />
        <ExperienceSection
          experiences={experiences}
          setExperiences={setExperiences}
        />
        {/* <ProjectsSection projects={projects} setProjects={setProjects} /> */}
        <EducationSection educations={education} setEducations={setEducation} />
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          className="flex-1 rounded-full"
          onClick={() => {
            navigate(ROUTES.ONBOARDING.BASIC_INFO.fullPath);
          }}
        >
          Back
        </Button>
        <Button
          onClick={handleFinish}
          className="flex-1 rounded-full"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <Loader className="w-4 h-4 mr-2" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Complete Setup
        </Button>
      </div>
    </Layout>
  );
}
