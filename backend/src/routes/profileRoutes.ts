import express from 'express';
import { extractStats, getProfile, rechargeCredits, updateProfile, uploadResume } from '../controller/profileController.js';
import { validate } from '../middlleware/schemaValidator.js';
import { CreditsSchema, ProfileSchema } from '../schema/profileSchema.js';

const profileRouter = express.Router();

profileRouter.get('/', getProfile);
profileRouter.patch('/', validate({ body: ProfileSchema }), updateProfile);
profileRouter.put('/resume', uploadResume);
profileRouter.post('/credits/transaction', validate({ body: CreditsSchema }), rechargeCredits);
profileRouter.get('/stats', extractStats);

export default profileRouter;
