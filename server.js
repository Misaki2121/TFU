const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const port = 3000;

// Configuración de la conexión a la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Middleware para manejar JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Habilitar CORS
app.use(cors());

// Configurar Content Security Policy con Helmet
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com"],
                connectSrc: ["'self'", "http://localhost:3000"],
            },
        },
    })
);

// Ruta para obtener todos los conductores
app.get('/conductores', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM conductores');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los conductores');
    }
});

// Ruta para registrar un nuevo conductor
app.post('/conductores', async (req, res) => {
    const { nombre, numero_economico } = req.body;
    console.log('Datos recibidos:', { nombre, numero_economico }); // Log para verificar los datos

    try {
        const result = await pool.query(
            'INSERT INTO conductores (nombre, numero_economico, rutas_lunes, rutas_martes, rutas_miercoles, rutas_jueves, rutas_viernes, rutas_sabado, puntaje, estado) VALUES ($1, $2, 0, 0, 0, 0, 0, 0, 0, $3) RETURNING *',
            [nombre, numero_economico, 'Expulsión']
        );
        console.log('Conductor guardado:', result.rows[0]); // Log para verificar el guardado
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al guardar el conductor:', error); // Log para errores
        res.status(500).send('Error al registrar el conductor');
    }
});

// Ruta para actualizar puntaje y estado
app.put('/conductores/:id', async (req, res) => {
    const { id } = req.params;
    const { rutas_lunes, rutas_martes, rutas_miercoles, rutas_jueves, rutas_viernes, rutas_sabado } = req.body;

    try {
        // Calcular puntaje
        const puntaje = (rutas_lunes + rutas_martes + rutas_miercoles + rutas_jueves + rutas_viernes) * 5 + rutas_sabado * 5;
        const estado = puntaje > 70 ? 'Se mantiene en la empresa' : 'Expulsión';

        const result = await pool.query(
            'UPDATE conductores SET rutas_lunes = $1, rutas_martes = $2, rutas_miercoles = $3, rutas_jueves = $4, rutas_viernes = $5, rutas_sabado = $6, puntaje = $7, estado = $8 WHERE id = $9 RETURNING *',
            [rutas_lunes, rutas_martes, rutas_miercoles, rutas_jueves, rutas_viernes, rutas_sabado, puntaje, estado, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el conductor');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
