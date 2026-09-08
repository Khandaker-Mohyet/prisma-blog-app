import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
      try {
        const info = await transporter.sendMail({
          from: '"Example Team" <team@example.com>', // sender address
          to: user.email, // list of recipients
          subject: "Please verify your email", // subject line
          text: "Hello world?", // plain text body
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f7fb;
  font-family: Arial, Helvetica, sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color: #f4f7fb; padding: 40px 15px;">

    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0"
          border="0"
          style="
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          ">

          <!-- Header -->
          <tr>
            <td align="center"
              style="
                background-color: #2563eb;
                padding: 30px 20px;
              ">

              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 28px;
                font-weight: 700;
              ">
                Example Team
              </h1>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px;">

              <h2 style="
                margin: 0 0 20px;
                color: #111827;
                font-size: 24px;
              ">
                Verify your email address
              </h2>

              <p style="
                margin: 0 0 15px;
                color: #4b5563;
                font-size: 16px;
                line-height: 1.6;
              ">
                Hello,
              </p>

              <p style="
                margin: 0 0 25px;
                color: #4b5563;
                font-size: 16px;
                line-height: 1.6;
              ">
                Thank you for creating an account with us. 
                Please verify your email address by clicking the button below.
              </p>

              <!-- Verification Button -->
              <table cellpadding="0" cellspacing="0" border="0"
                style="margin: 0 auto 25px;">

                <tr>
                  <td align="center"
                    style="
                      background-color: #2563eb;
                      border-radius: 8px;
                    ">

                    <a href="${verificationUrl}"
                      target="_blank"
                      style="
                        display: inline-block;
                        padding: 14px 28px;
                        color: #ffffff;
                        background-color: #2563eb;
                        text-decoration: none;
                        font-size: 16px;
                        font-weight: 600;
                        border-radius: 8px;
                      ">
                      Verify My Email
                    </a>

                  </td>
                </tr>

              </table>

              <p style="
                margin: 0 0 15px;
                color: #6b7280;
                font-size: 14px;
                line-height: 1.6;
              ">
                This verification link will expire in 
                <strong>24 hours</strong>.
              </p>

              <p style="
                margin: 0 0 10px;
                color: #6b7280;
                font-size: 14px;
                line-height: 1.6;
              ">
                If the button above doesn't work, copy and paste the
                following URL into your browser:
              </p>

              <p style="
                margin: 0 0 25px;
                padding: 12px;
                background-color: #f3f4f6;
                border-radius: 6px;
                word-break: break-all;
                font-size: 13px;
                color: #374151;
              ">
                ${verificationUrl}
              </p>

              <p style="
                margin: 0;
                color: #6b7280;
                font-size: 14px;
                line-height: 1.6;
              ">
                If you didn't create an account, you can safely ignore
                this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="
                padding: 20px 30px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
              ">

              <p style="
                margin: 0 0 8px;
                color: #6b7280;
                font-size: 13px;
              ">
                © 2026 Example Team. All rights reserved.
              </p>

              <p style="
                margin: 0;
                color: #9ca3af;
                font-size: 12px;
              ">
                This is an automated email. Please do not reply.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>
</html>
  `, // HTML body
        });

        console.log("Message sent: %s", info.messageId);
      } catch (error: any) {
        console.log(error.message)
        throw error
      }
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
    },
  },
});