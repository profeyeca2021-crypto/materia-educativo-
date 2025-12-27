# Configuración de Google Apps Script (Versión Sugura)

Para evitar errores de sintaxis, borra TODO lo que tengas en tu archivo `Código.gs` y pega esto exactamente.

```javascript
/* COPIA DESDE AQUÍ */
const ROOT_FOLDER_ID = '1ErscfESIepYPOnevvIz-_WtpghLHQ9q3';

function doGet(e) {
  try {
    const folderId = e.parameter.folderId || ROOT_FOLDER_ID;
    const content = getFolderContent(folderId);
    return ContentService.createTextOutput(JSON.stringify(content)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getFolderContent(folderId) {
  const parent = DriveApp.getFolderById(folderId);
  const folders = parent.getFolders();
  const files = parent.getFiles();
  let result = {parentName: parent.getName(), folders: [], files: []};
  while (folders.hasNext()) {
    let f = folders.next();
    result.folders.push({id: f.getId(), name: f.getName(), type: 'folder'});
  }
  while (files.hasNext()) {
    let f = files.next();
    result.files.push({
      id: f.getId(), 
      name: f.getName(), 
      size: (f.getSize() / (1024 * 1024)).toFixed(2) + ' MB', 
      previewUrl: f.getUrl(),
      type: 'file'
    });
  }
  return result;
}
/* HASTA AQUÍ */
```

### Pasos para el éxito

1. **Borra todo:** En el editor de Apps Script, selecciona todo y dale a Suprimir.
2. **Pega limpia:** Pega el código de arriba.
3. **Guarda y Despliega:** Clic en Guardar (disco) y luego **Implementar > Gestionar implementaciones > Editar > Nueva versión > Implementar**.
