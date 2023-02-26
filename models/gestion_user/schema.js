const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLSchema,
} = require("graphql");
const bcrypt = require("bcryptjs");
const User = require("./user");
  
const UserType = new GraphQLObjectType({
  name: "user",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLNonNull(GraphQLString) },
    first_name: { type: GraphQLNonNull(GraphQLString) },
    last_name: { type: GraphQLNonNull(GraphQLString) },
    age: { type: GraphQLNonNull(GraphQLInt) },
    email: { type: GraphQLNonNull(GraphQLString) },
    role: { type: GraphQLNonNull(GraphQLString) },
    creation_date: { type: GraphQLNonNull(GraphQLString) },
    last_login: { type: GraphQLString },
  }),
});
  
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    users: {
      type: GraphQLList(UserType),
      resolve: async () => {
        const users = await User.find();
        return users;
      },
    },
    user: {
      type: UserType,
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
      args: {
        username: { type: GraphQLNonNull(GraphQLString) },
        first_name: { type: GraphQLNonNull(GraphQLString) },
        last_name: { type: GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLNonNull(GraphQLInt) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        role: { type: GraphQLString },
      },
      resolve: async (_, { username, first_name, last_name, age, email, password, role }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
          username,
          first_name,
          last_name,
          age,
          email,
          password: hashedPassword,
          role: role || "user",
        });
        await user.save();
        return user;
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        username: { type: GraphQLString },
        first_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        age: { type: GraphQLInt },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        role: { type: GraphQLString },
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
  },
});
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});
  
module.exports = schema;