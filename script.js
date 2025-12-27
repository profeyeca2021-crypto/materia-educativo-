// CONFIGURACIÓN: Pega aquí la URL que te dio Google Apps Script después de desplegar
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPCXVKQ94CSS8qlwyNUreAjxrAFT6R_7U3Rqx2Ln1Akt6T9C5b0Lz3wIrMqCNfcO57/exec';

// Historial de navegación para poder volver atrás
let navigationHistory = [];

async function navigate(folderId = '', folderName = 'Inicio', isBack = false) {
    const grid = document.getElementById('material-grid');
    const title = document.getElementById('page-title');
    const categorySpan = document.getElementById('current-category');

    // Gestionar historial 
    if (!isBack) {
        if (folderId === '') {
            navigationHistory = [{ id: '', name: 'Inicio' }];
        } else {
            navigationHistory.push({ id: folderId, name: folderName });
        }
    }

    // Actualizar migas de pan interactivas
    updateBreadcrumbs();

    // Mostrar estado de carga
    grid.innerHTML = '<div class="loading" style="padding: 2rem; text-align: center; width: 100%; grid-column: 1/-1;">Cargando material educativo...</div>';

    try {
        const url = folderId ? `${APPS_SCRIPT_URL}?folderId=${folderId}` : APPS_SCRIPT_URL;
        const response = await fetch(url);
        const result = await response.json();

        const data = result.data || result;

        renderContent(data);

        const currentName = data.parentName || folderName;
        if (categorySpan) categorySpan.innerText = currentName;
        if (title) title.innerText = 'Explora ' + currentName;

    } catch (error) {
        grid.innerHTML = `<div class="error" style="padding: 2rem; color: #ff4444; grid-column: 1/-1;">Error conectando con Drive. Asegúrate de haber pegado la URL de Apps Script en script.js.</div>`;
        console.error(error);
    }
}

function updateBreadcrumbs() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;
    breadcrumb.innerHTML = '';

    navigationHistory.forEach((item, index) => {
        const span = document.createElement('span');
        span.innerText = item.name;
        span.style.cursor = 'pointer';
        span.style.color = index === navigationHistory.length - 1 ? 'var(--primary)' : 'inherit';
        span.style.fontWeight = index === navigationHistory.length - 1 ? '700' : '400';

        span.onclick = () => {
            if (index === navigationHistory.length - 1) return; // Ya estamos aquí
            // Recortar historial hasta el nivel seleccionado
            navigationHistory = navigationHistory.slice(0, index + 1);
            navigate(item.id, item.name, true);
        };

        breadcrumb.appendChild(span);
        if (index < navigationHistory.length - 1) {
            const separator = document.createElement('span');
            separator.innerText = ' > ';
            separator.style.cursor = 'default';
            breadcrumb.appendChild(separator);
        }
    });
}

function goBack() {
    if (navigationHistory.length > 1) {
        navigationHistory.pop(); // Quitar la actual
        const last = navigationHistory[navigationHistory.length - 1];
        navigate(last.id, last.name, true);
    }
}

function renderContent(data) {
    const grid = document.getElementById('material-grid');
    grid.innerHTML = ''; // Limpiar grid

    // Añadir botón de volver si no estamos en el inicio
    if (navigationHistory.length > 1) {
        const backCard = document.createElement('div');
        backCard.className = 'card folder back-button';
        backCard.style.border = '1px dashed var(--primary)';
        backCard.onclick = goBack;
        backCard.innerHTML = `
            <div class="icon">⬅️</div>
            <div class="card-info">
                <h3>Volver</h3>
                <p>Regresar a carpeta anterior</p>
            </div>
        `;
        grid.appendChild(backCard);
    }

    // Renderizar Carpetas
    if (data.folders) {
        data.folders.forEach(folder => {
            const card = document.createElement('div');
            card.className = 'card folder pulse';
            card.onclick = () => navigate(folder.id, folder.name);
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

            // Verificación robusta del link de preview
            const hasPreview = file.previewUrl && file.previewUrl !== 'undefined' && file.previewUrl !== '';
            const previewAction = hasPreview ? `handlePreview('${file.previewUrl}')` : `alert('Vista previa no disponible para este archivo')`;

            card.innerHTML = `
                <div class="icon">${getFileIcon(file.name)}</div>
                <div class="card-info">
                    <h3>${file.name}</h3>
                    <p>${file.size || 'Archivo'}</p>
                    <span class="price">$4.990 CLP</span>
                </div>
                <div class="card-actions">
                    <button class="btn-preview" onclick="${previewAction}" ${!hasPreview ? 'style="opacity:0.5"' : ''}>Vista Previa</button>
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
    if (url) {
        window.open(url, '_blank');
    }
}

// Carga inicial
window.onload = () => {
    if (APPS_SCRIPT_URL !== 'TU_URL_DE_DESPLIEGUE_AQUI') {
        navigate();
    }
};
