import { clerkClient } from "@clerk/express";
import { log } from "console";
import { configDotenv } from "dotenv";
import { google } from "googleapis";

configDotenv();

const credentials = {
  web: {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: [process.env.REDIRECT_URI],
  },
};
// The web object contains your client ID, secret, and redirect URIs
const { client_id, client_secret, redirect_uris } = credentials.web;

// Initialize the client
const getClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  return oauth2Client;
};

export const getUserFromToken = async (token: string) => {
  const oauth2Client = getClient();
  oauth2Client.setCredentials({ access_token: token });

  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const userInfoResponse = await oauth2.userinfo.get();
  return userInfoResponse.data;
};

export async function getGoogleAccessToken(userId: string): Promise<string> {
  const tokens = await clerkClient.users.getUserOauthAccessToken(userId, "google");
  log("Tokens from Clerk:", JSON.stringify(tokens));

  if (!tokens || tokens.data.length === 0) {
    throw new Error("User not connected with Google");
  }
  return tokens.data[0].token;
}


