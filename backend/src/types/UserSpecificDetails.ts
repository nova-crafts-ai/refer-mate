import ExtractSkills from "./ExtractSkills.js";

interface UserSpecificDetails extends ExtractSkills {
    jobId?: string;
    hrName?: string;
    companyName?: string;
}

export default UserSpecificDetails;
