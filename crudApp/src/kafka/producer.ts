import { Kafka, Partitioners } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'Crud_Producer',
    brokers: ['kafka:9092'],
});

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

export const run = async (user:any) => {

    await producer.connect();
    console.log('Producer connected');
    await producer.send({
        topic: 'SendOtp',
        messages: [{
            value: JSON.stringify(user) // Serialize the user object to a JSON string
        }]
    });

    console.log('Message sent');

    await producer.disconnect();
    console.log('Producer disconnected');
};
