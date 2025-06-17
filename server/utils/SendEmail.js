const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY); // Make sure this is in your .env file

async function sendEmail(to, subject, text) {
  let recipients;

  
  if (typeof to === "string") {
    recipients = to.split(",").map(email => email.trim());
  } else if (Array.isArray(to)) {
    recipients = to;
  } else {
    console.error("Invalid 'to' format:", to);
    return {
      success: false,
      message: "Invalid recipient format",
    };
  }

  try {
    const result = await resend.emails.send({
      from: "Concord VMS <vms@guston-dev.site>", // ✅ Must match your verified domain
      to: recipients,
      subject: subject,
      html: text,
    });

    // 🔍 Debug Logs
    console.log("Resend response:", result);
    console.log("Recipients:", recipients);

    // ✅ Success condition fixed
    if (result?.data?.id) {
      return {
        success: true,
        message: "Email sent successfully",
      };
    } else {
      return {
        success: false,
        message: "Email send attempted, but no ID returned.",
      };
    }

  } catch (error) {
    console.error("Error sending email:");
    console.error(error?.response?.data || error.message || error);
    return {
      success: false,
      message: "Failed to send email",
    };
  }
}

module.exports = sendEmail;
