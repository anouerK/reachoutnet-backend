const userpermission = {
  NONE:0,
  VIEW_DASHBOARD:1,
  VIEW_USER_MODULE:2,
  USER_MODULE_CRUDS:4,
  VIEW_POST_MODULE:8,
  POST_MODULE_CRUDS:16,
  VIEW_ASSOCIATIONS_MODULE:32,
  ASSOSATIONS_MODULE_CRUDS:64,
  VIEW_COMMUNICATION_MODULE:128,
  COMMUNICATION_MODULE_CRUDS:256,
  ALL: 511, // All permissions*/
 
};

const authorize = (permission) => {
  // eslint-disable-next-line complexity
  return async (req) => {
    // Check if the user has the required permission
    if (!req.user || ((req.user.permissions & permission) !== permission)) {
      throw new Error("Forbidden");
    }
  };
};
/*
const authorize = (permission) => {
  // eslint-disable-next-line complexity
  return async (req) => {
    // Check if the user has the required permission
    console.log("\n 1: "+permission);
    if (!req.user || ((!req.user.permissions & permission)!== permission) ) {
      throw new Error("Forbidden");
    }
  };
};
*/
Object.freeze(userpermission);

module.exports.userpermission = userpermission;
module.exports.authorize = authorize;
