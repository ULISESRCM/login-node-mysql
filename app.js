//1 invocamos express
const express= require('express');
const app=express();


//2 seteamos urlencode para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());


//3 invovamos a dotnv 
const dotenv=require('dotenv');
//const { path } = require('express/lib/application');
dotenv.config({path:'./env/.env'});

//4 seteamos el directorio public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname +'/public'));

// 5 motor de plantillas

app.set('view enigme','ejs');

//6 invocamos a bcryptjs
const bcryptjs=require('bcryptjs');

 //7 var de session

 const session= require ('express-session');
 app.use(session({
     secret:'secret',
     resave: true,
     saveUninitialized: true
 }))

//8 invicamos al modulo de coneccion a la BD
const connection=require('./database/db.js');

//9 Estableciendo las rutas


app.get('/login', (req,res)=>{
    res.render('login.ejs');
})
app.get('/register', (req,res)=>{
    res.render('register.ejs');
})

//10- registracion
app.post('/register',async (req,res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const roll = req.body.roll;
    const pass = req.body.pass;
    
    let passwordHaash = await bcryptjs.hash(pass,8);
    
    connection.query("INSERT INTO users(user,name,roll,pass)  VALUES (?,?,?,?)",[user,name,roll,passwordHaash],async(error, results)=>{
        
        if(error){
            console.log(error);
        }else{
            res.render('register.ejs',{
                alert: true,
                alerTitle:"Registration",
                alertMessange:"¡Successful Registration!",
                alertIcon:'success',
                showConfirmButton:false,
                timer: 1500,
				ruta: ''
               
            })
        }
    })
   
})

//11 - autenticacion
app.post('/auth', async (req, res)=> {
	const user = req.body.user;
	const pass = req.body.pass;    
    let passwordHash = await bcryptjs.hash(pass, 8);
	if (user && pass) {
		connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results, fields)=> {
			if( results.length == 0|| !(await bcryptjs.compare(pass, results[0].pass)) ) {    
				res.render('login.ejs', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: 2000,
                        ruta: 'login'    
                    });
				
				//Mensaje simple y poco vistoso
                //res.send('Incorrect Username and/or Password!');				
			} else {         
				//creamos una var de session y le asignamos true si INICIO SESSION       
				req.session.loggedin = true;                
				req.session.name = results[0].name;
				res.render('login.ejs', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 2000,
					ruta: ''
				});        			
			}			
			
		});
	} else {	
		res.render('login.ejs',{
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "¡Por favor ingrese un usuario y/o password!",
            alertIcon:"warning",
            showConfirmButton: true,
            timer: 2000,
            ruta: 'login'
        });        			

        
		
	}
});

//12- Auth pages
app.get('/',(req,res)=>{
    if(req.session.loggedin){
    res.render('index.ejs',{
        login:true,
        name:req.session.name
        });
    }else{
        res.render('index.ejs',{
            login:false,
            name:'Debe inicar secion'
        })
    }
})

//13 - logout

app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    })
})




app.listen(3001,(req,res)=>{
    console.log("Sv up");
});