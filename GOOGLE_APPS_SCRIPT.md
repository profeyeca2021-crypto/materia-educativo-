# Configuración del Backend (Google Apps Script)

Para conectar tu Google Drive con esta web, debes seguir estos pasos:

1. Ve a [script.google.com](https://script.google.com).
2. Crea un **Nuevo Proyecto**.
3. Pega el siguiente código en el archivo `Código.gs`:

```javascript
// ID de la carpeta raíz de tu repositorio en Drive
const ROOT_FOLDER_ID = '1ErscfESIepYPOnevvIz-_WtpghLHQ9q3';

function doGet(e) {
  const folderId = e.parameter.folderId || ROOT_FOLDER_ID;
  const data = getFolderContent(folderId);
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getFolderContent(folderId) {
  const parent = DriveApp.getFolderById(folderId);
  const folders = parent.getFolders();
  const files = parent.getFiles();
  
  let result = {
    parentName: parent.getName(),
    folders: [],
    files: []
  };
  
  while (folders.hasNext()) {
    let f = folders.next();
    result.folders.push({
      id: f.getId(),
      name: f.getName(),
      type: 'folder'
    });
  }
  
  while (files.hasNext()) {
    let f = files.next();
    // Link de vista previa (modo visor de Google Drive)
    const previewUrl = f.getUrl(); 
    
    result.files.push({
      id: f.getId(),
      name: f.getName(),
      size: (f.getSize() / (1024 * 1024)).toFixed(2) + ' MB',
      previewUrl: previewUrl,
      type: 'file'
    });
  }
  
  return result;
}
```

1. Haz clic en **Implementar > Nueva implementación**.
2. Selecciona **Aplicación web**.
3. En "Quién puede acceder", selecciona **Cualquier persona** (incluso anónimos, para que tu web pueda consultar).
4. Copia la **URL de la aplicación web** y pégala en tu archivo `script.js` para empezar a traer los datos reales.

### ¿Cómo manejar las ventas?

Cuando alguien hace clic en "Comprar", puedes usar una API de pagos (como Mercado Pago). Una vez confirmado el pago, puedes enviarle el link de Drive automáticamente por email o mostrarle un link de descarga temporal generado por este mismo Script.
