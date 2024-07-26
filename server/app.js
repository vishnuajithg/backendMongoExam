const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
// const User = require('./models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const path = require('path');
const cookieParser = require('cookie-parser')
const hrRouter = require('./Routes/hr')
const userRouter = require('./Routes/user')
const authenticateToken = require('./Middleware/auth')


const Hr = require('./Models/hr');
const User = require('./Models/user');
const Job = require('./Models/job');


require('dotenv').config();

const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );
app.use(cookieParser())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// app.use('/admin',hrRouter)
app.use('/user',userRouter)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.post('/adminLogin', async (req, res) => {
    try {
        const admin = {
          username: 'admin',
          password: 'admin'
        }
        const admins = await Hr.findOne({ username: admin.username });
        if (!admins) {
          const hashedPassword = await bcrypt.hash(admin.password, 10);
          const newAdmins = new Hr({
              username: admin.username,
              password: hashedPassword
          });
          await newAdmins.save();
          console.log('Admin user created');
        } else {
          console.log('Admin user already exists');
        }
        const { username, password } = req.body;
        console.log(username, password)
    
        const adminss = await Hr.findOne({ username });
        if (!adminss) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }
  
        const isMatch = await bcrypt.compare(password, adminss.password);
        
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }
    
        const token = jwt.sign(
          { id: adminss._id, username: adminss.username, usertype:'hr' },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        console.log(token)
        // res.cookie('test', "123")
        res.cookie('authToken', token);
        res.status(200).json({
          message: 'Login successful',
          token,
          user: {
            id: adminss._id,
            username: adminss.username,
            usertype:'hr'
          }
        });
   
      } catch (error) { 
          console.error('Error during login:', error);
          res.status(500).json({ message: 'Server error' });
      }
    }
    )

app.post('/userRegistration', async (req, res) => {
    try {
        const { userID, applicantId, candidateName, jobPosition, applicationDate, password } = req.body;
        console.log(userID, applicantId, candidateName, jobPosition, applicationDate, password)
        const existingCandidate = await User.findOne({ candidateName });
        if (existingCandidate) {
          console.log('already exists')
          return res.status(400).json({ message: 'Username already exists' });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const newCandidate = new User({
            userID,
            applicantId,
            candidateName,
            jobPosition,
            applicationDate,
            password: hashedPassword
        });
    
        await newCandidate.save();
        res.status(201).json({ message: 'Candidate registered successfully' });
      } catch (error) {
        console.error('Error registering candidate:', error);
        res.status(500).json({ message: 'Server error' });
      }}
)
app.get('/getUser', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
})

app.put('/updateUser/:candidateName',authenticateToken, async (req, res) => {
    try {
        const name = req.params.candidateName;
        console.log(name)
        const { candidateName, jobPosition, status } = req.body;
        
        const updatedUser = await User.findOneAndUpdate(
            { candidateName: name }, jobPosition
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
})

app.delete('/deleteUser/:id', authenticateToken, async (req, res) => {
    try {
        const candidateName = req.params.id;    
        // const deletedUser = await User.findOne({candidateName});
        deletedUser=  await User.findOneAndDelete({candidateName});
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
})
app.get('/admin',authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adminHome.html'));
})

app.post('/admin/addJob', async (req, res) => {
    try {
        const {jobId ,jobTitle, jobDescription } = req.body;
        const newJob = new Job({
            jobId,  
            jobTitle,
            jobDescription
        });
        await newJob.save();
        res.status(201).json({ message: 'Job added successfully' });
    } catch (error) {
        console.error('Error adding job:', error);
        res.status(500).json({ message: 'Server error' });
    }
})
app.get('/login', async (req, res) => {

        try {
          const { username, password } = req.body;
      
          const candidate = await Candidate.findOne({ username });
          if (!candidate) {
            return res.status(401).json({ message: 'Invalid username or password' });
          }
    
          const isMatch = await bcrypt.compare(password, candidate.password);
          if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
          }
      
          const token = jwt.sign(
            { id: candidate._id, username: candidate.username },
            JWT_SECRET,
            { expiresIn: '1h' }
          );
          console.log(token)
          // res.cookie('test', "123")
          res.cookie('authToken', token);
          res.status(200).json({
            message: 'Login successful',
            token,
            user: {
              id: candidate._id,
              username: candidate.username,
            }
          });
     
        } catch (error) { 
            console.error('Error during login:', error);
            res.status(500).json({ message: 'Server error' });
        }
})

try {
    const uri = process.env.MONGO_URI;
    mongoose.connect(uri);
    const connection = mongoose.connection;

    connection.once('open', () => {
        console.log("MongoDB database connection established successfully");
    });
} catch (error) {
    console.error("Error connecting to MongoDB:", error);
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
