const UserPermission = {
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
  return (req, res, next) => {
    //console.log(req.user.permissions);
    // Check if the user has the required permission
    console.log(req.user);
    if ((req.user.permissions & permission) !== permission) {
      return res.status(403).json({ error: "Forbidden" });
    }
    // If the user has the required permission, call the next middleware function
    next();
  };
};


Object.freeze(UserPermission);

module.exports.UserPermission = UserPermission;
module.exports.authorize = authorize;
