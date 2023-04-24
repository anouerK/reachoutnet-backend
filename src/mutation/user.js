const bcrypt = require("bcryptjs");
const { isauthenticated, authorize, userpermission } = require("../../middleware/userpermission");
const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET } = process.env;
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const https = require("https");
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const send_email = require("../../middleware/send_email");
const { sendConfirmationEmail } = require("../../datasources/nodemailer.config");
const AuthLog = require("../../datasources/authlog");
const user_mutation = {

    addUser: async (_, { username, first_name, last_name, birthdate, email, password, skills, permissions, country }, { dataSources, req }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const User = dataSources.userAPI;
        const user = {
            username,
            first_name,
            last_name,
            birthdate,
            email,
            password: hashedPassword,
            skills,
            permissions,
            country
        };
        await authorize(userpermission.POST_MODULE_CRUDS)(req);
        const saveduser = await User.createUser(user);

        return saveduser;
    },
    Signup: async (_, { username, first_name, last_name, birthdate, email, password, skills, country }, { dataSources, req }) => {
        const User = dataSources.userAPI;
        const existing_user = await User.findOne({ email });
        if (existing_user) {
            throw new Error("Email already used");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const activationCode = uuidv4(); // generate activation code
        const user = {
            username,
            first_name,
            last_name,
            birthdate,
            email,
            password: hashedPassword,
            skills,
            permissions: 0,
            is_verified: false,
            country,
            activationCode // add activation code to user object
        };
        await sendConfirmationEmail(email, activationCode); // send confirmation email
        const saveduser = await User.createUser(user);

        return saveduser; // return user object
    },
    activate: async (_, { activationCode }, { dataSources, req }) => {
        try {
            const User = dataSources.userAPI;
            // Trouver l'utilisateur avec le code de confirmation donné
            const user = await User.findUserByConfirmationCode(activationCode);
            // Si l'utilisateur existe, mettre à jour le champ "confirmed"
            if (user) {
                user.is_verified = true;
                const updateduser = await User.updateUser(user.id, user);
                return updateduser;
            } else {
                throw new Error("User Not Found");
            }
        } catch (error) {
            console.error(error);
            throw new Error("Failed to activate user account.");
        }
    },
    updateUser: async (_, args, { dataSources, req }) => {
        const User = dataSources.userAPI;
        await authorize(userpermission.POST_MODULE_CRUDS)(req);
        const { id, ...updateData } = args;
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        const user = await User.updateUser(id, updateData, { new: true });
        return user;
    },

    updatePersonal: async (_, args, { dataSources, req }) => {
        const users = await isauthenticated()(req);
        const id = users.id;
        const User = dataSources.userAPI;
        const updateData = args;
        const user = await User.updateUser(id, updateData, { new: true });
        return user;
    },

    deleteUser: async (_, { id }, { dataSources, req }) => {
        try {
            await authorize(userpermission.POST_MODULE_CRUDS)(req);
            const User = dataSources.userAPI;

            const user = await User.deleteUser(id);
            if (!user) {
                throw new GraphQLError("User not found");
            }
            return user;
        } catch (error) {
            console.error(error);
            throw new GraphQLError("Failed to delete user");
        }
    },
    async login (_, { email, password }, { dataSources, req }) {
        try {
            const User = dataSources.userAPI;

            const user = await User.findOne({ email });
            if (!user) {
                throw new GraphQLError("Invalid login credentials");
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new GraphQLError("Invalid login credentials");
            }
            if (!user.is_verified) { throw new GraphQLError("Please Verify Your Email"); }
            if (user.banned) { throw new GraphQLError("Your Account is Banned"); }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: "24h"
            });
            // Retrieve the userAgent from the headers
            const userAgent = req.headers["user-agent"];
            // Retrieve the IP address from the request object
            const ip = req.ip;
            // Add the auth log to the database
            await AuthLog.create({ user: user._id, userAgent, ip, action: "login" });
            // console.log(res);
            // res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
            return { user, token };
        } catch (error) {
            // console.error(error);
            if (error.message === "Please Verify Your Email") {
                throw new GraphQLError("Please Verify Your Email.");
            } else if (error.message === "Your Account is Banned") { throw new GraphQLError("Your Account is Banned"); } else {
                throw new GraphQLError("Authentication failed");
            }
        }
    },
    async loginLinkedin (_, { authorization }, { res, dataSources }) {
        const options = {
            hostname: "www.linkedin.com",
            path: `https://www.linkedin.com/oauth/v2/accessToken?code=${authorization}&grant_type=authorization_code&client_id=${LINKEDIN_CLIENT_ID}&client_secret=${LINKEDIN_CLIENT_SECRET}&redirect_uri=http://localhost:3001/linkedin`,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
        let first_name = "";
        let last_name = "";
        // Make the first request to get the access token
        const access_token = await new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                let data = "";
                res.on("data", d => {
                    data += d;
                });
                res.on("end", () => {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData.access_token);
                });
            });

            req.on("error", error => {
                console.error(error);
                reject(error);
            });

            req.end();
        });

        // Make the second request using the access token
        const options2 = {
            hostname: "api.linkedin.com",
            path: "/v2/me",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`
            }
        };

        const parsedData = await new Promise((resolve, reject) => {
            const req2 = https.request(options2, res => {
                let data = "";
                res.on("data", d => {
                    data += d;
                });
                res.on("end", () => {
                    const parsedData = JSON.parse(data);
                    // console.log(parsedData);
                    resolve(parsedData);
                });
            });

            req2.on("error", error => {
                console.error(error);
                reject(error);
            });

            req2.end();
        });

        // Extract data from the second request
        first_name = parsedData.localizedFirstName;
        last_name = parsedData.localizedLastName;

        const email = parsedData.id;
        const User = dataSources.userAPI;
        const fullname = first_name + last_name;
        // const dnt = Date.now;
        const user = await User.findOne({ email });
        const hashed_password = await bcrypt.hash(fullname + email, 10);

        if (!user) {
            const usersave = {
                username: fullname,
                first_name,
                last_name,
                email,
                password: hashed_password,
                permissions: 0,
                is_verified: true
            };

            const saveduser = await User.createUser(usersave);
            const token = jwt.sign({ userId: saveduser._id }, process.env.JWT_SECRET, {
                expiresIn: "24h"
            });
            return { saveduser, token }; // return user object
        } else {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
            return { user, token };
        }
    },

    sendEmail: async (_, { name, email, link }) => {
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "1e4e4ab9f494c2",
                pass: "f732cc405c2ed7"
            }
        });

        const mailOptions = {
            from: "skandergrami@gmail.com",
            to: "recipient-email@example.com",
            subject: "New message from your website",
            text: `Name: ${name}\nEmail: ${email}\nLink: ${link}`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent: ${info.response}`);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    RequestResetPassword: async (_, { email }, { dataSources, req }) => {
        const joischema = Joi.object({
            email: Joi.string().email().required()
        });
        const { error, value } = joischema.validate({ email });

        if (error) { return new GraphQLError(error.message); }
        const user = await dataSources.userAPI.findOne({ email: value.email });
        if (!user) { return new GraphQLError("User not found"); }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        await send_email({ email: user.email, subject: "Reset Password", html: "click this link to reset your password link:http://localhost:3001/forgot?token=" + token });
        return true;
    },
    ResetPassword: async (_, { password, token }, { dataSources }) => {
        const joischema = Joi.object({
            password: Joi.string().min(8).required(),
            token: Joi.string().required()
        });

        const { error, value } = joischema.validate({ password, token });

        if (error) { return new GraphQLError(error); }

        const validatetoken = jwt.verify(value.token, process.env.JWT_SECRET);

        if (!validatetoken) { return new GraphQLError("Invalid Token"); }

        const user = await dataSources.userAPI.findOne({ _id: validatetoken.id });
        if (!user) { return new GraphQLError("User not found"); }

        const hashed_password = await bcrypt.hash(value.password, 10);
        const updated_user = await dataSources.userAPI.updateUser(user._id, { password: hashed_password });
        if (!updated_user) { return new GraphQLError("Failed to update user"); }
        return true;
    },
    SignUPInGmail: async (_, { username, first_name, last_name, email, provider, image }, { dataSources, req }) => {
        try {
            const User = dataSources.userAPI;
            const user = await User.findOne({ email });
            if (!user) {
                const userN = {
                    username,
                    first_name,
                    last_name,
                    email,
                    permissions: 0,
                    is_verified: true,
                    provider,
                    profile_picture: image
                };

                const user = await User.createUser(userN);

                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                    expiresIn: "24h"
                });
                return { user, token }; // return user object
            }
            if (!user.is_verified) { throw new GraphQLError("Please Verify Your Email"); }
            if (user.banned) { throw new GraphQLError("Your Account is Banned"); }
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: "24h"
            });
            return { user, token };
        } catch (error) {
            // console.error(error);
            if (error.message === "Please Verify Your Email") {
                throw new GraphQLError("Please Verify Your Email.");
            } else if (error.message === "Your Account is Banned") { throw new GraphQLError("Your Account is Banned"); } else {
                throw new GraphQLError("Authentication failed");
            }
        }
    },
    updateUserProfilePicture: async (_, { picture }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const joischema = Joi.object({
            picture: Joi.string().required()
        });

        const { error, value } = joischema.validate({ picture });

        if (error) { return new GraphQLError(error); }
        if (!user) { throw new GraphQLError("User not found"); }

        const updated_picture = await dataSources.userAPI.updateUserProfilePicture(user._id, value.picture);
        if (!updated_picture) { throw new GraphQLError("Failed to update user profile image"); }

        return updated_picture;
    },
    updateUserProfileCoverPicture: async (_, { picture }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const joischema = Joi.object({
            picture: Joi.string().required()
        });

        const { error, value } = joischema.validate({ picture });

        if (error) { return new GraphQLError(error); }
        if (!user) { throw new GraphQLError("User not found"); }

        const updated_picture = await dataSources.userAPI.updateUserProfileCoverPicture(user._id, value.picture);
        if (!updated_picture) { throw new GraphQLError("Failed to update user profile image"); }

        return updated_picture;
    }

};
module.exports = user_mutation;
