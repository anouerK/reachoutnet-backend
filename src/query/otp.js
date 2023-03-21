const { GraphQLError } = require("graphql");
const { isauthenticated } = require("../../middleware/userpermission");
const otp_query = {
    findUserOtp: async (_, __, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const otp = dataSources.userAPI.findUserOtp(user._id);
        if (!otp) throw new GraphQLError("OTP not found");
        return otp;
    }
};
module.exports = otp_query;
