const axios = require('axios');
const cheerio = require('cheerio');

async function testPost() {
    try {
        const response = await axios.get('https://softpro.cl/activacion-telefonica/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36'
            }
        });
        
        const html = response.data;
        const match = html.match(/["']?nonce["']?\s*:\s*["']([a-f0-9]+)["']/);
        const nonce = match ? match[1] : null;
        
        let sessionCookie = '';
        if (response.headers['set-cookie']) {
            sessionCookie = response.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        }

        console.log('Nonce:', nonce);
        console.log('Cookie:', sessionCookie);

        const formData = new URLSearchParams();
        formData.append('action', 'softpro_cid_get');
        formData.append('order', '136209'); // random order
        formData.append('install', '3672893 2576660 9311656 9869491 0886600 4207564 0855595 9703184 3244241'); // random install
        if (nonce) formData.append('nonce', nonce);

        const postResponse = await axios.post('https://softpro.cl/wp-admin/admin-ajax.php', formData.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://softpro.cl/activacion-telefonica/',
                'Cookie': sessionCookie
            }
        });

        console.log('POST Response:', postResponse.data);

    } catch (e) {
        console.error('Error:', e.message);
    }
}

testPost();