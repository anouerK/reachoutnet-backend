const User = require("./user.js");
const Follow = require("./follow");
const Otp = require("./otp.js");
const Skill = require("./skill.js");
const interest = require("./interest.js");

class UserAPI {
    constructor () {
        this.model_user = User;
        this.model_follow = Follow;
        this.model_otp = Otp;

        this.model_skill = Skill;

        this.model_interest = interest;

    }

    getAllUsers () {
        return this.model_user.find({});
    }

    findOnebyId (id) {
        return this.model_user.findById(id);
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

    createFollow (follow) {
        return this.model_follow.create(follow);
    }

    updateFollow (id, follow) {
        return this.model_follow.findByIdAndUpdate(id, follow);
    }

    deleteFollow (id) {
        return this.model_follow.findByIdAndDelete(id);
    }

    getFollower (id, followinId) {
        return this.model_follow.findOne({ followerId: id, followingId: followinId });
    }

    getFollowingRelation (followingId, id) {
        return this.model_follow.findOne({ followerId: followingId, followingId: id });
    }

    createOtp (userId, base32) {
        return this.model_otp.create({
            userId,
            enabled: true,
            verified: false,
            base32
        });
    }

    findOneOtp (id) {
        return this.model_otp.findOne(id);
    }

    updateOtp (id, otp) {
        return this.model_otp.findOneAndUpdate({ userId: id }, otp, { upsert: true, new: true });
    }

    deleteOtp (id) {
        return this.model_otp.findOneAndDelete({ userId: id });
    }


    addSkill (skill) {
        return this.model_skill.create(skill);
}
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
}

module.exports = UserAPI;
