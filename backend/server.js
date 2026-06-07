require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api.routes');

const app = express();

// Seguridad con Helmet
app.use(helmet());

// Configuración estricta de CORS
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5500';
app.use(cors({
    origin: frontendURL,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Logging HTTP
app.use(morgan('dev'));

// Parseo de body como JSON
app.use(express.json());

// Prevención de abusos con Express Rate Limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // Limitar cada IP a 50 peticiones por ventana
    message: { success: false, error: 'Demasiadas peticiones. Intente nuevamente más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', apiLimiter);

// Rutas
app.use('/api', apiRoutes);

// Manejo de rutas inexistentes
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// Manejo centralizado de errores (ocultando stack trace en producción)
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    res.status(500).json({ success: false, error: 'Ocurrió un error inesperado en el servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en el puerto ${PORT}`);
});
