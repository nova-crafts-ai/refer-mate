interface ExtractSkills {
    name: string;
    email: string;
    phone: string;
    experience: string;
    skills: string[];
    noticePeriod?: string | undefined;
    achievements?: string[] | undefined;
}

export default ExtractSkills;