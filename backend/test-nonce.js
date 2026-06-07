const axios = require('axios');
const cheerio = require('cheerio');

async function testExtraction() {
    try {
        const response = await axios.get('https://softpro.cl/activacion-telefonica/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36'
            }
        });
        
        const html = response.data;
        const $ = cheerio.load(html);
        
        console.log('Inputs ocultos de nonce encontrados:', $('input[name*="nonce"]').length);
        $('input[name*="nonce"]').each((i, el) => {
            console.log(`- Input name="${$(el).attr('name')}" value="${$(el).val()}"`);
        });

        const regexNonce = /["']?nonce["']?\s*:\s*["']([a-f0-9]+)["']/;
        const match = html.match(regexNonce);
        console.log('Regex Nonce:', match ? match[1] : 'No encontrado');

    } catch (e) {
        console.error('Error al hacer GET:', e.message);
    }
}

testExtraction();