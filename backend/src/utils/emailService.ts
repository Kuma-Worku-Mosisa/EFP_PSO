// filepath: src/utils/emailService.ts
import nodemailer from "nodemailer";

// Keep a cached instance so we don't recreate the connection pool on every email
let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendSystemEmail = async (
  to: string,
  subject: string,
  bodyText: string,
) => {
  try {
    const client = getTransporter(); // Safely pulls the initialized SMTP configuration

    await client.sendMail({
      from: `"EFP-PSO System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: bodyText,
      html: `<div style="font-family: sans-serif; color: #1A304A; padding: 20px;">
              <h2>${subject}</h2>
              <p style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${bodyText}</p>
             </div>`, // Added 'white-space: pre-line' to preserve your bilingual linebreaks nicely!
    });

    console.log(`[Email Dispatcher]: Message delivered successfully to ${to}`);
  } catch (error) {
    console.error(
      `[Email Dispatcher Failure]: Could not send email to ${to}:`,
      error,
    );
  }
};
