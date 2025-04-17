const { MailtrapClient } = require("mailtrap");

async function sendEmail() {
  const client = new MailtrapClient({ token: TOKEN });

  await client.send({
    from: { email: "" },
    to: [{ email: "" }],
    subject: "",
    text: "",
  });
}
