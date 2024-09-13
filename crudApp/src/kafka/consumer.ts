import { Kafka } from 'kafkajs';
import { errorMethod } from '../controllers/notificationController';

const kafka = new Kafka({
    clientId: 'Crud_Consumer',
    brokers: ['kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'test-233233' });

export const consumerRun = async () => {

    await consumer.connect();
    console.log('Consumer connected');

    await consumer.subscribe({ topic: 'RESPONSE_TOPICs', fromBeginning: false });
    console.log('Consumer is subscribed');

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Received message: ${message.value?.toString()} ,${topic} ${partition}`);
            const messageValue = message.value?.toString();
            let parsedMessage 
            if(messageValue){
                parsedMessage = JSON.parse(messageValue);
            }
            await errorMethod(parsedMessage)
        }
    });
    await consumer.disconnect();
    console.log('Consumer is Disconnected');
};

