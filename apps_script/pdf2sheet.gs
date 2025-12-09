const FOLDER_ID = '11d7mWuOFaSJKcBLAeLjkKk2wK2O-ieTq';         
const BACKEND_URL = 'https://papyraceous-talkatively-jacqulyn.ngrok-free.dev/handle_pdf';
const PROCESADOS_PROP = 'PDFS_PROCESADOS';
const SHEETS_FOLDER_ID = '1ZawHkDATQaaKlzxi86jDdDIIW4hQ6JG6'; // carpeta donde crearás los sheets


function checkNewPdfs() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByType('application/pdf');
  const props = PropertiesService.getScriptProperties();
  const seen = JSON.parse(props.getProperty(PROCESADOS_PROP) || '[]');
  const newSeen = [...seen];
  while (files.hasNext()) {
    const file = files.next();
    const id = file.getId();

    if (seen.includes(id)) {
      Logger.log("PDF processed: " + file.getName());
      continue;
    }

    try {
      Logger.log("Sending PDF to backend: " + file.getName());
      const resp = sendPdfToBackend(file);
      let respObj = JSON.parse(resp);  
      let raw = respObj.parsed_data;

      // limpiar fences del LLM
      raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(raw);
      createSheetFromInvoice(parsed);
      newSeen.push(id);
    } catch (err) {
      Logger.log("error sending: " + file.getName() + " | " + err);
    }
  }

  props.setProperty(PROCESADOS_PROP, JSON.stringify(newSeen));
}


function sendPdfToBackend(file) {
  const blob = file.getBlob();
  const base64 = Utilities.base64Encode(blob.getBytes());
  const payload = {
    fileId: file.getId(),
    fileName: file.getName(),
    pdf: base64
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const resp = UrlFetchApp.fetch(BACKEND_URL, options);
  Logger.log("Backend responded: " + resp.getContentText());
  return resp.getContentText();
}


function createSheetFromInvoice(parsedData) {
  try {
    if (!parsedData || typeof parsedData !== 'object') {
      Logger.log("invalid parsedData");
      return null;
    }

    const sheetName = parsedData.invoice_number || 'Invoice_' + new Date().getTime();

    // Crear archivo en la carpeta
    const folder = DriveApp.getFolderById(SHEETS_FOLDER_ID);
    const newFile = SpreadsheetApp.create(sheetName);
    const sheetId = newFile.getId();
    folder.addFile(DriveApp.getFileById(sheetId));
    DriveApp.getRootFolder().removeFile(DriveApp.getFileById(sheetId));

    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    sheet.clear();

    // ======= Cabecera de la tabla =======
    const headers = [
      'Invoice Number', 'Invoice Date', 'Due Date', 'Total Amount',
      'Waybill Number', 'Ship Date', 'Shipper Name', 'Shipper Company',
      'Receiver Name', 'Piece Count', 'Billed Weight', 'Shipment Total Cost',
      'Item', 'Quantity', 'Unit', 'Weight', 'Unit Value', 'Total Value'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    let rowIndex = 2; // empieza después de la cabecera

    const shipments = parsedData.shipments || [];
    shipments.forEach(s => {
      const contents = Array.isArray(s.contents) ? s.contents : [s.contents];

      contents.forEach(item => {
        sheet.getRange(rowIndex, 1, 1, headers.length).setValues([[
          parsedData.invoice_number || '',
          parsedData.invoice_date || '',
          parsedData.due_date || '',
          parsedData.total_amount || '',

          s.waybill_number || '',
          s.ship_date || '',
          s.shipper_name || '',
          s.shipper_company || '',
          s.receiver_name || '',
          s.piece_count || '',
          s.billed_weight || '',
          s.shipment_total_cost || '',

          item.description || item || '',
          item.quantity || '',
          item.unit || '',
          item.weight || '',
          item.unit_value || '',
          item.total_value || ''
        ]]);
        rowIndex++;
      });
    });

    Logger.log("Sheet created: " + sheetName);
    return sheetId;

  } catch (err) {
    Logger.log("Error creating sheet: " + err);
    return null;
  }
}



