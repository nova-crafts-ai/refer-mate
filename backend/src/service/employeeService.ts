import { Prisma } from "@prisma/client";
import { GenerateMailRequest } from "../types/GenerateMailRequest.js";
import MessageType from "../types/MessageType.js";
import { logger } from "../utils/logger.js";

export async function upsertEmployee(
  tx: Prisma.TransactionClient,
  req: GenerateMailRequest
) {

  if (req.type === MessageType.FOLLOW_UP || req.type === MessageType.THANK_YOU) {
    logger.info("Skipping employee upsert for follow-up or thank you email");
    return;
  }

  if (req.contactEmail?.trim()) {
    try {
      logger.info(`Upserting employee with email: ${req.contactEmail}`);
      return tx.employee.upsert({
        where: { email: req.contactEmail },
        update: {
          name: req.contactName,
          company: req.companyName,
          position: req.role ?? undefined,
        },
        create: {
          name: req.contactName,
          email: req.contactEmail,
          company: req.companyName,
          position: req.role ?? "",
        },
      });
    } catch (error: any) {
      logger.error(`Error upserting employee with email: ${req.contactEmail}`, error);
      if (error.code === 'P2002') {
        logger.info(`Employee with email: ${req.contactEmail} already exists`);
        return tx.employee.findUnique({ where: { email: req.contactEmail } });
      }
      throw error;
    }
  }
  logger.warn(`Creating new employee without email: ${req.contactName}`);
  return tx.employee.create({
    data: {
      name: req.contactName,
      company: req.companyName,
      position: req.role ?? "",
    },
  });
}
