import { Job } from "../schema/threadSchema.js";

export const toJobDTO = (job: any): Job => {

    return {
        title: job.title,
        description: job.description ?? null,
        jobId: job.jobId ?? null,
        company: job.company
    };
}