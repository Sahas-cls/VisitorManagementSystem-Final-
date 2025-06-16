//import { Resend } from 'resend';
const { Resend } =  require('resend')

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY); // Store key in .env

async function sendEmail(to, subject, html) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev', // Set this in .env
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend API error:', error);
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message
      };
    }

    console.log('Email sent successfully. ID:', data.id);
    return {
      success: true,
      message: 'Email sent successfully',
      data: data
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      message: 'Unexpected error occurred',
      error: error.message
    };
  }
}

module.exports = {sendEmail};
//export { sendEmail }; // ES Modules export
