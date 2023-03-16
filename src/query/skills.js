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
    }
};
module.exports = skill_query;
