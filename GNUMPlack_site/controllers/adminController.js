//let fs = require('fs');
//let guardarProductos = (dato) => fs.writeFileSync(path.join(__dirname,"../data/products.json"),JSON.stringify(dato,null,4),'utf-8')
//guardarHistorial = (dato) => fs.writeFileSync(path.join(__dirname,'../data/productsRemoved.json'),JSON.stringify(dato,null,4),'utf-8')
//let productsRemoved = require('../data/productsRemoved.json')
//let products = require('../data/products.json');

const { validationResult } = require('express-validator');
const path = require('path');
const db = require('../database/models')



module.exports = {
    create :(req, res) =>{
        return res.render('admin/create');
    },
    
    store: (req, res) => {
        let errors = validationResult(req)
        //return res.send(req.fileValidationError)
        if (req.fileValidationError) {
            let image = {
                param: 'image',
                msg: req.fileValidationError,
            }
            errors.errors.push(image);
        }

        if (errors.isEmpty()){

            let { name, description, dimensions, category, condition, stock, price, qualities, discount, advantage} = req.body;

            let newAdvantages = advantage.split('--');
            let newQualities = qualities.split('--');
            //let newImage = image.split();
            

            let newProduct = {
                id: products[products.length - 1].id + 1,
                name: name,
                description: description,
                dimensions: dimensions,
                category: category,
                condition: condition !== "sin condicion" ? condition : "",
                stock: +stock,
                price: +price,
                discount: +discount,
                qualities: newQualities,
                advantage: newAdvantages,
                image: req.file.filename
            }

            products.push(newProduct)
            guardarProductos(products)

            return res.redirect('/admin/list')
        }else{

            let ruta = (dato) => fs.existsSync(path.join(__dirname, '..', 'public', 'img', 'products', dato))
            if (req.file && ruta(req.file.filename) && (req.file.filename !== "default-product-image.png")) {
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'img', 'products', req.file.filename))
            }

            res.render('admin/create',{
                errors: errors.mapped(),
                old:req.body
            })
        }
        },
    list :(req, res) =>{
        return res.render('admin/list',{
            products
        });
    },
    
    edit :(req, res) =>{
        db.Products.findOne({
            where: {
                id : req.params.id
            },
            include: [{
                all:true
            }]
        })
        .then(producto => {
            //return res.send(producto)
            res.render('admin/edit',{producto})
        })
        .catch(error => res.send(error))
    },

    update :(req,res) =>{
        let errors = validationResult(req)
        if (req.fileValidationError) {
            let image = {
                param: 'image',
                msg: req.fileValidationError,
            }
            errors.errors.push(image);
        }

        if (errors.isEmpty()) {

            db.Products.update({
                name: req.body.name,
                description: req.body.description,
                dimensions: req.body.dimensions,
                discount: +req.body.discount,
                price: +req.body.price,
                qualities: req.body.qualities,
                image: req.file.filename,
                stock: +req.body.stock,
                categories_products_id: +req.body.category,
                condition_id: +req.body.condition,
                updatedAt: new Date,
            },{
                where: {
                    id : +req.params.id
                }
            })
            .then(product => {
                res.redirect('/admin/list')
            })
            .catch(error => res.send(error))

        /* let {name,description,dimensions,category,condition,discount,price,qualities,stock,advantage} = req.body
        products.forEach(producto => {
            if (producto.id === id) {
                producto.name = name
                producto.description = description
                producto.dimensions = dimensions
                producto.category = category
                producto.condition = condition
                producto.discount = +discount
                producto.price = +price
                producto.qualities = qualities.split('--')
                producto.stock = +stock
                producto.advantage = advantage.split('--')
                producto.image = (req.file ? req.file.filename : producto.image)
            }
        })
        guardarProductos(products)
        return res.redirect(`/admin/list`) */

        } else {
            let ruta = (dato) => fs.existsSync(path.join(__dirname, '..', 'public', 'img', 'products', dato))
            if (req.file && ruta(req.file.filename) && (req.file.filename !== "default-product-image.png")) {
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'img', 'products', req.file.filename))
            }
            
            /* let id = +req.params.id
            let productoAEditar = products.find(producto => producto.id === id)

            res.render('admin/edit',{
                producto: productoAEditar,
                errors:errors.mapped()
            }) */

            db.Products.findOne({
                where: {
                    id : +req.params.id
                },
                include: [{
                    all:true
                }]
            })
            .then(producto => {
                res.render('admin/edit',{
                    producto,
                    errors:errors.mapped()
                })
            })
            .catch(error => res.send(error))
        }
    },

    trash:(req,res)=>{
        let idParams = +req.params.id
        db.Products.findOne({
            where: {id: idParams},
            include: [{
                all:true
            }] 
        })
        .then(producto => {
            //return res.send(producto)
            // Agrego el producto al historial
            db.Removed_products.create({
                name: producto.name,
                description: producto.description,
                dimensions: producto.dimensions,
                discount: producto.discount,
                price: producto.price,
                qualities: producto.qualities,
                advantages: producto.advantages,
                image: producto.image,
                stock: producto.stock,
                categories_products_id: producto.categoryProduct.id,
                conditions_id: producto.condition.id,
                createdAt: producto.createdAt,
                updatedAt: new Date
            })

            .then(historial => {
                db.Products.destroy({
                    where: {id: idParams}
                })
            })
            .then(producto => {
                res.redirect('/admin/listDeleted')
            })
        })
        .catch(error => res.send(error))
        
        /* let id = +req.params.id
        let productoEliminado = products.find(producto => producto.id === id)

        let productosActualizados = products.filter(producto => producto.id !== id)
        guardarProductos(productosActualizados)

        productoEliminado.id = productsRemoved[productsRemoved.length - 1].id -1
        productsRemoved.push(productoEliminado)
        guardarHistorial(productsRemoved)

        return res.redirect('/admin/list') */
    },

    history: (req,res) => {
        db.Removed_products.findAll()
        .then(productsRemoved => {
            return res.render('admin/listDeleted',{
                products:productsRemoved
            })
        })
    },

    restore: (req,res) => {
        let idParams = +req.params.id
        
        db.Removed_products.findOne({
            where: {id: idParams},
            include: [{
                all:true
            }] 
        })
        .then(producto => {
            //return res.send(producto)
            db.Products.create({
                name: producto.name,
                description: producto.description,
                dimensions: producto.dimensions,
                discount: producto.discount,
                price: producto.price,
                qualities: producto.qualities,
                advantages: producto.advantages,
                image: producto.image,
                stock: producto.stock,
                categories_products_id: producto.categoryProduct.id,
                conditions_id: producto.condition.id,
                createdAt: producto.createdAt,
                updatedAt: new Date
            })
            .then(eliminar => {
                db.Removed_products.destroy({
                    where: {id: idParams}
                })
            })
            .then(redireccion => {
                res.redirect('/admin/list')
            })
        })
        .catch(error => res.send(error))
        
        //let productoARestaurar = productsRemoved.find(producto => producto.id === id)
        //let productosEliminados = productsRemoved.filter(producto => producto.id !== id)
        //guardarHistorial(productosEliminados)
        //productoARestaurar.id = products[products.length -1].id +1
        //products.push(productoARestaurar)
        //guardarProductos(products)
    },

    destroy: (req,res) => {
        let idParams = +req.params.id
        db.Removed_products.destroy({
            where: {id:idParams}
        })
        .then(redireccion => {
            res.redirect('/admin/listDeleted')
        })
        
        //let productosEliminados = productsRemoved.filter(producto => producto.id !== id)
        //guardarHistorial(productosEliminados)
    }
}