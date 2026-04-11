import { Message } from "../schema/messageSchema.js";

export const toMessageDTO = (message: any): Message => {
    return {
        subject: message.subject,
        body: message.body,
        threadId: message.threadId,
        id: message.id,
        date: message.date ? message.date.toISOString() : null,
        fromUser: message.fromUser,
        status: message.status,
    };
}