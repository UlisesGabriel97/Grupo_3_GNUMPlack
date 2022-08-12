const express = require ('express');
const app = express();
const path = require("path");
const port = 3001;
 

/* Requiriendo rutas */
let indexRouter = require('./routes/index');
let adminRouter = require('./routes/admin');
let cartRouter = require('./routes/cart')
let userRouter = require('./routes/user');
let productRouter = require('./routes/product')

/* Configurando view engine */
app.set('views', path.resolve(__dirname,'views'));
app.set("view engine", "ejs");

/* Middlewares (para poder usar json mas adelante)*/
app.use(express.json()); /* estes xd */
app.use(express.static(path.join(__dirname,"public")));


/* Rutas */
app.use("/", indexRouter);
app.use("/",userRouter);
app.use("/product",productRouter);
app.use("/cart", cartRouter);
app.use("/about", indexRouter)
app.use('/admin', adminRouter);



 app.listen(port, ()=> console.log(`Server rise in http://localhost:${port}`)) /* ctrol+click */ 