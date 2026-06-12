const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendApplicationEmail = async (
  recruiterEmail,
  applicant,
  job
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recruiterEmail,
    subject: `New Application for ${job.title}`,

    html: `
      <h2>New Job Application</h2>

      <p><b>Applicant:</b> ${applicant.fullName}</p>
      <p><b>Email:</b> ${applicant.email}</p>
      <p><b>Phone:</b> ${applicant.phone}</p>

      <hr>

      <p><b>Job:</b> ${job.title}</p>
      <p><b>Company:</b> ${job.company}</p>
    `,
  });
};

module.exports = { sendApplicationEmail };