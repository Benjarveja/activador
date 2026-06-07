const activationService = require('../services/activation.service');

const generateCID = async (req, res, next) => {
    try {
        const { order, install } = req.body;
        
        const result = await activationService.requestCID(order, install);

        if (!result.success) {
            return res.status(400).json({ success: false, error: result.error || 'La activación fue rechazada.' });
        }

        // Devolver exitosamente el CID (propiedad 'full' renombrada a 'cid')
        return res.json({
            success: true,
            cid: result.cid
        });
        
    } catch (error) {
        console.error(`[Controller Error]`, error.message);
        
        let errorMessage = 'No fue posible contactar el servidor remoto.';
        
        if (error.message.includes('nonce')) {
            errorMessage = 'No fue posible obtener el nonce.';
        } else if (error.message.includes('inesperada')) {
            errorMessage = 'Respuesta inesperada del servidor.';
        }
        
        res.status(502).json({ success: false, error: errorMessage });
    }
};

module.exports = {
    generateCID
};
