import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { TemplateCard } from "./TemplateCard";
import { ROUTES } from "@/lib/consts/routesConsts";

export interface Template {
  id: string;
  name: string;
  content: string;
}

export const templates = [
  {
    id: "COLD",
    name: "Cold",
    content: "Reach out to new contacts you haven't connected with before",
  },
  {
    id: "TAILORED",
    name: "Tailored",
    content: "Personalized outreach based on your profile and their background",
  },
];

const SelectTemplatePage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>();
  const navigate = useNavigate();

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template.");
      return;
    }
    navigate(
      `${ROUTES.OUTREACH.RECIPIENT_INFO.fullPath}?template=${selectedTemplate.id}`,
    );
  };

  return (
    <div className="animate-fadeIn space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate?.id === template.id}
            onSelect={handleSelectTemplate}
          />
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleContinue} className="w-full sm:w-auto">
          Continue
          <ArrowRight className="w-4 h-4 ml-1 -mr-1" />
        </Button>
      </div>
    </div>
  );
};

export default SelectTemplatePage;
