/* eslint-disable no-unused-vars */
const nodemailer = require("nodemailer");
const { GraphQLError } = require("graphql");
require("dotenv").config();

const joi = require("joi");
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) { throw new GraphQLError("Email credentials not found"); }

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
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
