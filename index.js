const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

const tokenSecret = "My$ecr3t";
const refreshTokenSecret = "MyR3fr3$hS3cret";

const getToken = (username) =>
    jwt.sign(
        { "user": username },
        tokenSecret,
        {
            expiresIn: '1m'
        }
    );

const getRefreshToken = (username) =>
    jwt.sign(
        { "user": username },
        refreshTokenSecret,
        {
            expiresIn: '1d'
        }
    );

const usuarios = [
    {
        "username": "Briseida",
        "password": "Br1$$",
        "rol": "USUARIO"
    },
    {
        "username": "Christian",
        "password": "Ch1$",
        "rol": "ADMIN"
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

app.use(cors());
app.use(express.json());

app.listen(3000,
    () => console.log("Servidor ejecutando en el puerto 3000"));


app.get('/', (req, res) => {
    res.send("Servidor Express, start page");
});

app.post('/login', (req, res) => {
    console.log('> Login ------------------------------');
    let username = req.body.usuario;
    let password = req.body.password;

    console.log('Usuario: ' + username);

    let usuario = usuarios.find(u => u.username === username &&
                u.password === password);
    if (usuario) {
        let token = getToken(username)
        let refreshToken = getRefreshToken(username);

        res.json({
            "token": token,
            "refreshToken": refreshToken,
            "rol": usuario.rol,
            "success": true
        });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/refresh', (req, res) => {
    console.log('> Refresh ------------------------------');
    let auth = req.headers['authorization'];
    if (!auth) {
        res.status(401)
            .json({
                "error": "Usuario no autorizado"
            });
    }
    let refreshToken = auth.split(" ")[1];

    try {
        if (jwt.verify(refreshToken, refreshTokenSecret)) {
            let username = req.body.usuario;

            let token = getToken(username);
            let refreshToken = getRefreshToken(username);

            let usuario = usuarios.find(u => u.username === username);

            res.json({
                "token": token,
                "refreshToken": refreshToken,
                "rol": 'REFRESH',
                "success": true
            });
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

app.get('/cuentas/:usuario', (req, res) => {
    console.log('> Cuentas ------------------------------');
    let auth = req.headers['authorization'];
    if (!auth) {
        res.status(401)
            .json({
                "error": "Usuario no autorizado"
            });
    }
    let token = auth.split(" ")[1];

    try {
        if (jwt.verify(token, tokenSecret)) {
            let username = req.params.usuario;

            let cuentasUsuario = cuentas.filter(c => c.username === username);

            console.log("Cuentas del usuario " + username, cuentasUsuario);

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