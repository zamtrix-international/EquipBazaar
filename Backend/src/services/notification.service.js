/**
 * Notification Service (Optional)
 * Handles email, SMS, and push notifications
 */
const nodemailer = require("nodemailer");
const { logger } = require("../utils/logger");

const hasEmailConfig =
  process.env.EMAIL_SERVICE &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASSWORD &&
  process.env.EMAIL_FROM;

const emailTransporter = hasEmailConfig
  ? nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  : null;

/**
 * Send email notification
 */
const sendEmailNotification = async (to, subject, template, data = {}) => {
  try {
    if (!emailTransporter) {
      logger.warn("Email transporter is not configured. Skipping email send.", {
        to,
        subject,
      });
      return { sent: false, reason: "email_not_configured" };
    }

    const htmlContent = typeof template === "function" ? template(data) : template;

    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
    });

    logger.info(`Email sent to ${to}`);
    return { sent: true };
  } catch (error) {
    logger.error(`Email notification failed: ${error.message}`);
    throw error;
  }
};

/**
 * Send SMS notification
 */
const sendSmsNotification = async (phoneNumber, message) => {
  try {
    logger.info(`SMS placeholder triggered for ${phoneNumber}`);
    return { sent: false, reason: "sms_provider_not_configured" };
  } catch (error) {
    logger.error(`SMS notification failed: ${error.message}`);
    throw error;
  }
};

/**
 * Send push notification
 */
const sendPushNotification = async (
  deviceToken,
  title,
  message,
  data = {}
) => {
  try {
    logger.info("Push placeholder triggered", {
      deviceToken,
      title,
      hasData: Boolean(data && Object.keys(data).length),
    });

    return { sent: false, reason: "push_provider_not_configured" };
  } catch (error) {
    logger.error(`Push notification failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendEmailNotification,
  sendSmsNotification,
  sendPushNotification,
};
