const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLSchema,
  GraphQLBoolean,
} = require("graphql");
const bcrypt = require("bcryptjs");
const User = require("./user");
const jwt = require("jsonwebtoken");
const UserPermission = require("./userpermission");

const UserType = new GraphQLObjectType({
  name: "user",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLNonNull(GraphQLString) },
    first_name: { type: GraphQLNonNull(GraphQLString) },
    last_name: { type: GraphQLNonNull(GraphQLString) },
    age: { type: GraphQLNonNull(GraphQLInt) },
    email: { type: GraphQLNonNull(GraphQLString) },
    permissions: { type: GraphQLNonNull(GraphQLInt) },
    creation_date: { type: GraphQLNonNull(GraphQLString) },
    last_login: { type: GraphQLString },
    is_verified: { type: GraphQLNonNull(GraphQLBoolean) }
  }),
});

const LoginType = new GraphQLObjectType({
  name: "Login",
  fields: () => ({
    user: { type: UserType },
    token: { type: GraphQLString },
  }),
  
});


  
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    users: {
      type: GraphQLList(UserType),
      extensions: { directive: { hasPermission: { permission: UserPermission.VIEW_USER_MODULE } } },
      resolve: async () => {
        const users = await User.find();
        return users;
      },
    },
    user: {
      type: UserType,
      extensions: { directive: { hasPermission: { permission: UserPermission.VIEW_USER_MODULE } } },
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { id }) => {
        const user = await User.findById(id);
        return user;
      },
    },
  },
});
  
const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      extensions: { directive: { hasPermission: { permission: UserPermission.POST_MODULE_CRUDS } } },
      args: {
        username: { type: GraphQLNonNull(GraphQLString) },
        first_name: { type: GraphQLNonNull(GraphQLString) },
        last_name: { type: GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLNonNull(GraphQLInt) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        permissions: { type: GraphQLInt },
      },
      resolve: async (_, { username, first_name, last_name, age, email, password, permissions }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
          username,
          first_name,
          last_name,
          age,
          email,
          password: hashedPassword,
          permissions,
        });
        await user.save();
        return user;
      },
    },
    updateUser: {
      type: UserType,
      extensions: { directive: { hasPermission: { permission: UserPermission.POST_MODULE_CRUDS } } },
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        username: { type: GraphQLString },
        first_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        age: { type: GraphQLInt },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        permissions: { type: GraphQLInt },
      },
      resolve: async (_, args) => {
        const { id, ...updateData } = args;
        if (updateData.password) {
          updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        return user;
      },
    },
    deleteUser: {
      type: UserType,
      extensions: { directive: { hasPermission: { permission: UserPermission.POST_MODULE_CRUDS } } },
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
      },
      // eslint-disable-next-line complexity
      resolve: async (_, { id }) => {
        try {
          const user = await User.findByIdAndDelete(id);
          if (!user) {
            throw new Error("User not found");
          }
          return user;
        } catch (error) {
          console.error(error);
          throw new Error("Failed to delete user");
        }
      },
    },
    login : {
      type: LoginType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      // eslint-disable-next-line complexity
      async resolve(parent, args) {
        try {
          const { email, password } = args;
          const user = await User.findOne({ email });
          if (!user) {
            throw new Error("Invalid login credentials");
          }
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            throw new Error("Invalid login credentials");
          }
          const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
          return { user, token };
        } catch (error) {
          console.error(error);
          throw new Error("Authentication failed");
        }
      },
    },
  },
});
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});
  
module.exports = schema;