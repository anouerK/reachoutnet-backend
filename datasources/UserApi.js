const User=require('./user.js');

class UserAPI {
    constructor(){
        this.model_user=User;
    }

    getAllUsers(){
        return this.model_user.find({});
    }
    findOnebyId(id){
        return this.model_user.findById(id);
    }
    findOne(id){
        return this.model_user.findOne(id);
    }
    createUser(user){
        return this.model_user.create(user);
    }
    updateUser(id,user){
        return this.model_user.findByIdAndUpdate(id,user);
    }
    deleteUser(id){
        return this.model_user.findByIdAndDelete(id);
    }

}
module.exports=UserAPI;