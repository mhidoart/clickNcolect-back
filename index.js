const dotenv = require('dotenv')
dotenv.config({ path: './.env' })
const uuid = require('uuid');

const express = require('express')
const cors = require('cors');
var bodyParser = require('body-parser')

//multipart data
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const tab = file.originalname.split('.');
        const ext = tab[tab.length - 1];
        cb(null, file.fieldname + '-' + uniqueSuffix + "." + ext)
    }
})
const upload = multer({ storage: storage })



const app = express()
// create application/json parser
app.use(bodyParser.json())

const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const expressLayouts = require('express-ejs-layouts')

//firebase
const firebase = require('./db');
const firestore = firebase.firestore();

// models
const Restaurant = require('./model/restaurant')


// Static Files
app.use(express.static('public'))

app.use('/css', express.static(__dirname + 'public/css'))
app.use('/qr', express.static(__dirname + 'public/qr'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use(express.static('uploads'))
app.use('/uploads', express.static('./uploads'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors());


app.use(expressLayouts)

app.set('layout', './layouts/full-width')

app.set('view engine', 'ejs')


app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(cookieParser())
app.use(methodOverride('_method'))
// utils
const { toDateTime } = require('./utils');
const Menu = require('./model/menu');
//routes

//page principale 
app.get('/', async (req, res) => {
    try {
        const restaurants = await firestore.collection('restaurant');
        const data = await restaurants.get();
        const restoArray = [];
        if (data.empty) {
            res.status(404).send('No student record found');
        } else {
            data.forEach(doc => {
                const resto = new Restaurant(
                    doc.id,
                    doc.data().name,
                    doc.data().adresse,
                    doc.data().type,
                    toDateTime(doc.data().dt_ajout),
                    doc.data().age,
                    doc.data().phoneNumber,
                    doc.data().imgs,
                    doc.data().menus,
                );
                restoArray.push(resto)
            });

            res.render('index', { restaurants: restoArray, layout: './layouts/public' })
        }
    } catch (error) {
        res.status(400).send(error.message);

    }
})

//page ajouter restaurant
app.get('/addrestuarant', (req, res) => {
    res.render('addResto', { layout: './layouts/public' })
})

//ajouter un resto a la base de données
app.post('/addrestuarant', upload.single('imgResto'), async (req, res) => {
    console.log(req.file);
    try {
        const data = {
            name: req.body.name,
            adresse: req.body.adr,
            type: req.body.type,
            dt_ajout: new Date(),
            imgs: [req.file.filename], //list des images qui decrit le restaurant
            menus: [] //list des menu 
        }
        const student = await firestore.collection('restaurant').doc().set(data);
        res.send('Record saved successfuly')
    } catch (err) {
        res.status(400).send(err.message);
    }
})

//selectionner un resto par id unique
async function getRestoById(idResto) {
    try {

        const restoRecord = await firestore.collection('restaurant').doc(idResto);
        const data = await restoRecord.get();
        console.log(data.data())
        if (!data.exists) {
            return null;
        } else {
            return (new Restaurant(
                data.id,
                data.data().name,
                data.data().adresse,
                data.data().type,
                toDateTime(data.data().dt_ajout),
                data.data().imgs,
                data.data().menus))
        }
    } catch (error) {
        console.log(error)
        return null
    }
}
//menus

//page ajouter menu 
//params: idResto -> string
app.get('/addmenu', async (req, res) => {
    console.log(req.query.idResto);
    getRestoById(req.query.idResto).then(
        (resto) => {
            if (resto) {
                res.render('addmenu', { resto: resto, layout: './layouts/public' })

            } else {
                res.status(200).send("no record found !")
            }

        }
    );
})
//ajouter un menu a la base de données
app.post('/addMenu', upload.single('imgMenu'), async (req, res) => {
    console.log(req.file);
    try {

        idResto = req.body.id;
        //get the concerned resto
        const restoRecord = await firestore.collection('restaurant').doc(idResto);
        const data = await restoRecord.get();
        var resto = data.data()
        const menu = {
            id: uuid.v4(),
            nom: req.body.name,
            dt_creation: new Date().toLocaleDateString(),
            ingredient: req.body.ingredient.replace(/(\r\n|\n|\r)/gm, ";"),
            image: req.file.filename,
            produits: []
        }

        resto.menus.push(menu)
        console.log(resto);
        const record = await firestore.collection('restaurant').doc(idResto)
        await record.update(resto)
        res.redirect('/addmenu?idResto=' + idResto);



    } catch (error) {
        res.status(400).send(error.message);

    }



})


// ajouter produit to menu 

app.get('/addProductToMenu', async (req, res) => {
    console.log(req.query.idResto);
    console.log(req.query.idMenu);

    getRestoById(req.query.idResto).then(
        (resto) => {
            if (resto) {
                let menu = resto.menus.find(m => m.id == req.query.idMenu)
                res.render('addProductToMenu', { resto: resto, menu: menu, layout: './layouts/public' })

            } else {
                res.status(200).send("no record found !")
            }

        }
    );

})


//start server 
const port = process.env.PORT

app.listen(port, () => console.info(`App listening on port ${port}`))