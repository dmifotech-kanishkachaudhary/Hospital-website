const doctorOnly = (req, res, next) => {
    console.log("Doctor Middleware:", req.user);

    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    if (req.user.role !== "doctor") {
        return res.status(403).json({
            message: "Doctor access only",
        });
    }

    next();

};

module.exports = doctorOnly;