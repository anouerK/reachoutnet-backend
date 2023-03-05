const { ApolloServer } = require('@apollo/server')

const { startStandaloneServer } = require('@apollo/server/standalone')
const { InMemoryLRUCache } = require('@apollo/utils.keyvaluecache')
const { readFileSync } = require('fs')
const gql = require('graphql-tag')
const mongoose = require('mongoose')
require('dotenv').config()
const typeDefs = gql(readFileSync('./user.graphql', { encoding: 'utf-8' }))
const resolvers = require('./resolvers')
const UserAPI = require('./datasources/UserApi')

async function startApolloServer () {
  const server = new ApolloServer({ typeDefs, resolvers, cache: new InMemoryLRUCache() })
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected!')
    })
    .catch(err => console.log(err))

  const port = 4001
  const subgraphName = 'user'

  try {
    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => {
        return {
          dataSources: {
            userAPI: new UserAPI()
          },
          req
        }
      },
      listen: { port }
    })

    console.log(`🚀 🌑 Subgraph ${subgraphName} running at ${url}`)
  } catch (err) {
    console.error(err)
  }
}

startApolloServer()
