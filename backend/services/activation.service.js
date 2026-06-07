const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const { getRandomUserAgent } = require('../utils/userAgent');

const requestCID = async (order, install) => {
    // Configurar instancia base para mantener un timeout
    const httpClient = axios.create({
        timeout: 15000, 
    });

    const baserUrl = process.env.REMOTE_URL;
    if (!baserUrl) throw new Error('REMOTE_URL no configurada en las variables de entorno');

    const headersGet = {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
    };

    // 1. OBTENER PAGINA BASE: Extraer la cookie y el Nonce
    let getResponse;
    try {
        getResponse = await httpClient.get(baserUrl, { headers: headersGet });
    } catch (err) {
        throw new Error('Error al conectar con la página base remota');
    }

    const { data: html, headers: responseHeaders } = getResponse;

    // Extraer cookies (conservarlas para la sesión)
    let sessionCookie = '';
    if (responseHeaders['set-cookie']) {
        sessionCookie = responseHeaders['set-cookie'].map(c => c.split(';')[0]).join('; ');
    }

    // Extraer Nonce
    let nonce = null;
    const $ = cheerio.load(html);

    // Estrategia 1: Buscar un input oculto común de WP
    nonce = $('input[name="nonce"]').val() || 
            $('input[name="softpro_cid_get_nonce"]').val() ||
            $('input[name="_wpnonce"]').val();

    // Estrategia 2: Buscar en variables JavaScript globales creadas por WP
    if (!nonce) {
        const regexNonce = /["']?nonce["']?\s*:\s*["']([a-f0-9]+)["']/;
        const match = html.match(regexNonce);
        if (match && match[1]) {
            nonce = match[1];
        }
    }

    if (!nonce) {
        throw new Error('No fue posible obtener el nonce.');
    }

    // 2. ENVIAR FORMULARIO POST AL ADMIN-AJAX
    const postUrl = new URL('/wp-admin/admin-ajax.php', new URL(baserUrl).origin).href;
    
    const formData = new URLSearchParams();
    formData.append('action', 'softpro_cid_get');
    formData.append('order', order);
    formData.append('install', install);
    formData.append('nonce', nonce);

    const headersPost = {
        ...headersGet,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': baserUrl
    };

    if (sessionCookie) {
        headersPost['Cookie'] = sessionCookie;
    }

    let postResponse;
    try {
        postResponse = await httpClient.post(postUrl, formData.toString(), { headers: headersPost });
    } catch (err) {
        throw new Error('Error al contactar el endpoint ajax remoto.');
    }

    const json = postResponse.data;
    
    // Validar respuesta estructurada
    if (!json || typeof json !== 'object') {
        throw new Error('Respuesta inesperada del servidor.');
    }

    if (json.success === true && json.data && json.data.full) {
        return { success: true, cid: json.data.full };
    } else {
        // En caso de fallar o ser rechazada la clave
        return { 
            success: false, 
            error: (json.data && typeof json.data === 'string') ? json.data : 'La activación fue rechazada.' 
        };
    }
};

module.exports = {
    requestCID
};
