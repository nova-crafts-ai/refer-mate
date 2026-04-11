import { Router } from "express";
import { deleteMessage, editMessage, generateMessage, getMessage, getMessageTypes, sendMessageViaGmail } from "../controller/messageController.js";

import { validate } from "../middlleware/schemaValidator.js";
import { GenerateMailSchema } from "../schema/mailSchema.js";
import { MessageRequestSchema, SendMailSchema } from "../schema/messageSchema.js";
import z from "zod";

const messageRoutes = Router();

// NOTE: This is an LLM call also ambigious if we should have this here or not
messageRoutes.post("/", validate({ body: GenerateMailSchema }), generateMessage);
messageRoutes.get("/types", getMessageTypes);

// NOTE: This just sends the mail to the user via gmail and updates the status of the message to sent
messageRoutes.post("/:id/send", validate({ body: SendMailSchema, params: z.object({ id: z.coerce.number() }) }), sendMessageViaGmail);

messageRoutes.patch("/:id", validate({ body: MessageRequestSchema, params: z.object({ id: z.coerce.number() }) }), editMessage);
messageRoutes.get("/:id", validate({ params: z.object({ id: z.coerce.number() }) }), getMessage);
messageRoutes.delete("/:id", validate({ params: z.object({ id: z.coerce.number() }) }), deleteMessage);

export default messageRoutes;