/**
 * Librería para imprimir en impresora térmica POS-5890A
 * Formato: 58mm de ancho, ESC/POS
 */

export interface TicketData {
  numeroTicket: string;
  nombreNegocio: string;
  mesa?: string;
  mesero?: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    notas?: string;
  }>;
  subtotal: number;
  impuesto?: number;
  total: number;
  metodo_pago?: string;
  observaciones?: string;
  fecha: string;
  hora: string;
}

/**
 * Genera el comando ESC/POS para la impresora térmica
 */
export function generarComandoESCPOS(data: TicketData): Uint8Array {
  const lines: string[] = [];
  const lineWidth = 42; // 58mm / 1.38 caracteres por mm ≈ 42 caracteres

  // Función auxiliar para centrar texto
  const center = (text: string): string => {
    const spaces = Math.max(0, Math.floor((lineWidth - text.length) / 2));
    return ' '.repeat(spaces) + text;
  };

  // Función auxiliar para separadores
  const separator = (): string => '-'.repeat(lineWidth);

  // INICIO: Reset de la impresora
  lines.push('\x1B\x40'); // ESC @

  // TAMAÑO NORMAL
  lines.push('\x1B\x21\x00'); // ESC ! 0

  // Encabezado
  lines.push(center(data.nombreNegocio || 'MAZUHI'));
  lines.push(center('='.repeat(lineWidth / 2)));
  lines.push('');

  // Información del ticket
  lines.push(`Ticket: ${data.numeroTicket}`);
  if (data.mesa) {
    lines.push(`Mesa: ${data.mesa}`);
  }
  if (data.mesero) {
    lines.push(`Mesero: ${data.mesero}`);
  }
  lines.push(`${data.fecha} ${data.hora}`);
  lines.push(separator());
  lines.push('');

  // Encabezado de items
  lines.push('DESCRIPCIÓN          CANT  PRECIO');
  lines.push(separator());

  // Items
  data.items.forEach((item) => {
    // Nombre del producto (truncado si es muy largo)
    let itemName = item.nombre.substring(0, 22);
    const qty = item.cantidad.toString().padStart(3, ' ');
    const price = `$${item.subtotal.toFixed(2)}`.padStart(10, ' ');

    // Construir línea
    const line = itemName.padEnd(22, ' ') + qty + price;
    lines.push(line);

    // Precio unitario
    if (item.cantidad > 1) {
      const unitPrice = `($${item.precio_unitario.toFixed(2)} c/u)`.padStart(35, ' ');
      lines.push(unitPrice);
    }

    // Notas del item si existen
    if (item.notas) {
      const notasLine = `  Nota: ${item.notas}`;
      lines.push(notasLine);
    }
  });

  lines.push('');
  lines.push(separator());

  // Observaciones del pedido (si existen)
  if (data.observaciones && data.observaciones.trim().length > 0) {
    lines.push('OBSERVACIONES:');
    // Dividir observaciones en líneas de máximo 40 caracteres
    const obsLines = data.observaciones.match(/.{1,40}/g) || [];
    obsLines.forEach((line) => {
      lines.push(line);
    });
    lines.push('');
    lines.push(separator());
  }

  // Totales
  lines.push('');
  const subtotalLine = `Subtotal: $${data.subtotal.toFixed(2)}`.padStart(lineWidth, ' ');
  lines.push(subtotalLine);

  if (data.impuesto && data.impuesto > 0) {
    const impuestoLine = `Impuesto: $${data.impuesto.toFixed(2)}`.padStart(lineWidth, ' ');
    lines.push(impuestoLine);
  }

  // TOTAL EN GRANDE
  lines.push('\x1B\x21\x10'); // ESC ! 16 - Doble altura y ancho
  const totalLine = `TOTAL: $${data.total.toFixed(2)}`;
  lines.push(center(totalLine));
  lines.push('\x1B\x21\x00'); // Volver a normal

  lines.push('');

  // Método de pago
  if (data.metodo_pago) {
    lines.push(center(`Pago: ${data.metodo_pago}`));
  }

  lines.push('');
  lines.push(center('Gracias por su compra!'));
  lines.push(center('='.repeat(lineWidth / 2)));

  // Saltos de línea finales para que salga del papel
  lines.push('\n\n\n\n');

  // Corte de papel (si la impresora lo soporta)
  lines.push('\x1D\x56\x00'); // GS V 0

  return new TextEncoder().encode(lines.join('\n'));
}

/**
 * Imprime en la impresora térmica USB
 */
