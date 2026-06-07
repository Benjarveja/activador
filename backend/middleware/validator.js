const validateActivationRequest = (req, res, next) => {
    const { order, install } = req.body;

    if (!order || !install) {
        return res.status(400).json({ success: false, error: 'Pedido inválido o Installation ID faltante.' });
    }

    // Validar orden: solo números
    const orderStr = String(order).trim();
    if (!/^\d+$/.test(orderStr)) {
        return res.status(400).json({ success: false, error: 'Pedido inválido.' });
    }

    // Validar y limpiar Installation ID: aceptar solo números y espacios
    let installStr = String(install);
    
    if (!/^[\d\s]+$/.test(installStr)) {
        return res.status(400).json({ success: false, error: 'Installation ID inválido.' });
    }

    // Limpiar: Eliminar múltiples espacios, tabs, saltos y conservar solo un espacio entre bloques
    installStr = installStr.replace(/\s+/g, ' ').trim();

    // Reasignar sanitizado al body
    req.body.order = orderStr;
    req.body.install = installStr;

    next();
};

module.exports = {
    validateActivationRequest
};
