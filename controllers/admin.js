const { QueryTypes } = require('sequelize')
const sequelize = require("../models")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const register = async (req,res) => {
    const { username, password} = req.body;

    try {
        const [user] = await sequelize.query(`
        SELECT * FROM admin WHERE username = ?
        `, {
            replacements: [username],
            type: QueryTypes.SELECT
        });

        if (user) {
            return res.status(400).json({ message: "Username is already registered , Please use another username" });
        }

        //Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); //10 is salt rounds
        await sequelize.query(`
        INSERT INTO admin 
        (username, password) 
        VALUES (?, ?)
        `, {
            replacements: [username, hashedPassword],
            type: QueryTypes.INSERT
        });
        res.status(201).json({ message: "User created successfully" })

    } catch (error) {
        res.status(500).json({ message: "Failed to insert user " + error.message });
    }
}


const login = async (req,res) =>{

    const { username, password } = req.body;

    try {
        const [user] = await sequelize.query(`
            SELECT * FROM admin 
            WHERE username = ?
        `, {
            replacements: [username],
            type: QueryTypes.SELECT
        });

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: "600s"
        });

        return res.status(200).json({ message: "Login Successful", token: token });

    } catch (error) {
        res.status(500).json({ message: "Failed to Login " + error.message });
    }
}

module.exports = { 
    register,
    login
}