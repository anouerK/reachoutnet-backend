const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer");
const express = require("express");
// const http = require("http");
const gql = require("graphql-tag");
const bodyParser = require("body-parser");
const { readFileSync } = require("fs");
const typeDefs = gql(readFileSync("./user.graphql", { encoding: "utf-8" }));
const resolvers = require("./src/index");
const mongoose = require("mongoose");
const cors = require("cors");
const UserAPI = require("./datasources/UserApi");
const MessageAPI = require("./datasources/messageApi");
const EventAPI = require("./datasources/EventApi");
const AssociationApi = require("./datasources/AssociationApi");
const PostApi = require("./datasources/PostApi");

const { createServer } = require("http");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const WebSocket = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
// Required logic for integrating with Express
async function startServer () {
    const app = express();
    const httpServer = createServer(app);
    // Our httpServer handles incoming requests to our Express app.
    // Below, we tell Apollo Server to "drain" this httpServer,
    // enabling our servers to shut down gracefully.
    // const httpServer = http.createServer(app);
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    // Creating the WebSocket server
    const wsServer = new WebSocket.Server({ server: httpServer });

    // Hand in the schema we just created and have the
    // WebSocketServer start listening.
    const serverCleanup = useServer({ schema }, wsServer);
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("MongoDB connected!");
        })
        .catch(err => console.log(err));
    // Same ApolloServer initialization as before, plus the drain plugin
    // for our httpServer.
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),

            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart () {
                    return {
                        async drainServer () {
                            await serverCleanup.dispose();
                        }
                    };
                }
            }
        ],
        cors: {
            origin: ["http://localhost:3001/", "http://localhost:3000"],
            Credentials: true
        }
    });
    // Ensure we wait for our server to start
    await server.start();

    // Set up our Express middleware to handle CORS, body parsing,
    // and our expressMiddleware function.
    app.use(
        "/",
        cors(),
        bodyParser.json(),
        // expressMiddleware accepts the same arguments:
        // an Apollo Server instance and optional configuration options
        expressMiddleware(server, {
            context: async ({ req }) => {
                return {
                    dataSources: {
                        userAPI: new UserAPI(),
                        eventAPI: new EventAPI(),
                        associationAPI: new AssociationApi(),
                        postAPI: new PostApi(),
                        messageAPI: new MessageAPI()
                    },
                    req
                };
            }
        })
    );

    // Modified server startup
    await new Promise((resolve) => httpServer.listen({ port: 4001 }, resolve));
    console.log("🚀 Server ready at http://localhost:4001/");
}

startServer();
