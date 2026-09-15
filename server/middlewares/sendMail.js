import { createTransport } from "nodemailer";

export const sendMail = async (email, subject, data) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });


const isResetEmail = Boolean(data.resetUrl);
const html = isResetEmail ? `
<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#20252b;">
  <h2>Reset your E-learning password</h2>
  <p>Hello <b>${data.name}</b>,</p>
  <p>Use the button below to choose a new password. This link expires in 15 minutes.</p>
  <p><a href="${data.resetUrl}" style="display:inline-block;padding:12px 20px;background:#e26d4d;color:#fff;text-decoration:none;border-radius:5px;">Reset password</a></p>
  <p>If you did not request this, you can ignore this email.</p>
</body></html>
` : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="400" cellpadding="0" cellspacing="0" 
          style="background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0; color:#4f46e5;">🔐 Verify Your Account</h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td align="center" style="color:#555; font-size:15px; line-height:22px;">
              Hello <b>${data.name}</b>, <br><br>
              Use the OTP below to complete your verification.  
              This code is valid for <b>5 minutes</b>.
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding:25px 0;">
              <div style="
                display:inline-block;
                padding:15px 30px;
                font-size:32px;
                letter-spacing:5px;
                font-weight:bold;
                color:#ffffff;
                background:linear-gradient(135deg, #6366f1, #7c3aed);
                border-radius:10px;
              ">
                ${data.otp}
              </div>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td align="center" style="color:#888; font-size:13px;">
              If you didn’t request this, you can safely ignore this email.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:25px; font-size:12px; color:#aaa;">
              © 2026 Your App • All rights reserved
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject,
    html,
  });
};

//export default sendMail;