// filepath: src/test-notification.ts
import * as dotenv from "dotenv";
import path from "path";

// 1. Force load the environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { sendSystemEmail } from "./utils/emailService";

async function verifyEmailPipelineDirectly() {
  const targetEmail = "mulunaworku42@gmail.com";

  console.log("==================================================");
  console.log("[Direct SMTP Test]: Initializing Pipeline Handshake");
  console.log(`- Authenticating As: ${process.env.SMTP_USER}`);
  console.log(`- Delivering To: ${targetEmail}`);
  console.log("==================================================");

  const subject = "EFP-PSO Direct SMTP Pipeline Verification";
  const bodyText = `Hello! 

If you are reading this email, your background email utility, environment configuration mappings, and Google SMTP App Password variables are fully operational.

Timestamp: ${new Date().toISOString()}`;

  console.log(
    "[Direct SMTP Test]: Contacting smtp.gmail.com:587... (Waiting for server response)",
  );

  // By using 'await' here, we force the script to stay alive until Gmail gives a final answer!
  await sendSystemEmail(targetEmail, subject, bodyText);

  console.log("==================================================");
  console.log("[Direct SMTP Test]: Verification process concluded.");
  console.log("==================================================");
}

verifyEmailPipelineDirectly();
