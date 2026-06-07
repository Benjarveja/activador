// URL DEL BACKEND PROXY
// Para desarrollo local debe ser 'http://localhost:3000/api/generate'
// Para producción se cambiará por la URL de Render/Railway
const API_URL = 'http://localhost:3000/api/generate';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('activationForm');
    const orderInput = document.getElementById('order');
    const installInput = document.getElementById('install');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    
    const errorBox = document.getElementById('errorBox');
    const resultContainer = document.getElementById('resultContainer');
    const cidBlocks = document.getElementById('cidBlocks');
    const copyBtn = document.getElementById('copyBtn');
    const copyFeedback = document.getElementById('copyFeedback');

    let fullCIDText = '';

    // Filtrar Input de Pedido: Solo números
    orderInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d]/g, '');
    });

    // Filtrar y Limpiar Input del Installation ID
    installInput.addEventListener('input', (e) => {
        let val = e.target.value;
        // Solo permitir números y espacios, quitar todo lo demas (incluyendo tabs y saltos)
        val = val.replace(/[^\d\s]/g, '');
        // Reemplazar saltos de linea y tabs por espacio, luego colapsar multiples espacios
        val = val.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ');
        e.target.value = val;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset estados
        hideError();
        hideResult();
        setLoading(true);

        const order = orderInput.value.trim();
        const install = installInput.value.trim();

        if (!order || !install) {
            showError('Completa todos los campos correctamente.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order, install })
            });

            const data = await response.json();

            if (!response.ok || data.success === false) {
                showError(data.error || 'Ocurrió un error inesperado al consultar el servidor.');
            } else if (data.success && data.cid) {
                fullCIDText = data.cid;
                renderCID(fullCIDText);
                showResult();
            }

        } catch (error) {
            showError('No fue posible conectar con el intermediario.');
        } finally {
            setLoading(false);
        }
    });

    copyBtn.addEventListener('click', async () => {
        if (!fullCIDText) return;

        try {
            await navigator.clipboard.writeText(fullCIDText);
            
            copyFeedback.classList.remove('hidden');
            setTimeout(() => {
                copyFeedback.classList.add('hidden');
            }, 3000);
            
        } catch (err) {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = fullCIDText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            textArea.remove();

            copyFeedback.classList.remove('hidden');
            setTimeout(() => {
                copyFeedback.classList.add('hidden');
            }, 3000);
        }
    });

    function renderCID(cidString) {
        cidBlocks.innerHTML = '';
        const blocks = cidString.split(' ').filter(b => b.length > 0);
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        
        blocks.forEach((blockText, index) => {
            const div = document.createElement('div');
            div.className = 'cid-block';

            const letterSpan = document.createElement('span');
            letterSpan.className = 'cid-letter';
            letterSpan.textContent = letters[index] ? `${letters[index]}: ` : '';

            const textSpan = document.createElement('span');
            textSpan.textContent = blockText;

            div.appendChild(letterSpan);
            div.appendChild(textSpan);

            cidBlocks.appendChild(div);
        });
    }

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Consultando...';
            btnSpinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Obtener ID de Confirmación';
            btnSpinner.classList.add('hidden');
        }
    }

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.classList.remove('hidden');
    }

    function hideError() {
        errorBox.classList.add('hidden');
        errorBox.textContent = '';
    }

    function showResult() {
        resultContainer.classList.remove('hidden');
    }

    function hideResult() {
        resultContainer.classList.add('hidden');
    }
});
