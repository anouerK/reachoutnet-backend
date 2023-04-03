const { findByIdAndUpdate } = require("./event");
const Event = require("./event");
class EventApi {
    constructor () {
        this.model_event = Event;
    }

    getAllEvents () {
        return this.model_event.find({});
    }

    findOnebyId (id) {
        return this.model_event.findById(id).populate({ path: "attendees", model: "users" }).populate({ path: "created_by", model: "users" });
    }

    createEvent (event) {
        return this.model_event.create(event);
    }

    updateEvent (id, event) {
        return findByIdAndUpdate(id, event, { upsert: true, new: true });
    }

    deleteEvent (id) {
        return this.model_event.findByIdAndDelete(id);
    }
}

module.exports = EventApi;
