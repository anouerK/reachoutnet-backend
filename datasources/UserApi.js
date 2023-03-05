const User = require("./user.js");
const Follow = require("./follow");

class UserAPI {
    constructor () {
        this.model_user = User;
        this.model_follow = Follow;
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

    createUser (user) {
        return this.model_user.create(user);
    }

    updateUser (id, user) {
        return this.model_user.findByIdAndUpdate(id, user);
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
}

module.exports = UserAPI;
