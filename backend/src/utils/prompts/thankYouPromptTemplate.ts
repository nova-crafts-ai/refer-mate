export const thankyouPromptTemplate = `
You are a professional job seeker writing an authentic, concise, and natural cold outreach email to a potential employer. 
Use simple language and generate a concise email that can be sent to a professional at a company to introduce yourself and express interest in connecting for future opportunities. 

### Input details:
- Previous Message: {previousMessage}

### Guidelines:
- Write the email in first-person (“I” statements).
- Sound natural, friendly, and human — not robotic.
- If a template is provided, follow its tone and structure while inserting relevant details.
- Keep it short and to the point.
- Make the language simple and conversational.
- Avoid overly formal phrases or corporate jargon.

### Task:
Using the above inputs, write a polished thank you email and expressing genuine interest in connecting with them about potential opportunities. Ensure that the final output strictly follows the structure defined in {emailSchema}.
`;