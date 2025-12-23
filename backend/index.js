

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import AuthRoutes from './routes/Auth.routes.js'
import DbCon from './db/db.js'

const app = express()

// app.use(cors({
//   origin: 'http://localhost:3001', 
//   credentials: true
// }));
app.use(cors({
  origin: 'http://localhost:3001', // Frontend URL (check your frontend port)
  credentials: false, // Set to false if not using cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}))

dotenv.config()
const PORT = process.env.PORT || 3000

DbCon()
app.use(express.json())

// THIS IS YOUR WORKING ROUTE
app.use('/auth', AuthRoutes) // Routes: /auth/register

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});


app.listen(PORT, () => {
  console.log(`✅ App is running on Port ${PORT}`)
})