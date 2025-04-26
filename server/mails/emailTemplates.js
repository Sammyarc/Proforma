export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {name},</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Proforma</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {name},</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Proforma</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {name},</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Proforma</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Proforma</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to Our Service!</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {name},</p>
    <p>Thank you for signing up! We're excited to have you on board.</p>
    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
    <p>Best regards,<br>Proforma</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
    </div>
    </div>
</body>
</html>
`;


export const PAYMENT_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Invoice from {companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; border: 0; border-spacing: 0; background-color: #ffffff;">
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 15px 10px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
                                <!-- Greeting -->
                                <tr>
                                    <td style="padding: 0 0 20px 0;">
                                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Hello {clientName},</p>
                                    </td>
                                </tr>
                                
                                <!-- Main Message -->
                                <tr>
                                    <td style="padding: 0 0 20px 0;">
                                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Thank you for your business. Your invoice {invoiceNumber} for {description} is attached to this email. The total amount due is {invoiceAmount}.</p>
                                    </td>
                                </tr>
                                
                                <!-- Invoice Summary -->
                                <tr>
                                    <td style="padding: 15px 0;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #dddddd; margin-bottom: 20px;">
                                            <tr>
                                                <th style="padding: 10px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dddddd; font-size: 14px;">Invoice Number:</th>
                                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dddddd; font-size: 14px;">{invoiceNumber}</td>
                                            </tr>
                                            <tr>
                                                <th style="padding: 10px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dddddd; font-size: 14px;">Issue Date:</th>
                                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dddddd; font-size: 14px;">{invoiceDate}</td>
                                            </tr>
                                            <tr>
                                                <th style="padding: 10px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dddddd; font-size: 14px;">Due Date:</th>
                                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dddddd; font-size: 14px;">{dueDate}</td>
                                            </tr>
                                            <tr>
                                                <th style="padding: 10px; text-align: left; background-color: #f8f9fa; font-size: 16px; font-weight: bold;">Total Amount:</th>
                                                <td style="padding: 10px; text-align: right; font-size: 16px; font-weight: bold;">{invoiceAmount}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                

                                <tr>
                                    <td style="padding: 20px 0;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
                                            <tr>
                                                <td style="text-align: center;">
                                                    <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 24px;">To make payment, please click the button below:</p>
                                                    <a href="{paymentLink}" style="background-color: #1d604b; border: none; color: white; padding: 12px 28px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; font-weight: bold; border-radius: 4px;">Pay Invoice Now</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding: 20px 0 0 0;">
                                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Please review the attached PDF for a detailed breakdown of your invoice.</p>
                                        <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px;">If you have any questions about this invoice, please contact us at <a href="mailto:{companyAddress}" style="color: #1d604b; text-decoration: underline;">{companyAddress}</a>.</p>
                                    </td>
                                </tr>
                                
                                <!-- Thank You Message -->
                                <tr>
                                    <td style="padding: 25px 0 0 0;">
                                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Thank you for your business.</p>
                                        <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px;">Best regards,<br>Proforma Team</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
