/* eslint-disable no-unused-vars */
const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const { calculateScores, Newusers } = require("../graphlookup/usergraphLookup");
const activeusers = require("../graphlookup/authlookup");
const montlyActiveUsers = require("../graphlookup/montlyActiveusers");
const maxCount = require("../graphlookup/maxCount");
// const newusers = require("../graphlookup/usergraphLookup");
const user_query = {
    users: async (_, __, { dataSources, req }) => {
        await authorize(userpermission.VIEW_USER_MODULE)(req);
        const users = await dataSources.userAPI.getAllUsers();
        return users;
    },
    usersRecommendation: async (_, __, { dataSources, req }) => {
        // await authorize(userpermission.VIEW_USER_MODULE)(req);
        const user = await isauthenticated()(req);
        // console.log(user);
        const result = await calculateScores(user._id);

        return result;
    },
    activeusers: async (_, __, { dataSources, req }) => {
        const result = await activeusers();

        return result.length;
    },
    montlyActiveusers: async (_, __, { dataSources, req }) => {
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
        const result1 = await montlyActiveUsers();
        const resultMax = await maxCount();
        result1.forEach((obj) => {
            obj.months.forEach((month) => {
                month.month = monthNames[Number(month.month) - 1];
            });
        });
        const result2 = resultMax.max_count;
        return { result1, result2 };
    },
    newusers: async (_, __, { dataSources, req }) => {
        const result = await Newusers();
        // console.log(result.length);
        return result.length;
    },

    user: async (_, { id }, { dataSources, req }) => {
        await authorize(userpermission.VIEW_USER_MODULE)(req);
        const User = dataSources.userAPI;
        const user = await User.findOnebyId(id);
        return user;
    },
    userProfile: async (_, { id }, { dataSources, req }) => {
        const User = dataSources.userAPI;
        const user = await User.findOnebyId(id);
        return user;
    },
    me: async (_, __, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        return user;
    },

    getUserInfo: async (_, { __ }, { dataSources, req }) => {
        const users = await isauthenticated()(req);
        const id = users.id;
        const User = dataSources.userAPI;
        const user = await User.findOnebyId(id);
        return user;
    },
    findUser: async (_, { value }, { dataSources, req }) => {
        const User = dataSources.userAPI;
        let user = null;
        const regex = value.split(" "); // split into array of words
        // construct regex to match any of the words

        // eslint-disable-next-line no-unused-vars
        if (regex[1] != null) {
            user = await User.findFirstLastName1(regex);
            if (user.length === 0) {
                user = await User.findLastFirstName1(regex);
            }
        } else {
            user = await User.findFirstLastName2(regex);
        }
        if (value === "") {
            user = null;
        }

        return user;
    },
    userSkills: async (_, { id }, { dataSources, req }) => {
        // const users = await isauthenticated()(req);
        const User = dataSources.userAPI;
        const user = await User.findOnebyId(id);
        const skillsId = [];
        for (const skills of user.skills) {
            skillsId.push(skills.skill.toString());
        }

        const Skill = dataSources.userAPI;
        const skills = await Skill.getAllSkills();

        const findSkills = skills.filter(skill => skillsId.includes(skill.id.toString()));
        return { findSkills, user };
    }

};
module.exports = user_query;
