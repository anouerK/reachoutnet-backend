const { findByIdAndUpdate } = require("./association");
const Association = require("./association");
class AssociationApi {
    constructor () {
        this.model_association = Association;
    }

    getAllAssociations () {
        return this.model_association.find({});
    }

    findOnebyId (id) {
        return this.model_association.findById(id);
    }

    createAssociation (association) {
        return this.model_association.create(association);
    }

    updateAssociation (id, association) {
        return findByIdAndUpdate(id, association, { upsert: true, new: true });
    }

    deleteAssociation (id) {
        return this.model_association.findByIdAndDelete(id);
    }
}

module.exports = AssociationApi;
