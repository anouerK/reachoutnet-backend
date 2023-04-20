// const { findByIdAndUpdate } = require("./association");
const Association = require("./association");
class AssociationApi {
    constructor () {
        this.model_association = Association;
    }

    getAllAssociations () {
        return this.model_association.find({}).populate("owner");
    }

    findByOwner (owner) {
        return this.model_association.find({ owner }).populate("owner");
    }

    findOnebyId (id) {
        return this.model_association.findById(id).populate("owner");
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
        return this.model_association.findById(id).populate("members.user");
    }

    findByNameLike (value) {
        return this.model_association.find(
            { name: { $regex: "^" + value, $options: "i" } }
        );
    }
}

module.exports = AssociationApi;