export async function imprimirEnTérmica(data: TicketData): Promise<boolean> {
  try {
    // Verificar si la API WebUSB está disponible
    // @ts-ignore - WebUSB API no está en tipos estándar
    if (!navigator.usb) {
      throw new Error('La API WebUSB no está disponible en este navegador');
    }

    // Solicitar acceso a dispositivos USB
    // @ts-ignore
    const devices = await navigator.usb.getDevices();
    
    // Buscar la impresora POS-5890A
    // Vendor ID típico: 0x0483 (STMicroelectronics) o 0x1504
    let device = devices.find(
      (d: any) => d.productName?.includes('POS-5890') || d.productName?.includes('Thermal')
    );

    if (!device) {
      // Si no está conectada, pedir que se conecte
      // @ts-ignore
      device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x0483 }, { vendorId: 0x1504 }],
      });
    }

    if (!device) {
      throw new Error('No se encontró la impresora térmica');
    }

    // Abrir la conexión
    await device.open();

    // Reclamar la interfaz
    await device.claimInterface(0);

    // Generar comando ESC/POS
    const comando = generarComandoESCPOS(data);

    // Enviar a la impresora
    await device.transferOut(1, comando);

    // Cerrar la conexión
    await device.close();

    return true;
  } catch (error: any) {
    console.error('Error de impresión térmica:', error.message);
    throw error;
  }
}

/**
 * Alternativa: Imprime usando print() del navegador para impresoras instaladas
 */
export function imprimirViaBrowser(data: TicketData): void {
  const html = generarHTMLTicket(data);
  const ventana = window.open('', '_blank');
  if (ventana) {
    ventana.document.write(html);
    ventana.document.close();
    setTimeout(() => {
      ventana.print();
    }, 100);
  }
}

/**
 * Genera HTML para visualización / impresión por navegador
 */
function generarHTMLTicket(data: TicketData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket ${data.numeroTicket}</title>
      <style>
        body {
          margin: 0;
          padding: 10px;
          font-family: 'Courier New', monospace;
          width: 58mm;
          background: white;
        }
        .ticket {
          width: 100%;
          text-align: center;
        }
        .header {
          border-bottom: 1px solid #000;
          margin-bottom: 10px;
          padding-bottom: 5px;
        }
        .items {
          text-align: left;
          margin: 10px 0;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin: 2px 0;
        }
        .item-name {
          flex: 1;
        }
        .item-qty {
          width: 30px;
          text-align: right;
        }
        .item-price {
          width: 40px;
          text-align: right;
        }
        .separator {
          border-bottom: 1px dashed #000;
          margin: 5px 0;
        }
        .totals {
          margin: 10px 0;
          font-weight: bold;
        }
        .total-amount {
          font-size: 16px;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 5px 0;
          margin: 5px 0;
        }
        .observations {
          background: #f5f5f5;
          padding: 5px;
          margin: 5px 0;
          font-size: 10px;
          border-left: 3px solid #ff9800;
        }
        .footer {
          border-top: 1px solid #000;
          margin-top: 10px;
          padding-top: 5px;
          font-size: 10px;
        }
        @media print {
          body { margin: 0; padding: 0; width: 58mm; }
          .ticket { page-break-after: always; }
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <h2>${data.nombreNegocio || 'MAZUHI'}</h2>
          <p style="margin: 5px 0; font-size: 12px;">Ticket: ${data.numeroTicket}</p>
          <p style="margin: 2px 0; font-size: 10px;">${data.fecha} ${data.hora}</p>
        </div>

        ${data.mesa ? `<p style="margin: 5px 0;">Mesa: ${data.mesa}</p>` : ''}
        ${data.mesero ? `<p style="margin: 5px 0;">Mesero: ${data.mesero}</p>` : ''}

        <div class="separator"></div>

        <div class="items">
          <div class="item-row" style="font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 3px;">
            <span class="item-name">DESCRIPCIÓN</span>
            <span class="item-qty">CANT</span>
            <span class="item-price">PRECIO</span>
          </div>
          ${data.items
            .map(
              (item) => `
            <div class="item-row">
              <span class="item-name">${item.nombre}</span>
              <span class="item-qty">${item.cantidad}</span>
              <span class="item-price">$${item.subtotal.toFixed(2)}</span>
            </div>
            ${item.notas ? `<div style="font-size: 9px; color: #666; margin-left: 10px;">Nota: ${item.notas}</div>` : ''}
          `
            )
            .join('')}
        </div>

        <div class="separator"></div>

        ${
          data.observaciones && data.observaciones.trim().length > 0
            ? `
          <div class="observations">
            <strong>OBSERVACIONES:</strong><br>
            ${data.observaciones.split('\n').join('<br>')}
          </div>
          <div class="separator"></div>
        `
            : ''
        }

        <div class="totals">
          <div>Subtotal: $${data.subtotal.toFixed(2)}</div>
          ${data.impuesto && data.impuesto > 0 ? `<div>Impuesto: $${data.impuesto.toFixed(2)}</div>` : ''}
        </div>

        <div class="total-amount">
          TOTAL: $${data.total.toFixed(2)}
        </div>

        ${data.metodo_pago ? `<p>Método: ${data.metodo_pago}</p>` : ''}

        <div class="footer">
          <p>¡Gracias por su compra!</p>
          <p>Vuelva pronto</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
