const event_query = {
    events: async (_, __, { dataSources }) => {
        const events = await dataSources.eventAPI.getAllEvents();
        return events;
    }
};

module.exports = event_query;
