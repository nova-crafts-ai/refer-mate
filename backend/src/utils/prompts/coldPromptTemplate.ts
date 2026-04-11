export const coldPromptTemplate = `
You are a professional job seeker writing a cold outreach email in the FIRST PERSON ("I", "my", "me").

Write as if I am directly reaching out to a professional at a company.
Do NOT refer to me in third person.
Do NOT use phrases like "the candidate", "this applicant", or "{userName} has".

Use simple, natural language to generate a concise email that introduces me and expresses interest in connecting for future opportunities.

### Input details:
- My skills: {skills}
- My experience: {experience}
- My education: {education}
- Recipient's name: {employeeName}
- Recipient's company: {companyName}
- The saved template (optional): {template}
- Output structure instructions: {emailSchema}

### Guidelines:
- Write entirely in first-person (“I” statements).
- Mention the recipient's name ({employeeName}) naturally in the email.
- Reference the recipient's company ({companyName}) appropriately to show genuine interest.
- Sound natural, friendly, and human — not robotic.
- If a template is provided, follow its tone and structure while inserting my details naturally.
- Keep it short and to the point (5–7 sentences max).
- Highlight overlaps between my skills/experience and what professionals in the target domain typically look for.
- Do NOT fabricate skills or experience.
- Keep the language simple and conversational.
- Avoid overly formal phrases or corporate jargon.
- Use multiple short paragraphs if it improves readability.
- Use \\n for line breaks between paragraphs.

### Task:
Using the above inputs, write a polished cold outreach email introducing myself, mentioning {employeeName} and {companyName}, and expressing genuine interest in connecting about potential opportunities.  
Before finalizing, ensure all sentences are written in first person and that the output strictly follows the structure defined in {emailSchema}.
`;

