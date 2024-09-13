import { Kafka } from 'kafkajs';
import { sendOtpToLogin } from '../controllers/ sendOtpController';

console.log('Consumer connected0');

const kafka = new Kafka({
    clientId: 'Notification_Consumer',
    brokers: ['kafka:9092']
});
console.log('Consumer connected1');

const consumer = kafka.consumer({ groupId: 'test-group' });
console.log('Consumer connected2');

export const consumerRun = async () => {
    console.log('Consumer connected3');

    await consumer.connect();
    console.log('Consumer connected4');

    await consumer.subscribe({ topic: 'SendOtp', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Received message: ${message.value?.toString()}`);
            const messageValue = message.value?.toString();
            console.log(messageValue)
            let parsedMessage 
            if(messageValue){
                parsedMessage = JSON.parse(messageValue);
            }
            await sendOtpToLogin(parsedMessage)
            await consumer.disconnect();
            console.log("consumer disconnected")
        }
    });

    console.log('Consumer is running');
};

consumerRun()
