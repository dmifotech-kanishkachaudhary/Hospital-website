const jwt = require("jsonwebtoken");


const protect = (req, res, next) => {
    try {

        console.log("Authorization Header:", req.headers.authorization);

        const authHeader = req.headers.authorization;

        // Check if authorization header is present
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        //extract token from header
        const token = authHeader.split(" ")[1];

        console.log("Token:", token);


        // Verify token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET);

            console.log("Decoded:", decoded);


        //store user information in request object
        req.user = decoded;

        next();
    } catch (error) {

        console.log(error);
        
        res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = protect;