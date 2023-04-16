const { GraphQLError } = require("graphql");
const { isauthenticated } = require("../../middleware/userpermission");
const { isValidObjectId } = require("mongoose");
const skill_query = {
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
    findUserSkills: async (_, { id }, { dataSources, req }) => {
        if (!isValidObjectId(id)) throw new GraphQLError("Invalid user id");
        // await authorize(userpermission.POST_MODULE_CRUDS)(req);
        await isauthenticated()(req);
        const user = await dataSources.userAPI.findOneUserandPopulateSkills(id);

        if (!user) throw new GraphQLError("User not found");
        return user.skills;
    },
    findAvailbleSkills: async (_, __, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        if (!user) throw new GraphQLError("User not found");
        const skills = await dataSources.userAPI.findAvailableSkills(user._id);
        if (!skills) throw new GraphQLError("couldn't find skills to add");
        if (skills.length === 0) throw new GraphQLError("No more skills to add");
        return skills;
    }
};
module.exports = skill_query;
