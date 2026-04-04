import GenerateMessage from "@/components/function/generate-message-button";
import { Button } from "@/components/ui/button";
import { GenerateMessageReq, MessageType } from "@/lib/types/messagesTypes";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { templates } from "../select-template";
import { RecipientForm } from "./RecipientForm";
import { ROUTES } from "@/lib/consts/routesConsts";

export interface FormData {
  employeeName?: string;
  employeeEmail?: string;
  companyName?: string;
  role?: string;
  jobIds?: string[];
  jobDescription?: string;
}

export type FormDataErrors = Partial<Record<keyof FormData, string>>;

const RecipientInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateType = searchParams.get("template");

  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormDataErrors>({});

  // useEffect(() => {
  //   const { company, employee } = location.state || {};
  //   if (company) {
  //     setRecipientInfo((prev) => ({
  //       ...prev,
  //       companyName: company.name,
  //     }));
  //   }
  //   if (employee) {
  //     setRecipientInfo((prev) => ({
  //       ...prev,
  //       employeeName: employee.name,
  //       employeeEmail: employee.email || "",
  //     }));
  //   }
  // }, [location.state]);

  const validateForm = () => {
    const newErrors: FormDataErrors = {};
    if (!formData.employeeName)
      newErrors.employeeName = "Employee name is required";
    if (!formData.employeeEmail)
      newErrors.employeeEmail = "Employee email is required";
    if (!formData.companyName)
      newErrors.companyName = "Company name is required";

    if (templateType !== "COLD" && !formData.jobIds?.length)
      newErrors.jobIds = "At least one job is required for tailored messages";
    if (templateType !== "COLD" && !formData.jobDescription)
      newErrors.jobDescription = "Job description is required";

    setErrors(newErrors);
    return newErrors;
  };

  const handleGenerate = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    let messageReq: GenerateMessageReq = {
      type: MessageType.COLD,
      companyName: formData.companyName!,
      contactEmail: formData.employeeEmail!,
      contactName: formData.employeeName!,
      role: formData.role!,
    };

    if (templateType === "TAILORED") {
      messageReq = {
        ...messageReq,
        type: MessageType.TAILORED,
        jobs: formData.jobIds!,
        jobDescription: formData.jobDescription || "",
      };
    }

    return messageReq;
  };

  useEffect(() => {
    if (!templateType || !templates.some((t) => t.id === templateType)) {
      toast.error("Template ID is missing. Please start over.");
      navigate(ROUTES.OUTREACH.TEMPLATES.fullPath);
    }
  }, [navigate, templateType]);

  if (!templateType || !templates.some((t) => t.id === templateType)) {
    return null;
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <RecipientForm
        formData={formData}
        onChange={setFormData}
        errors={errors}
        templateType={templateType}
      />

      <div className="flex items-end justify-between pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate(ROUTES.OUTREACH.TEMPLATES.fullPath)}
        >
          <ArrowLeft className="w-4 h-4 mr-1 -ml-1" />
          Back
        </Button>
        <GenerateMessage onGenerate={handleGenerate} />
      </div>
    </div>
  );
};

export default RecipientInfoPage;
