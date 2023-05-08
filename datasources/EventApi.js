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

    findEventSkills (id) {
        return this.model_event.findById(id).populate({ path: "skills", model: "skill" });
    }

    findOneEventandPopulateSkills (id) {
        return this.model_event.findById(id).populate({ path: "skills", model: "skill" });
    }

    createEvent (event) {
        return this.model_event.create(event);
    }

    addEventSkills (id, skillToAdd) {
        const options = { new: true };

        try {
            return this.model_event.findByIdAndUpdate(
                id,
                { $push: { skills: { $each: skillToAdd } } },
                options
            );
        } catch (err) {
            console.error(err);
            throw new Error("Error adding event skills");
        }
    }

    updateEvent (id, event) {
        return findByIdAndUpdate(id, event, { upsert: true, new: true });
    }

    deleteEvent (id) {
        return this.model_event.findByIdAndDelete(id);
    }

    findAvailbleEventSkills (id) {
        const all_skills = this.model_skill.find().exec();
        const event = this.model_event.findById(id).populate("skills.skill").exec();

        // eslint-disable-next-line no-unused-vars
        const user_skills = event.then((event) => {
            // eslint-disable-next-line array-callback-return
            return event.skills.map((skill) => {
                return skill.toString();
            });
        });
        return Promise.all([user_skills, all_skills]).then(([user_skills, all_skills]) => {
            const available_skills = all_skills.filter(skill => {
                return !user_skills.some(user_skill => {
                    return user_skill === skill._id.toString();
                });
            });
            return available_skills;
        });
    }
}

module.exports = EventApi;
