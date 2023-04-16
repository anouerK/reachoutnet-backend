const otp_mutation = require("./mutation/otp");
const follow_query = require("./query/follow");
const skill_query = require("./query/skills");
const follow_mutation = require("./mutation/follow");
const user_query = require("./query/user");
const interest_mutation = require("./mutation/interest");
const skill_mutation = require("./mutation/skill");
const user_mutation = require("./mutation/user");
const otp_query = require("./query/otp");
const event_query = require("./query/event");
const event_mutation = require("./mutation/event");
const association_query = require("./query/association");
const association_mutation = require("./mutation/association");
const interest_query = require("./query/interests");
const post_query = require("./query/post");
const post_mutation = require("./mutation/post");
const resolvers = {
    Query: {
        ...follow_query,
        ...skill_query,
        ...user_query,
        ...interest_query,
        ...otp_query,
        ...event_query,
        ...association_query,
        ...post_query
    },
    Mutation: {
        ...otp_mutation,
        ...follow_mutation,
        ...interest_mutation,
        ...skill_mutation,
        ...user_mutation,
        ...event_mutation,
        ...association_mutation,
        ...post_mutation

    }
};

module.exports = resolvers;
