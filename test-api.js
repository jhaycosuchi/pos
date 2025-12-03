const http = require('http');

const payload = {
  mesero_id: 2,
  mesa_numero: 1,
  comensales: 5,
  es_para_llevar: false,
  items: [
    {
      menu_item_id: 50,
      cantidad: 2,
      precio_unitario: 8.50,
      especificaciones: 'Sin picante',
      notas: 'Extra nori'
    },
    {
      menu_item_id: 51,
      cantidad: 1,
      precio_unitario: 12.00,
      especificaciones: 'Cocido bien',
      notas: ''
    }
  ],
  total: 29.00
};

const postData = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/pedidos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response (raw):', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.write(postData);
req.end();
