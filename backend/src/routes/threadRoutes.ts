import { Router } from "express";
import { getThread, getThreads, patchThread } from "../controller/threadController.js";

import { validate } from "../middlleware/schemaValidator.js";
import { ThreadMetaParamsSchema, UpdateThreadSchema } from "../schema/threadSchema.js";
import z from "zod";

const threadRoutes = Router();

threadRoutes.get("/", validate({ query: ThreadMetaParamsSchema }), getThreads);
threadRoutes.get("/:id", validate({ params: z.object({ id: z.coerce.number() }) }), getThread);
threadRoutes.patch("/:id", validate({ body: UpdateThreadSchema, params: z.object({ id: z.coerce.number() }) }), patchThread);

export default threadRoutes;