// filepath: src/utils/emailService.ts
import nodemailer from "nodemailer";

// Keep a cached instance so we don't recreate the connection pool on every email
let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const isGmail = smtpHost.includes("gmail");
    const requestedPort = process.env.SMTP_PORT
      ? Number(process.env.SMTP_PORT)
      : undefined;
    const smtpPort = isGmail ? 465 : requestedPort || 587;
    const smtpSecure = smtpPort === 465;

    console.log(
      `[Email Service] SMTP host=${smtpHost}, port=${smtpPort}, secure=${smtpSecure}`,
    );

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      dnsFamily: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
};

export const sendSystemEmail = async (
  to: string,
  subject: string,
  bodyText: string,
  replyTo?: string,
) => {
  try {
    const client = getTransporter(); // Safely pulls the initialized SMTP configuration

    const mailOptions: any = {
      from: `"EFP-PSO System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: bodyText,
      html: `<div style="font-family: sans-serif; color: #1A304A; padding: 20px;">
              <h2>${subject}</h2>
              <p style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${bodyText}</p>
             </div>`, // Added 'white-space: pre-line' to preserve your bilingual linebreaks nicely!
    };

    // If a replyTo is provided, add it so recipients can reply directly to the sender
    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }

    await client.sendMail(mailOptions);

    console.log(`[Email Dispatcher]: Message delivered successfully to ${to}`);
  } catch (error) {
    console.error(
      `[Email Dispatcher Failure]: Could not send email to ${to}:`,
      error,
    );
  }
};
