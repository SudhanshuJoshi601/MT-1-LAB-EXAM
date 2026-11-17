import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const vehicles = [
  { id: 1, vehicleName: 'Hyundai Creta', vehicleNumber: 'HR26AB1234', type: 'SUV', price: 1500000 },
  { id: 2, vehicleName: 'Maruti Swift', vehicleNumber: 'DL8CAF5030', type: 'Hatchback', price: 750000 },
  { id: 3, vehicleName: 'Honda City', vehicleNumber: 'UP14CD5678', type: 'Sedan', price: 1200000 }
];

const REQUIRED_FIELDS = ['id', 'vehicleName', 'vehicleNumber', 'type', 'price'];

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
};

const sendHTML = (res, statusCode, html) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
};

const serveInfoPage = (res) => {
  const filePath = path.join(__dirname, 'public', 'info.html');
  fs.readFile(filePath, (err, content) => {
    if (err) {
      return sendJSON(res, 500, { error: 'Internal Server Error: unable to read info.html' });
    }
    sendHTML(res, 200, content);
  });
};

const addVehicle = (req, res) => {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    let vehicle;
    try {
      vehicle = JSON.parse(body);
    } catch (error) {
      return sendJSON(res, 400, { error: 'Invalid JSON' });
    }

    if (vehicle === null || typeof vehicle !== 'object' || Array.isArray(vehicle)) {
      return sendJSON(res, 400, { error: 'Request body must be a JSON object' });
    }

    const missing = REQUIRED_FIELDS.filter(
      (field) => vehicle[field] === undefined || vehicle[field] === null || vehicle[field] === ''
    );
    if (missing.length > 0) {
      return sendJSON(res, 400, { error: `Missing required fields: ${missing.join(', ')}` });
    }

    if (vehicles.some((v) => v.id === vehicle.id)) {
      return sendJSON(res, 400, { error: `Vehicle with id ${vehicle.id} already exists` });
    }

    const newVehicle = {
      id: vehicle.id,
      vehicleName: vehicle.vehicleName,
      vehicleNumber: vehicle.vehicleNumber,
      type: vehicle.type,
      price: vehicle.price
    };
    vehicles.push(newVehicle);
    sendJSON(res, 201, { message: 'Vehicle added successfully', vehicle: newVehicle });
  });
};


const server = http.createServer((req, res) => {
  const { method } = req;
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

  if (pathname === '/' && method === 'GET') {
    return sendHTML(
      res,
      200,
      '<h1>Welcome to Vehicle Management System</h1>' +
        '<ul><li><a href="/vehicles">Vehicles</a></li>' +
        '<li><a href="/about">About</a></li>' +
        '<li><a href="/info">Info</a></li></ul>'
    );
  }

  if (pathname === '/vehicles' && method === 'GET') {
    return sendJSON(res, 200, vehicles);
  }

  if (pathname === '/about' && method === 'GET') {
    return sendHTML(
      res,
      200,
      '<h2>About</h2><p>Vehicle Management Application built with the Node.js HTTP module.</p>'
    );
  }

  if (pathname === '/info' && method === 'GET') {
    return serveInfoPage(res);
  }

  if (pathname === '/add-vehicle' && method === 'POST') {
    return addVehicle(req, res);
  }

  sendJSON(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});