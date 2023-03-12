/* eslint-disable no-unused-vars */
const nodemailer = require("nodemailer");
const { GraphQLError } = require("graphql");

const joi = require("joi");
const transporter = nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 587,
    auth: {
        user: "postmaster@sandbox84a605850c1d47d09d0039b338b2cde8.mailgun.org",
        pass: "5964295aa5098eba0804a1d476535f23-7764770b-2e7e277c"
    }
});

const validate_data = (data) => {
    const schema = joi.object({
        // required
        email: joi.string().email().required(),
        subject: joi.string().min(1).max(100).required(),
        // non required
        from: joi.string().email(),
        text: joi.string().min(1)
        // html: joi.string().min(1)
    });
    const { error, value } = schema.validate(data);

    return { value, error };
};

// eslint-disable-next-line complexity
const send_email = async (data) => {
    const { value, error } = validate_data(data);

    if (error) { throw new GraphQLError(error); }

    const { subject, email, text, html } = value;

    const content = text || html;

    const mailOptions = {
        from: "test-i1spy2zrk@srv1.mail-tester.com",
        to: `${email}`,
        subject,
        html: content
    };

    const info = await transporter.sendMail(mailOptions);
    if (!info) { return new GraphQLError("Email not sent"); }
};

module.exports = send_email;
