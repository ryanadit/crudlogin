//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
//use session
const session = require('express-session');
//use passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();

 
//konfigurasi koneksi
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crud_db'
});

//sesi
app.use(session({
  secret: 'qwerdffdsfdggfhgfgsfgdsas',
  resave: true,
  saveUninitialized: true
}));
 
//connect ke database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    conn.query('SELECT * FROM users WHERE first_name = ? and password = ?', 
    [username, password], function(err, rows, fields) {
      if(err) return done(err);
    
      // if user not found
      if (rows.length <= 0) {
        return done('Incorrect username or password.');
      } 
      return done(null, rows[0]);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  conn.query('SELECT * FROM users WHERE id = ?', [id], function(err, user) {
    if(err) return done(err);
    done(null, user);
  });
});
 
//set views file
app.set('views',path.join(__dirname,'views'));
//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')(
  { secret: 'keyboard cat', resave: false, saveUninitialized: false })
);
//set folder public sebagai static folder untuk static file
app.use('/assets',express.static(__dirname + '/public'));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

app.get('/', isAuthenticated, function(req, res) {
  res.render('home', {title: 'Express JS'});
});

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/login',
  function(req, res){
    res.render('login');
  }
);
  
app.post('/login', 
  passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});
 
 


//route untuk halaman tambah
app.get('/tambah',(req, res) => {
  let sql = "SELECT * FROM product";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('product_view',{
      results: results
    });
  });
});
 
//route untuk insert data
app.post('/save',(req, res) => {
  let data = {product_name: req.body.product_name, product_price: req.body.product_price};
  let sql = "INSERT INTO product SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});
 
//route untuk update data
app.post('/update',(req, res) => {
  let sql = "UPDATE product SET product_name='"+req.body.product_name+"', product_price='"+req.body.product_price+"' WHERE product_id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});
 
//route untuk delete data
app.post('/delete',(req, res) => {
  let sql = "DELETE FROM product WHERE product_id="+req.body.product_id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/');
  });
});
 
//server listening
app.listen(4000, () => {
  console.log('Server is running at port 4000');
});