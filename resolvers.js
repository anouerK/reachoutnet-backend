const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { userpermission, authorize } = require('./middleware/userpermission')
const { GraphQLError } = require('graphql')
const resolvers = {
  Query: {
    users: async (_, __, { dataSources, req }) => {
      await authorize(userpermission.VIEW_USER_MODULE)(req)
      const users = await dataSources.userAPI.getAllUsers()
      return users
    },

    user: async (_, { id }, { dataSources, req }) => {
      await authorize(userpermission.VIEW_USER_MODULE)(req)
      const User = dataSources.userAPI
      const user = await User.findOnebyId(id)
      return user
    }

  },
  Mutation: {

    addUser: async (_, { username, firstname, lastname, age, email, password, permissions }, { dataSources, req }) => {
      const hashedPassword = await bcrypt.hash(password, 10)
      const User = dataSources.userAPI
      const user = {
        username,
        firstname,
        lastname,
        age,
        email,
        password: hashedPassword,
        permissions
      }
      await authorize(userpermission.POST_MODULE_CRUDS)(req)
      const saveduser = await User.createUser(user)

      return saveduser
    },

    updateUser: async (_, args, { dataSources, req }) => {
      const User = dataSources.userAPI
      await authorize(userpermission.POST_MODULE_CRUDS)(req)
      const { id, ...updateData } = args
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10)
      }
      const user = await User.updateUser(id, updateData, { new: true })
      return user
    },

    deleteUser: async (_, { id }, { dataSources, req }) => {
      try {
        await authorize(userpermission.POST_MODULE_CRUDS)(req)
        const User = dataSources.userAPI

        const user = await User.deleteUser(id)
        if (!user) {
          throw new GraphQLError('User not found')
        }
        return user
      } catch (error) {
        console.error(error)
        throw new GraphQLError('Failed to delete user')
      }
    },

    async login (_, { email, password }, { dataSources }) {
      try {
        const User = dataSources.userAPI

        const user = await User.findOne({ email })
        if (!user) {
          throw new GraphQLError('Invalid login credentials')
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
          throw new GraphQLError('Invalid login credentials')
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: '24h'
        })

        return { user, token }
      } catch (error) {
        console.error(error)
        throw new GraphQLError('Authentication failed')
      }
    }
  //   // Add any other mutation resolvers here
  }

}

module.exports = resolvers
