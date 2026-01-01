import { transporter } from "./Email.confiq.js";
import { Verification_Email_Template, Welcome_Email_Template, Reset_Password_Template } from "./EmailTemplate.js"; // Added reset template

export const sendVerificationEmail = async (email, verificationCode) => { // Fixed typo
    try {
        await transporter.sendMail({
            from: '"Online Exam" <patlePrajju@gmail.com>',
            to: email,
            subject: "Verify your Email",
            html: Verification_Email_Template.replace("{verificationCode}", verificationCode)
        });
        console.log('Verification email sent');
    } catch (error) {
        console.error('Verification email error:', error);
    }
};

export const sendWelcomeEmail = async (email, name) => { // Fixed typo
    try {
        await transporter.sendMail({
            from: '"Online Exam" <patlePrajju@gmail.com>',
            to: email,
            subject: "Welcome to Online Exam System",
            html: Welcome_Email_Template.replace("{name}", name)
        });
        console.log('Welcome email sent');
    } catch (error) {
        console.error('Welcome email error:', error);
    }
};

export const sendResetPasswordEmail = async (email, resetToken) => {
    try {
        await transporter.sendMail({
            from: '"Online Exam" <patlePrajju@gmail.com>',
            to: email,
            subject: "Reset Your Password",
            html: Reset_Password_Template.replace("{resetToken}", resetToken)
        });
        console.log('Reset password email sent');
    } catch (error) {
        console.error('Reset password email error:', error);
    }
};