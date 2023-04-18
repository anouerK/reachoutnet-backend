const User = require("./user.js");
const Follow = require("./follow");
const Otp = require("./otp.js");
const Skill = require("./skill.js");
const interest = require("./interest.js");
const nodemailer = require("../datasources/nodemailer.config");
class UserAPI {
    constructor () {
        this.model_user = User;
        this.model_follow = Follow;
        this.model_otp = Otp;
        this.model_nodmailer = nodemailer;
        this.model_skill = Skill;

        this.model_interest = interest;
    }

    getAllUsers () {
        return this.model_user.find({});
    }

    findOnebyId (id) {
        return this.model_user.findById(id);
    }

    findByEmail (email) {
        return this.model_user.findOne({ email });
    }

    findOne (id) {
        return this.model_user.findOne(id);
    }

    findOneUserByIdPopulateOtp (id) {
        return this.model_user.findOne(id);
    }

    createUser (user) {
        return this.model_user.create(user);
    }

    updateUser (id, user) {
        return this.model_user.findByIdAndUpdate(id, user, { upsert: true, new: true });
    }

    deleteUser (id) {
        return this.model_user.findByIdAndDelete(id);
    }

    userPopulate (filed) {
        return this.model_user.populate(filed);
    }

    updateUserProfilePicture (id, picture) {
        return this.model_user.findByIdAndUpdate(id, { profile_picture: picture }, { upsert: true, new: true });
    }

    updateUserProfileCoverPicture (id, picture) {
        return this.model_user.findByIdAndUpdate(id, { profile_cover_picture: picture }, { upsert: true, new: true });
    }
    /// / ///////// follow section /////////

    createFollow (follow) {
        return this.model_follow.create(follow);
    }

    updateFollow (id, follow) {
        return this.model_follow.findByIdAndUpdate(id, follow);
    }

    deleteFollow (id) {
        return this.model_follow.findByIdAndDelete(id);
    }

    getFollower (id, followinId) { // check if this user is  following another user
        return this.model_follow.findOne({ followerId: id, followingId: followinId });
    }

    getFollowingRelation (followingId, id) { // check if  other user is  following the current user
        return this.model_follow.findOne({ followerId: followingId, followingId: id });
    }

    /// / ///////// end follow section /////////

    createOtp (userId, base32) {
        return this.model_otp.create({
            userId,
            enabled: true,
            verified: true,
            base32
        });
    }

    findOneOtp (id) {
        return this.model_otp.findOne(id);
    }

    updateOtp (id, otp) {
        return this.model_otp.findOneAndUpdate({ _id: id }, otp, { upsert: true, new: true });
    }

    findUserOtp (userid) {
        return this.model_otp.findOne({ userId: userid });
    }

    deleteOtp (id) {
        return this.model_otp.findOneAndDelete(id);
    }

    /// / ///////// Skill section /////////

    addSkill (skill) {
        return this.model_skill.create(skill);
    }

    updateSkill (id, skill) {
        return this.model_skill.findOneAndUpdate(id, skill);
    }

    deleteSkill (id) {
        return this.model_skill.findOneAndDelete(id);
    }

    getSkillById (id) {
        return this.model_skill.findById(id);
    }

    getSkillByName (nom) {
        return this.model_skill.findOne({ name: nom });
    }

    getAllSkills () {
        return this.model_skill.find();
    }

    findOneUserandPopulateSkills (id) {
        return this.model_user.findById(id).populate("skills.skill");
    }

    findAvailableSkills (id) {
        const user_skills = this.model_user.findById(id).populate("skills.skill");
        const all_skills = this.model_skill.find().exec();
        return Promise.all([user_skills, all_skills]).then(([user_skills, all_skills]) => {
            const available_skills = all_skills.filter(skill => {
                return !user_skills.skills.some(user_skill => {
                    return user_skill.skill._id.toString() === skill._id.toString();
                });
            });
            return available_skills;
        });
    }

    /// / ///////// end Skill section /////////

    createInterest (interest) {
        return this.model_interest.create(interest);
    }

    deleteInterest (id) {
        return this.model_interest.findByIdAndDelete(id);
    }

    updateInterest (id, interest) {
        return this.model_interest.findByIdAndUpdate(id, interest);
    }

    getInterest (id) {
        return this.model_interest.findOneAndUpdate(id);
    }

    getInterestById (id) {
        return this.model_interest.findById(id);
    }

    getInterestByName (nom) {
        return this.model_interest.findOne({ name: nom });
    }

    getAllInterest () {
        return this.model_interest.find();
    }

    findOneUserandPopulateInterests (id) {
        return this.model_user.findById(id).populate("interests.interest");
    }

    sendConfirmationEmail (email, activationCode) {
        return this.model_nodmailer.sendConfirmationEmail(email, activationCode);
    }

    findUserByConfirmationCode (activationCode) {
        const user = this.model_user.findOne({ activationCode });
        return user;
    }

    findFirstLastName1 (regex) {
        return this.model_user.find({
            $and: [
                { first_name: { $regex: "^" + regex[0], $options: "i" } },
                { last_name: { $regex: "^" + regex[1], $options: "i" } }
            ]
        });
    }

    findLastFirstName1 (regex) {
        return this.model_user.find({
            $and: [
                { first_name: { $regex: "^" + regex[1], $options: "i" } },
                { last_name: { $regex: "^" + regex[0], $options: "i" } }
            ]
        });
    }

    findFirstLastName2 (regex) {
        return this.model_user.find({
            $or: [
                { first_name: { $regex: "^" + regex[0], $options: "i" } },
                { last_name: { $regex: "^" + regex[0], $options: "i" } }
            ]
        });
    }

    searchUserRequests (usersInRequests) {
        return this.model_user.find({ id: { $in: usersInRequests } });
    }
}

module.exports = UserAPI;
