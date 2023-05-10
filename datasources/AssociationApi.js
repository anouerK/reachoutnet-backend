// const { findByIdAndUpdate } = require("./association");
const Association = require("./association");
class AssociationApi {
    constructor () {
        this.model_association = Association;
    }

    getAllAssociations () {
        return this.model_association.find({}).populate("owner").populate("members.user");
    }

    getUserPermission (userid, associationid) {
        return this.model_association.findOne(
            { "members.user": userid, _id: associationid }
        ).populate("members.user");
    }

    findByOwner (owner) {
        return this.model_association.find({ owner }).populate("owner").populate("members.user");
    }

    findOnebyId (id) {
        return this.model_association.findById(id).populate("owner").populate("members.user");
    }

    createAssociation (association) {
        return this.model_association.create(association);
    }

    updateAssociation (id, association) {
        return this.model_association.findByIdAndUpdate(id, association, { upsert: true, new: true });
    }

    deleteAssociation (id) {
        return this.model_association.findByIdAndDelete(id);
    }

    findByName (name) {
        return this.model_association.find(
            { name: { $regex: "^" + name, $options: "i" } }
        );
    }

    findOneAssociationandPopulateMembers (id) {
        return this.model_association.findById(id).populate("members.users");
    }

    findByNameLike (value) {
        return this.model_association.find(
            { name: { $regex: "^" + value, $options: "i" } }
        );
    }
}

module.exports = AssociationApi;
