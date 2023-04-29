const { DataSource } = require("apollo-datasource");
const { google } = require("googleapis");

class GooglePerspectiveAPI extends DataSource {
    constructor () {
        super();
        this.baseURL = process.env.PERSPECTIVE_API_URL;
    }

    async analyzeComment (comment) {
        return new Promise((resolve, reject) => {
            google.discoverAPI(this.baseURL)
                .then(client => {
                    const analyzeRequest = {
                        comment: {
                            text: comment
                        },
                        requestedAttributes: {
                            TOXICITY: {},
                            INSULT: {},
                            THREAT: {}
                        }
                    };

                    client.comments.analyze({
                        key: process.env.GOOGLE_API_KEY,
                        resource: analyzeRequest
                    }, (err, response) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(JSON.stringify(response.data, null, 2));
                        }
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /* async analyzeComment (comment) {
        const result = await this.post("", {
            comment: {
                text: comment
            },
            languages: ["en"],
            requestedAttributes: {
                TOXICITY: {},
                INSULT: {},
                FLIRTATION: {},
                THREAT: {}
            }
        });

        const attributes = result.attributeScores;
        let validComment = true;
        Object.keys(attributes).forEach((key) => {
            const probability = attributes[key].summaryScore.value;
            if (probability >= 0.75) {
                validComment = false;
            }
        });

        return { valid: validComment };
    } */
}

module.exports = GooglePerspectiveAPI;
