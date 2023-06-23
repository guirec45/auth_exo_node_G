//import modules 

const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

///function middleware intégrée pars express , analyse requete

app.use(express.urlencoded({extended : true}));

///// connexion bdd

const connection = mysql.createConnection({
    host :'localhost',
    user :'root',
    password : '',
    database : 'auth_exo_node',
});

connection.connect((err)=>{
    if(err) throw err;
    console.log('connexion a la bdd OUI');
});

/////configuration ejs pour le moteur de templates

app.set('view engine', 'ejs');

////config express session 

app.use(
    session({
        secret : 'secret',
        resave :true,
        saveUninitialized : true,
    })
);

///middleware verifier la connexion du user 

const requireLogin = (req , res ,next)=> {
    if(!req.session.userId){
        res.redirect('/login');
    }else{
        next();
    }
};

///route 

app.get('/', requireLogin, (req ,res) =>{
    const isAdmin = req.session.isAdmin;
    const username = req.session.username;
    const email = req.session.email;
    req.render('home' , {isAdmin , username ,email});

});

/// register 

app.get('/register' , (req ,res)=>{
    res.render('register');
})

app.post('/register' , (req , res) => {
    const {username ,email , password , role } = req.body;
    // verifiez si users existe deja dans la bdd 
    const checkUserQuery = 'SELECT COUNT(*) AS count FROM users WHERE username = ? ';
    connection.query(checkUserQuery, [username,email , role], (err, results) => {
        if(err) throw err;
        const count = results[0].count;
        if(count > 0) {
            res.redirect('/register?error=user_exists');
        } else {
            // hash mdp 
            bcrypt.hash(password, 10, (err, hashedpassword) => {
                if(err) throw err;
                // insert users dans bdd 
                const insertUserQuery = 'INSERT INTO users(username ,email, password , role) VALUES (? , ? , ?)';
                connection.query(insertUserQuery, [username ,email , hashedpassword , role] , (err, results) => {
                    if(err) throw err;
                    res.redirect('/login');
                });
            });
        }

    });

});

///  login

app.get('/login' , (req , res) =>{
    res.render('login');
})

app.get('/login',(req,res) => {

})



//////server 
const port = 8080 ;
app.listen(port , () =>{
    console.log('connexion ok');
});