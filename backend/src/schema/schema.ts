import { z } from "zod";

const emailSchema = z.object({
    subject : z.string().describe('Subject line relevant to the job and candidate'),
    body : z.string().describe('Email body')
})

export {emailSchema};