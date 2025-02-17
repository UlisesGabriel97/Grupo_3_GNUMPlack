const path = require('path');
const { validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const db = require('../database/models')

module.exports = {
    signin: (req, res) => {
        return res.render('users/signin')
    },
    processRegister: (req, res) => {
        let errors = validationResult(req);
        if (req.fileValidationError) {
            let image = {
                param: 'imageUser',
                msg: req.fileValidationError,
            }
            errors.errors.push(image);
        }
        if (errors.isEmpty()) {
            let { name, lastName, email, pass, phoneNumber, city, gender, sesion } = req.body;
            //return res.send(req.body)
            db.Users.create({
                first_name: name,
                last_name: lastName,
                email: email,
                password: bcryptjs.hashSync(pass, 12),
                phoneNumber: 1123456789,
                city: 'undefined',
                genders_id: 1,
                image: req.file ? req.file.filename : "default-profile-image.jfif",
                categories_users_id: 1
            })
                .then(user => {
                    if (sesion == 'on') {                        
                        req.session.userLogin = {
                            id: user.id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email,
                            image: req.file ? user.image : "default-profile-image.jfif",
                            categories_users_id: 1,
                            cart: 0
                        }
                    res.cookie('recordar', req.session.userLogin, { maxAge: 1000 * 60 * 60 * 24 })
                    }
                    return res.redirect('/')
                })
                .catch(errors => res.send(errors))

        } else {

            return res.render('users/signin', {
                errors: errors.mapped(),
                old: req.body
            })
        }
    },

    login: (req, res) => {
        return res.render('users/login')
    },
    processLogin: (req, res) => {
        let errors = validationResult(req)
        // return res.send(errors); 
        if (errors.isEmpty()) {

            const { email, recordame } = req.body
            db.Users.findOne({
                where: {
                    email
                }
            })
                .then(userLogin => {
                    let user = userLogin
                    //return res.send(user)
                    db.Carts.findAll({
                        where: {
                            users_id: user.id
                        },
                        include: [{
                            all: true
                        }]
                    })
                    .then(carts => {
                        //return res.send(carts)
                        let productInCart = 0;
                        carts.forEach(cart => {
                            if (cart.order.status == 'pending') {
                                productInCart = 1
                            }
                        });
                        req.session.userLogin = {
                            id: user.id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email,
                            image: user.image,
                            categories_users_id: user.categories_users_id,
                            cart: productInCart
                        }
                        //return res.send(req.session.userLogin)
                        if (recordame) {
                            res.cookie('recordar', req.session.userLogin, { maxAge: 1000 * 60 * 60 * 24 })
                        }
                        return res.redirect('/')
                    })
                })
                .catch(err => res.send(err))
        } else {
            //return res.send(req.body)
            return res.render('users/login', {
                errors: errors.mapped(),
                old: req.body
            })
        }
    },
    profile: (req, res) => {
        db.Users.findOne({
            where: {
                id: req.session.userLogin.id,
            }
        })
        .then(user => {
            return res.render('users/profile',{user})
        })
        .catch(err => res.send(err))
    },
    editUser: (req, res) => {

        db.Users.findOne({
            where: {
                id: req.session.userLogin.id
            }
        })
            .then((user) => {
                //return res.send(user)//
                return res.render('users/editUser', {
                    user
                });
            })
            .catch((error) => res.send(error));

    },
    processEdit: (req, res) => {
        let errors = validationResult(req);
        //return res.send(errors)
        if (req.fileValidationError) {
            let image = {
                param: 'imageUser',
                msg: req.fileValidationError,
            }
            errors.errors.push(image);
        }
        if (errors.isEmpty()) {
            let { first_name, last_name, email, phoneNumber, city} = req.body;
        
           // return res.send(req.body)
            db.Users.findOne({
                where: {
                    id: req.session.userLogin.id,
                }/* ,
                include: [{
                    all: true,
                }] */
            })
            .then(user => {
            db.Users.update({
            first_name: first_name,
            last_name: last_name,
            email: email,   
            phoneNumber: +phoneNumber,
            city: city,
            updatedAt: new Date,
            image: req.file ? req.file.filename : user.image,
        },{
            where: {id: req.session.userLogin.id}
        }
        )
        .then(usuario => res.redirect("/user/profile"))
        .catch(error => res.send(error))
    })} else {
        db.Users.findOne({
            where: {
                id: req.session.userLogin.id,
            }
        })
        .then(user => {
            //console.log(user);
            //console.log(errors.mapped());
            res.render('users/editUser',{
                user,
                errors: errors.mapped()
            })
        })
        .catch(err => res.send(err))
    }
    }, 


    logout: (req, res) => {
        req.session.destroy();
        if (req.cookies.recordar) {
            res.cookie('recordar', '', { maxAge: -1 })
        }


        return res.redirect('/')
    },



}

