const web3 = require('web3');
const StatusJSApp = require('status-js-api');


/**
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)  
 */
const modes = ["free answer", "multi option", "single option"]
export default class TopicPoll extends StatusJSApp {
    joined = [];

    constructor(statusdUrl, privKey){
        this.topics = {};
        this.connect(statusdUrl, privKey); 
    }

    async create(topic, data) {
        await this.checkTopic(topic);
        const data = {
            pollId,
            vote
        }
        this.topicSend(topic, JSON.stringify(data));
    }
    

    async vote(topic, pollId, vote) {
        await this.checkTopic(topic);
        const data = {
            pollId,
            vote
        }
        this.topicSend(topic, JSON.stringify(data));
    }

    getDataHash(pollData) {
        web3.utils.soliditySha3(...pollData)
    }
    getPollId(timestamp, dataHash) {
        web3.utils.soliditySha3(timestamp, dataHash)
    }
    async checkTopic(topic) {
        if(!this.topics[topic]) {
            await this.joinChat(topic);
            topics[topic]=true;
        }
    }

    async topicSend(topic, text) {
        await this.sendGroupMessage(topic, text);
    }


};