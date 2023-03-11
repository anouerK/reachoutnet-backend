/* eslint-disable no-unreachable-loop */
/* eslint-disable no-undef */
/* eslint-disable complexity */
const bcrypt = require("bcryptjs");
const { isValidObjectId } = require("mongoose");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const { userpermission, authorize } = require("./middleware/userpermission");
const { GraphQLError } = require("graphql");
const nodemailer = require("nodemailer");
// eslint-disable-next-line no-unused-vars
const user = require("./datasources/user");
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
        },
        // Skill query //
        skillId: async (_, { id }, { dataSources, req }) => {
            const Skill = dataSources.userAPI;
            const skill = await Skill.getSkillById(id);
            return skill;
        },
        skillName: async (_, { name }, { dataSources, req }) => {
            const Skill = dataSources.userAPI;
            const skill = await Skill.getSkillByName(name);
            return skill;
        },
        skills: async (_, __, { dataSources, req }) => {
            const Skill = dataSources.userAPI;
            const skills = await Skill.getAllSkills();
            return skills;
        },
        // end Skill query //

        // follow qury //
        follow: async (_, { id1, id2 }, { dataSources, req }) => {
            const Follow = dataSources.userAPI;
            const follower1 = await Follow.getFollower(id1, id2);
            const followingRelation1 = await Follow.getFollowingRelation(id2, id1);
            if (follower1 && followingRelation1) {
                console.log("User 1 and User 2 are following each other");
            } else if (follower1 && !followingRelation1) {
                console.log("User 1 is following User 2, but User 2 is not following User 1");
            } else if (followingRelation1 && !follower1) {
                console.log("User 2 is following User 1, but User 1 is not following User 2");
            } else {
                console.log("User 1 and User 2 are not following each other");
            }
        },
        follows: async (_, { id }, { dataSources, req }) => {
            await authorize(userpermission.LOGGED)(req);
            const Follow = dataSources.userAPI;
            const followingIds = await Follow.getAllUsers();

            followingIds.forEach(async (followingId) => {
                const follower = await Follow.getFollower(id, followingId);
                const followingRelation = await Follow.getFollowingRelation(followingId, id);

                if (follower && followingRelation) {
                    // followbacks.push(followingId);
                    console.log("2 users are following");
                } else if (follower && !followingRelation) {
                    // following.push(followingId);
                    console.log("this user only following + unfollow");
                } else if (followingRelation && !follower) {
                    // followed.push(followingId);
                    console.log("followback");
                } else {
                    // The two users are not following each other
                    console.log("no follow relation between 2 users");
                }
            });
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
        // end follow mutaion //

        /// /////////////// Skill mutations  ///////////////////////////

        addSkill: async (_, { name, description }, { dataSources, req }) => { // allow admins to add skill
            const skill = {
                name,
                description
            };
            const savedSkill = await dataSources.userAPI.addSkill(skill);
            return savedSkill;
        },
        updateSkill: async (_, args, { dataSources, req }) => { // allow admins to update skill
            const Skill = dataSources.userAPI;
            const { id, ...updateData } = args;
            const skill = await Skill.updateSkill(id, updateData, { new: true });
            return skill;
        },
        deleteSkill: async (_, { id }, { dataSources, req }) => { // allow admins to update skill and delete the skills in users
            try {
                const User = dataSources.userAPI;
                const Skill = dataSources.userAPI;
                const skill = await Skill.deleteSkill(id);
                const users = await User.getAllUsers();
                if (!skill) {
                    throw new GraphQLError("Skill not found");
                }

                users.forEach(async (user) => {
                    user.skills = await user.skills.filter(skill => skill.skill.toString() !== id);
                    await user.save();
                });

                return skill;
            } catch (error) {
                console.error(error);
                throw new GraphQLError("Failed to delete Skill");
            }
        },

        addUserSkill: async (_, { id, skillsToAdd }, { dataSources, req }) => { // allow users to add a skill
            const User = dataSources.userAPI;
            try {
                const user = await User.findOnebyId(id).populate("skills.skill");
                if (!user) {
                    throw new Error("User not found");
                }
                skillsToAdd.forEach((skillToAdd) => {
                    if (skillToAdd.skill != null) {
                        // eslint-disable-next-line no-unused-vars
                        const existingSkill = user.skills.find(
                            (skill) => skill.skill._id.toString() === skillToAdd.skill);

                        /* if (existingSkill) {
                       existingSkill.level = skillToAdd.level;
                        existingSkill.verified = skillToAdd.verified;
                        existingSkill.last_modified = new Date(); */
                        if (!existingSkill) {
                            user.skills.push({
                                skill: skillToAdd.skill
                            });
                        }
                    }
                });
                await user.save();
                return user;
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        deleteUserSkill: async (_, { id, skillId }, { dataSources, req }) => { // allow users to delete a skill
            try {
                const User = dataSources.userAPI;
                const user = await User.findOnebyId(id);
                if (!user) throw new Error("User not found");
                // Filter out the skill with the given skillId
                user.skills = user.skills.filter(skill => skill.skill.toString() !== skillId);
                await user.save();
                return user;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        /// /////////////// end of  Skill mutations  ///////////////////////////

        addUser: async (_, { username, first_name, last_name, age, email, password, skills, permissions }, { dataSources, req }) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            const User = dataSources.userAPI;
            const user = {
                username,
                first_name,
                last_name,
                age,
                email,
                password: hashedPassword,
                skills,
                permissions
            };
            await authorize(userpermission.POST_MODULE_CRUDS)(req);
            const saveduser = await User.createUser(user);

            return saveduser;
        },
        Signup: async (_, { username, first_name, last_name, age, email, password, skills }, { dataSources, req }) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            const User = dataSources.userAPI;
            const user = {
                username,
                first_name,
                last_name,
                age,
                email,
                password: hashedPassword,
                skills,
                permissions: 0
            };
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
        generateOtp: async (_, { id }, { dataSources, req }) => {
            await authorize(userpermission.POST_MODULE_CRUDS)(req);
            if (!isValidObjectId(id)) { return new GraphQLError("Invalid User ID"); }

            const user = await dataSources.userAPI.findOne({ _id: id });
            if (user.has_otp) { return new GraphQLError("OTP already exists for this user"); }
            const { base32 } = speakeasy.generateSecret({
                issuer: "ReachOutNet",
                name: "ReachOutNet",
                length: 20
            });
            const otp = await dataSources.userAPI.createOtp(id, base32);
            if (!otp) { return new GraphQLError("Failed to create OTP"); }
            const updated_user = await dataSources.userAPI.updateUser(id, { has_otp: true });
            if (!updated_user) { return new GraphQLError("Failed to update user"); }
            return otp;
        },

        verifyOtp: async (_, { id, token }, { dataSources, req }) => {
            await authorize(userpermission.POST_MODULE_CRUDS)(req);
            if (!isValidObjectId(id)) { return new GraphQLError("Invalid User ID"); }
            if (!token || isNaN(token)) { return new GraphQLError("Invalid Token"); }

            const otp = await dataSources.userAPI.findOneOtp({ userId: id });
            if (!otp) { return new GraphQLError("OTP not found"); }

            const verified = speakeasy.totp.verify({
                secret: otp.base32,
                encoding: "base32",
                token
            });

            if (!verified) {
                return new GraphQLError("Invalid OTP");
            }
            const updated_otp = await dataSources.userAPI.updateOtp(otp._id, { verified: true, last_modified: Date.now() });

            if (!updated_otp) { return new GraphQLError("Failed to update OTP"); }

            return updated_otp;
        },
        validateOtp: async (_, { id, token }, { dataSources, req }) => {
            await authorize(userpermission.POST_MODULE_CRUDS)(req);
            if (!isValidObjectId(id)) { return new GraphQLError("Invalid User ID"); }
            if (!token || isNaN(token)) { return new GraphQLError("Invalid Token"); }
            const otp = await dataSources.userAPI.findOneOtp({ userId: id });
            if (!otp) { return new GraphQLError("OTP not found"); }
            const valid_token = speakeasy.totp.verify({
                secret: otp.base32,
                encoding: "base32",
                token,
                window: 1
            });
            if (!valid_token) { return new GraphQLError("Invalid OTP"); }
            ;
            return otp;
        },
        disableOtp: async (_, { id }, { dataSources, req }) => {
            await authorize(userpermission.POST_MODULE_CRUDS)(req);
            if (!isValidObjectId(id)) { return new GraphQLError("Invalid User ID"); }
            const user = await dataSources.userAPI.findOne({ _id: id });
            if (!user) { return new GraphQLError("User not found"); }

            const otp = await dataSources.userAPI.updateOtp(id, { enabled: false, last_modified: Date.now() });
            if (!otp) { return new GraphQLError("OTP not found"); }

            const updated_user = await dataSources.userAPI.updateUser(id, { has_otp: false });
            if (!updated_user) { return new GraphQLError("Failed to update user"); }
            return updated_user;
        },
        deleteOtp: async (_, { id }, { dataSources, req }) => {
            await authorize(userpermission.POST_MODULE_CRUDS)(req);
            if (!isValidObjectId(id)) { return new GraphQLError("Invalid User ID"); }
            const user = await dataSources.userAPI.findOne({ _id: id });
            if (!user) { return new GraphQLError("User not found"); }

            const otp = await dataSources.userAPI.deleteOtp(id);
            if (!otp) { return new GraphQLError("OTP not found"); }

            const updated_user = await dataSources.userAPI.updateUser(id, { has_otp: false });
            if (!updated_user) { return new GraphQLError("Failed to update user"); }
            return updated_user;
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
        },
        updateInterest: async (_, args, { dataSources, req }) => {
            const User = dataSources.userAPI;
            const { id, ...updateData } = args;
            const existingInterest = await User.getInterest(id);
            if (!existingInterest) {
                throw new GraphQLError("Interest not found");
            }
            const interest = await User.updateInterest(id, updateData);

            return interest;
        }
    }

};

module.exports = resolvers;
