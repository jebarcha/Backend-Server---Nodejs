const { response } = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { genJWT } = require('../helpers/jwt');

const createUser = async (req, res = response) => {

    const { name, email, password } = req.body;

    try {
         // Verify email
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                ok: false,
                msg: 'User already exists with that email'
            });
        }

        // Create user with model
        const dbUser = new User(req.body);

        // Encript/Hash password
        const salt = bcrypt.genSaltSync();
        dbUser.password = bcrypt.hashSync(password, salt);

        // Generate JWT
        const token = await genJWT(dbUser.id, name);

        // Create user of DB
        await dbUser.save();

        // Generate response success
        return res.status(201).json({
            ok: true,
            uid: dbUser.id,
            name,
            email,
            token
        });

    } catch (error) {
        return res.json({
            ok: false,
            msg: 'Please call the administrator',
            error
        }); 
    }
}

const loginUser = async(req, res = response) => {

    const { email, password } = req.body;

    try {
        const dbUser = await User.findOne({ email });
        if (!dbUser) {
            return res.status(400).json({
                ok: false,
                msg: 'Email does not exists!'
            });
        }

        // verify password
        const validPassword = bcrypt.compareSync(password, dbUser.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Password incorrect!'
            });
        }

        // Generate JWT
        const token = await genJWT(dbUser.id, dbUser.name);

        // Response from service
        return res.json({
            ok: true,
            uid: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            token
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Talk with the administrator'
        });
    }  
}

const renewToken = async (req, res = response) => {

   const { uid } = req;

   // Read DB to get email
   const dbUser = await User.findById(uid);

   const token = await genJWT(uid, dbUser.name);

    return res.json({
        ok: true,
        uid,
        name: dbUser.name,
        email: dbUser.email,
        token
    });
}

module.exports = {
    createUser,
    loginUser,
    renewToken

}