const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

const usuarios = [
    {
        "username": "Briseida",
        "password": "Br1$$"
    },
    {
        "username": "Christian",
        "password": "Ch1$"
    }
];

const cuentas = [
    {
        "username": "Briseida",
        "type": "ahorros",
        "saldo": 1000000,
    },
    {
        "username": "Christian",
        "type": "ahorros",
        "saldo": 10000000,
    },
    {
        "username": "Humberto",
        "type": "ahorros",
        "saldo": 100000,
    },
    {
        "username": "Briseida",
        "type": "cheques",
        "saldo": 100,
    }
];

app.use(express.json());
app.listen(3000, 
    () => console.log("Servidor ejecutando en el puerto 3000"));


app.get('/', (req, res) => {
    res.send("Servidor Express, start page");
});

app.post('/login', (req, res) => {
    let usuario = req.body.usuario;
    let password = req.body.password;

    console.log('Usuario: ' + usuario + ", Password: " + password);

    let existeUsuario = usuarios.find((u) => u.username === usuario && 
                u.password === password);
    if (existeUsuario) {
        let token = jwt.sign({"user": usuario}, "llaveprivada");
        res.json({
            "token": token,
            "success": true
        });
    } else {
        res.json({
            success: false
        });
    }
});

app.get('/cuentas/:usuario', (req, res) => {
    let auth = req.headers['authorization'];
    if (!auth) {
        res.json({
            "error": "Usuario no autorizado"
        });
    }
    let token = auth.split(" ")[1];
    
    try {
        if (jwt.verify(token, "llaveprivada")) {
            let username = req.params.usuario;

            let cuentasUsuario = cuentas.filter(c => c.username === username);
            console.log(cuentasUsuario);
            res.json(cuentasUsuario);
        } else {
            res.json({
                "error": "Token incorrecto"
            });
        }
    } catch {
        res.status(403);
        res.json({
            "success": false,
            "error": "Token incorrecto"
        });
    }
});