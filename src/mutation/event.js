const { GraphQLError } = require("graphql");
const { isValidObjectId } = require("mongoose");
const Joi = require("joi");
const { isauthenticated } = require("../../middleware/userpermission");
// --> En commentaire parce qu'il y a nbr maximum 100 Sms pour cette api
// const Twilio = require("twilio");

// const accountSid = "ACc79adb5644808323ab55a74b2164a648";
// const authToken = "99cc434de42cc7ad6e415d276489ad3f";
// const client = new Twilio(accountSid, authToken);
// function sendSMS (name, description, start_date, end_date, location) {
//     client.messages
//         .create({
//             body: `ReachOutNet added a new event: ${name}}\nDescription: ${description}\n start Date ${start_date} \n and end date ${end_date} `,
//             from: "+13204338754",
//             to: "+21629868544"
//         })
//         .then(message => console.log(message.sid))
//         .catch(error => console.error(error));
// }
const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required().min(5),
    start_date: Joi.date().required(),
    end_date: Joi.date().required().greater(Joi.ref("start_date")),
    location: Joi.object({
        address: Joi.string().required(),
        x: Joi.number().optional(),
        y: Joi.number().optional()
    }).required(),
    eventImage: Joi.string().optional(),
    attendees: Joi.array().items(Joi.custom((value, helper) => {
        if (!isValidObjectId(value)) {
            return helper.message("Invalid participants Id");
        }
        return value;
    }).required())
});

const event_mutation = {
    createEvent: async (_, { name, description, start_date, end_date, location, attendees, eventImage }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        if (!user) throw new GraphQLError("Event not authenticated");

        const { error, value } = schema.validate({ name, description, start_date, end_date, location, attendees, eventImage });

        if (error) throw new GraphQLError(error.message);

        const newEvent = {
            ...value,
            created_by: user.id
        };
        const savedEvent = await dataSources.eventAPI.createEvent(newEvent);
        // --> En commentaire parce qu'il y a nbr maximum 100 Sms pour cette api
        // sendSMS(name, description, start_date, end_date, location);
        return savedEvent;
    },
    sendRequest: async (_, { id }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const userId = user.id;
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) throw new GraphQLError("Event not found");

        const existingRequestIndex = event.requests.findIndex(
            (request) => request.user.toString() === userId
        );

        if (existingRequestIndex === -1) {
            // Add the user to the association
            event.requests.push({ user: userId, state: 1 });
        } else {
            throw new GraphQLError("User already exist");
        }

        const updated_event = await event.save();
        return updated_event;
    },
    acceptRequest: async (_, { id, userId }, { dataSources, req }) => {
        await isauthenticated()(req);
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) throw new GraphQLError("Event not found");

        const existingRequestIndex = event.requests.findIndex(
            (request) => request.user.toString() === userId
        );

        if (existingRequestIndex !== -1) {
            // Add the user to the association
            event.requests[existingRequestIndex].state = 2;
        } else {
            throw new GraphQLError("User dosen't exist");
        }

        const updated_event = await event.save();
        return updated_event;
    },
    refuseRequest: async (_, { id, userId }, { dataSources, req }) => {
        await isauthenticated()(req);
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) throw new GraphQLError("Event not found");

        const existingRequestIndex = event.requests.findIndex(
            (request) => request.user.toString() === userId
        );

        if (existingRequestIndex !== -1) {
            // Add the user to the association
            event.requests[existingRequestIndex].state = 3;
        } else {
            throw new GraphQLError("User dosen't exist");
        }

        const updated_event = await event.save();
        return updated_event;
    },
    cancelRequest: async (_, { id }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const userId = user.id;
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) throw new GraphQLError("Event not found");

        const existingRequestIndex = event.requests.findIndex(
            (request) => request.user.toString() === userId
        );

        if (existingRequestIndex !== -1) {
            // Add the user to the association
            event.requests.splice(existingRequestIndex, 1);
        } else {
            throw new GraphQLError("User dosen't exist");
        }

        const updated_event = await event.save();
        return updated_event;
    }
};

module.exports = event_mutation;
