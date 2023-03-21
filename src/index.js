const otp_mutation = require("./mutation/otp");
const follow_query = require("./query/follow");
const skill_query = require("./query/skills");
const follow_mutation = require("./mutation/follow");
const user_query = require("./query/user");
const interest_mutation = require("./mutation/interest");
const skill_mutation = require("./mutation/skill");
const user_mutation = require("./mutation/user");
const otp_query = require("./query/otp");

const resolvers = {
    Query: {
        ...follow_query,
        ...skill_query,
        ...user_query,
        ...otp_query
    },
    Mutation: {
        ...otp_mutation,
        ...follow_mutation,
        ...interest_mutation,
        ...skill_mutation,
        ...user_mutation
    }
};

module.exports = resolvers;
