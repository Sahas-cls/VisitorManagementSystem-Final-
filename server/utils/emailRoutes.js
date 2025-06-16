import express from 'express';
import { sendEmail } from './emailService.js';

const router = express.Router();

router.post('/send-test-email', async (req, res) => {
  try {
    await sendEmail(
      'yasiruconcord@gmail.com',
      'Hello World',
      '<p>Congrats on sending your <strong>first email</strong>!</p>'
    );
    res.status(200).json({ message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

export default router;
