import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'Notification_Producer',
    brokers: ['kafka:9092']
});

const producer = kafka.producer();

export const producerRun = async (res:any) => {
    await producer.connect();
    console.log('Producer connected');

    await producer.send({
        topic: 'RESPONSE_TOPICs',
        messages: [{
            value: JSON.stringify(res) // Serialize the user object to a JSON string
        }]
    });

    console.log('Message sent');

    await producer.disconnect();
    console.log('Producer disconnected');
};
