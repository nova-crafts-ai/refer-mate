import { GenerateMailRequest } from "../../types/GenerateMailRequest.js";
import { coldEmailStrategy } from "./strategy/coldEmail.js";
import { followupEmailStrategy } from "./strategy/followupMail.js";
import { tailoredEmailStrategy } from "./strategy/tailoredEmailStrategy.js";
import { thankyouEmailStrategy } from "./strategy/thankyouMail.js";

type EmailStrategyFunction = (req: GenerateMailRequest) => Promise<any>;

export const emailStrategy: Record<string, EmailStrategyFunction> = {
    cold: coldEmailStrategy as unknown as EmailStrategyFunction,
    tailored: tailoredEmailStrategy as unknown as EmailStrategyFunction,
    followup: followupEmailStrategy as unknown as EmailStrategyFunction,
    thankyou: thankyouEmailStrategy as unknown as EmailStrategyFunction,
};
