// CONFIGURACIÓN: Pega aquí la URL que te dio Google Apps Script después de desplegar
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPCXVKQ94CSS8qlwyNUreAjxrAFT6R_7U3Rqx2Ln1Akt6T9C5b0Lz3wIrMqCNfcO57/exec';

async function navigate(folderId = '') {
    const grid = document.getElementById('material-grid');
    const title = document.getElementById('page-title');
    const categorySpan = document.getElementById('current-category');

    // Mostrar estado de carga
    grid.innerHTML = '<div class="loading" style="padding: 2rem; text-align: center; width: 100%; grid-column: 1/-1;">Cargando material educativo...</div>';

    try {
        const url = folderId ? `${APPS_SCRIPT_URL}?folderId=${folderId}` : APPS_SCRIPT_URL;
        const response = await fetch(url);
        const result = await response.json();

        // Estructura de respuesta de la v2 (implementation_plan) o v1
        const data = result.data || result;

        renderContent(data);
        if (data.parentName) {
            categorySpan.innerText = data.parentName;
            title.innerText = 'Explora ' + data.parentName;
        }
    } catch (error) {
        grid.innerHTML = `<div class="error" style="padding: 2rem; color: #ff4444; grid-column: 1/-1;">Error conectando con Drive. Asegúrate de haber pegado la URL de Apps Script en script.js.</div>`;
        console.error(error);
    }
}

function renderContent(data) {
    const grid = document.getElementById('material-grid');
    grid.innerHTML = ''; // Limpiar grid

    // Renderizar Carpetas
    if (data.folders) {
        data.folders.forEach(folder => {
            const card = document.createElement('div');
            card.className = 'card folder pulse';
            card.onclick = () => navigate(folder.id);
            card.innerHTML = `
                <div class="icon">📁</div>
                <div class="card-info">
                    <h3>${folder.name}</h3>
                    <p>Subcarpeta de recursos</p>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Renderizar Archivos
    if (data.files) {
        data.files.forEach(file => {
            const card = document.createElement('div');
            card.className = 'card item';
            card.innerHTML = `
                <div class="icon">${getFileIcon(file.name)}</div>
                <div class="card-info">
                <h3>${file.name}</h3>
                <p>${file.size || 'Archivo'}</p>
                <span class="price">$4.990 CLP</span>
            </div>
            <div class="card-actions">
                <button class="btn-preview" onclick="handlePreview('${file.previewUrl}')">Vista Previa</button>
                <button class="btn-buy" onclick="handlePurchase('${file.id}', '${file.name}')">Comprar</button>
            </div>
            `;
            grid.appendChild(card);
        });
    }
}

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['mp4', 'mov', 'avi'].includes(ext)) return '🎬';
    if (['jpg', 'png', 'svg'].includes(ext)) return '🖼️';
    if (['zip', 'rar'].includes(ext)) return '📦';
    return '📝';
}

function handlePurchase(fileId, fileName) {
    alert(`Iniciando compra de: ${fileName}\n\nAquí conectaríamos con tu pasarela de pagos.`);
}

function handlePreview(url) {
    if (url && url !== 'undefined') {
        window.open(url, '_blank');
    } else {
        alert('Este archivo no tiene vista previa disponible.');
    }
}

// Carga inicial
window.onload = () => {
    if (APPS_SCRIPT_URL !== 'TU_URL_DE_DESPLIEGUE_AQUI') {
        navigate();
    } else {
        console.warn('Configura APPS_SCRIPT_URL en script.js para ver tus archivos de Drive.');
    }
};
