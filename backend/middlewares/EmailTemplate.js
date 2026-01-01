export const Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #ddd; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; font-size: 26px; font-weight: bold; }
          .content { padding: 30px; text-align: center; }
          .code { background-color: #f0f0f0; padding: 20px; font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 4px; margin: 20px 0; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #777; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Email Verification</div>
          <div class="content">
              <h2>Hello!</h2>
              <p>Thank you for signing up. Please use the code below to verify your email address:</p>
              <div class="code">{verificationCode}</div>
              <p>This code will expire in 1 hour.</p>
              <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
              &copy; ${new Date().getFullYear()} Online Exam System. All rights reserved.
          </div>
      </div>
  </body>
  </html>
`;

export const Welcome_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome!</title>
      <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #ddd; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; font-size: 26px; font-weight: bold; }
          .content { padding: 30px; text-align: center; }
          .button { display: inline-block; background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #777; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Welcome to Online Exam System</div>
          <div class="content">
              <p class="welcome-message">Hello {name},</p>
              <p>We’re thrilled to have you join us! Your registration was successful, and we’re committed to providing you with the best experience possible.</p>
              <p>Here’s how you can get started:</p>
              <ul>
                  <li>Explore our features and customize your experience.</li>
                  <li>Stay informed by checking out our blog for the latest updates and tips.</li>
                  <li>Reach out to our support team if you have any questions or need assistance.</li>
              </ul>
              <a href="#" class="button">Get Started</a>
              <p>If you need any help, don’t hesitate to contact us. We’re here to support you every step of the way.</p>
          </div>
          <div class="footer">
              &copy; ${new Date().getFullYear()} Online Exam System. All rights reserved.
          </div>
      </div>
  </body>
  </html>
`;

export const Reset_Password_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: auto; background: white; padding: 20px; }
        .code { font-size: 24px; color: #d9534f; font-weight: bold; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>Use this code to reset your password:</p>
        <div class="code">{resetToken}</div>
        <p>This code will expire in 1 hour.</p>
    </div>
</body>
</html>`;