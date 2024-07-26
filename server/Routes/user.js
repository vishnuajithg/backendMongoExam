const express = require('express')
  
// const  authenticateToken  = require('../Middleware/auth.js');

const router = express.Router();

router.get('/', () => {
    //code goes here
});

// router.post('/loginChecker', loginCandidate);
// router.get('/candidateHome',authenticateToken,candidateHome);
// router.post('/completeRegistrationCandidate',authenticateToken, completeRegistrationCandidate);
// router.post("/logout", logout)

module.exports = router;