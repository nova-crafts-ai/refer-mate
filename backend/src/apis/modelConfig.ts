import { BaseChatModel } from "@langchain/core/language_models/chat_models"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

interface ModelConfig {
    name: string,
    apiKey: string,
    factory: () => BaseChatModel
}

const modelConfigs: ModelConfig[] = [
    {
        name: "gemini",
        apiKey: process.env.GEMINI_API_KEY!,
        factory: () => new ChatGoogleGenerativeAI({
            model: 'gemini-2.5-flash-lite',
            apiKey: process.env.GEMINI_API_KEY,
            temperature: 0.3,
            maxRetries: 2
        })
    },
    {
        name: "openai",
        apiKey: process.env.OPENAI_API_KEY!,
        factory: () => new ChatOpenAI({
            model: 'gpt-4o-mini',
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0.3,
            maxRetries: 2
        })
    }
]

export default modelConfigs;