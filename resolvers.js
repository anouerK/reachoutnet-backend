/* eslint-disable complexity */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userpermission, authorize } = require("./middleware/userpermission");
const { GraphQLError } = require("graphql");
const nodemailer = require("nodemailer");
const resolvers = {
    Query: {
        users: async (_, __, { dataSources, req }) => {
            await authorize(userpermission.VIEW_USER_MODULE)(req);
            const users = await dataSources.userAPI.getAllUsers();
            return users;
        },

        user: async (_, { id }, { dataSources, req }) => {
            await authorize(userpermission.VIEW_USER_MODULE)(req);
            const User = dataSources.userAPI;
            const user = await User.findOnebyId(id);
            return user;
        }

    },
    Mutation: {
        addFollow: async (_, { followerId, followerType, followingId, followingType }, { dataSources, req }) => {
            const Follow = dataSources.userAPI;
            const follow = {
                followerId,
                followerType,
                followingId,
                followingType
            };
            const savedFollow = await Follow.createFollow(follow);

            return savedFollow;
        },

        unFollow: async (_, { id }, { dataSources, req }) => { // delete Follow
            try {
                // await authorize(userpermission.POST_MODULE_CRUDS)(req);
                const Follow = dataSources.userAPI;

                const follow = await Follow.deleteFollow(id);
                if (!follow) {
                    throw new GraphQLError("Follow not found");
                }
                return follow;
            } catch (error) {
                console.error(error);
                throw new GraphQLError("Failed to delete Follow");
            }
        },

        addUser: async (_, { username, firstname, lastname, age, email, password, permissions }, { dataSources, req }) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            const User = dataSources.userAPI;
            const user = {
                username,
                firstname,
                lastname,
                age,
                email,
                password: hashedPassword,
                permissions
            };
            await authorize(userpermission.POST_MODULE_CRUDS)(req);
            const saveduser = await User.createUser(user);

            return saveduser;
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

        async login (_, { email, password }, { dataSources }) {
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
                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                    expiresIn: "24h"
                });

                return { user, token };
            } catch (error) {
                console.error(error);
                throw new GraphQLError("Authentication failed");
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
        addInterest: async (_, { id, nameInterest, description }, { dataSources, req }) => {
            // await authorize(userpermission.POST_MODULE_CRUDS)(req);
            const Interest = dataSources.userAPI;
            const interest = {
                id,
                nameInterest,
                description
            };
            const savedInterest = await Interest.createInterest(interest);

            return savedInterest;
        },
        deleteInterest: async (_, { id }, { dataSources, req }) => {
            try {
                // await authorize(userpermission.POST_MODULE_CRUDS)(req);
                const Interest = dataSources.userAPI;

                const interest = await Interest.deleteInterest(id);
                if (!interest) {
                    throw new GraphQLError("Interest not found");
                }
                console.log(interest);
                return interest;
            } catch (error) {
                console.error(error);
                throw new GraphQLError("Failed to delete Interest");
            }
        }
        //   // Add any other mutation resolvers here
    }

};

module.exports = resolvers;
