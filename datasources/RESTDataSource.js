/* eslint-disable no-unused-vars */
const { DataSource } = require("apollo-datasource");
const { Configuration, OpenAIApi } = require("openai");

class MyAPI extends DataSource {
    constructor () {
        super();
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.api = new OpenAIApi(configuration);
    }

    async createModeration (comment) {
        const completion = await this.api.createModeration({
            input: comment
        });
        return completion;
    }
}

module.exports = MyAPI;
