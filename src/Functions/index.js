const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();

// Set your SendGrid API key
sgMail.setApiKey('YOUR_SENDGRID_API_KEY');

exports.sendEmail = functions.https.onCall(async (data, context) => {
  const { template, contacts } = data;

  const messages = contacts.map(contact => ({
    to: contact.email,
    from: 'your-email@example.com', // Verified sender
    subject: template.title,
    html: template.content,
  }));

  try {
    await sgMail.send(messages);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('unknown', 'Failed to send email', error);
  }
});
