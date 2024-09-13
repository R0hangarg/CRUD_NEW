import express from 'express'
import userRouter from './src/routes/userRoutes';
import { consumerRun } from './src/Kafka/consumer';

const app = express();
app.use(express.json());

consumerRun();
app.use(userRouter)

app.listen(3001, () => console.log('Server running on port 3001'));