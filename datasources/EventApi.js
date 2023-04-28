const { findByIdAndUpdate } = require("./event");
const Event = require("./event");
const Skill = require("./skill");
class EventApi {
    constructor () {
        this.model_event = Event;
        this.model_skill = Skill;
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

    addEventSkills (id, skills) {
        const options = { new: true };
        return this.model_event.findByIdAndUpdate(
            id,
            { $push: { skills: { $each: skills } } },
            options,
            (err, updatedEvent) => {
                if (err) {
                    console.error(err);
                    throw new Error("Error adding event skills");
                }
                return updatedEvent;
            }
        );
    }

    updateEvent (id, event) {
        return findByIdAndUpdate(id, event, { upsert: true, new: true });
    }

    deleteEvent (id) {
        return this.model_event.findByIdAndDelete(id);
    }

    findAvailbleEventSkills (id) {
        const all_skills = this.model_skill.find().exec();
        const event_skills = this.model_event.findById(id).populate("skills.skill").exec();
        return Promise.all([event_skills, all_skills]).then(([event_skills, all_skills]) => {
            const available_skills = all_skills.filter(skill => {
                return !event_skills.skills.some(event_skill => {
                    return event_skill.skill._id.toString() === skill._id.toString();
                });
            });
            return available_skills;
        });
    }
}

module.exports = EventApi;
