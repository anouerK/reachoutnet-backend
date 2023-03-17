/* eslint-disable complexity */
const speakeasy = require("speakeasy");
const { GraphQLError } = require("graphql");
const { isValidObjectId } = require("mongoose");
const { isauthenticated } = require("../../middleware/userpermission");
const otp_mutation = {
    generateOtp: async (_, __, { dataSources, req }) => {
        const user = await isauthenticated()(req);

        if (user.has_otp) { return new GraphQLError("OTP already exists for this user"); }

        const { base32 } = speakeasy.generateSecret({
            issuer: "ReachOutNet",
            name: "ReachOutNet",
            length: 20
        });
        const otp = await dataSources.userAPI.createOtp(user._id, base32);

        if (!otp) { return new GraphQLError("Failed to create OTP"); }
        const updated_user = await dataSources.userAPI.updateUser(user._id, { has_otp: true });

        if (!updated_user) { return new GraphQLError("Failed to update user"); }
        return otp;
    },
    validateOtp: async (_, { token }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        if (!token || isNaN(token)) { return new GraphQLError("Invalid Token"); }

        const otp = await dataSources.userAPI.findOneOtp({ userId: user._id });

        if (!otp) { return new GraphQLError("OTP not found"); }

        const valid_token = speakeasy.totp.verify({
            secret: otp.base32,
            encoding: "base32",
            token,
            window: 1
        });
        if (!valid_token) { return new GraphQLError("Invalid OTP"); }

        return otp;
    },
    verifyOtp: async (_, { token }, { dataSources, req }) => {
        const user = await isauthenticated()(req);

        if (!token || isNaN(token)) { return new GraphQLError("Invalid Token"); }

        const otp = await dataSources.userAPI.findOneOtp({ userId: user._id });

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

    disableOtp: async (_, { id }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        if (!isValidObjectId(id)) { return new GraphQLError("Invalid User ID"); }

        if (!user) { return new GraphQLError("User not found"); }

        const otp = await dataSources.userAPI.updateOtp(id, { enabled: false, last_modified: Date.now() });
        if (!otp) { return new GraphQLError("OTP not found"); }

        const updated_user = await dataSources.userAPI.updateUser(id, { has_otp: false });
        if (!updated_user) { return new GraphQLError("Failed to update user"); }
        return updated_user;
    },
    deleteOtp: async (_, { id }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        if (!isValidObjectId(id)) { return new GraphQLError("Invalid User ID"); }

        if (!user) { return new GraphQLError("User not found"); }

        const otp = await dataSources.userAPI.deleteOtp(id);
        if (!otp) { return new GraphQLError("OTP not found"); }

        const updated_user = await dataSources.userAPI.updateUser(id, { has_otp: false });
        if (!updated_user) { return new GraphQLError("Failed to update user"); }
        return updated_user;
    }
};

module.exports = otp_mutation;
