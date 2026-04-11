import EmailType from "../types/MessageType.js";

export const mapEmailTypeToDB = (type: EmailType.COLD | EmailType.TAILORED) => {
  const map = {
    [EmailType.COLD]: "COLD",
    [EmailType.TAILORED]: "TAILORED",
  } as const;

  return map[type];
};
