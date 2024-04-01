const jwt = require("jsonwebtoken")
const SECUREKEY = process.env.JWT_SECRET || "123456789";

function verifyToken (req,res,next) {
    const authHeader = req.headers['authorization']

    // Extract the token from the Authorization header. The header is in
    // the format "Bearer <token>", so we split the string at the space
    // and get the second element, which is the token. If the header is
    // not present or does not match the expected format, we return a 401
    // Unauthorized status.
    const token = authHeader && authHeader.split(' ')[1]
    
    // If the token is null after the extraction, it means the header
    // was not present or did not match the expected format, so we
    // return a 401 Unauthorized status.
    if(token == null){
        return res.sendStatus(401).json({message:"No token provided"})
    }

    jwt.verify(token,SECUREKEY,(err, user) => {
        
        if(err){
            if(err.name === 'TokenExpiredError'){
                return res.status(401).json({message:"Your token has expired. Please login again"})
            }
            return res.sendStatus(403)
        }
        
        req.user = user
        next()
    })
}

module.exports = {
    verifyToken
}