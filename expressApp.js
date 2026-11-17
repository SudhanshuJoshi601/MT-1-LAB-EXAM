import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

let vehicles = [
  { id: 1, vehicleName: 'Hyundai Creta', vehicleNumber: 'HR26AB1234', type: 'SUV', price: 1500000 },
  { id: 2, vehicleName: 'Maruti Swift', vehicleNumber: 'DL8CAF5030', type: 'Hatchback', price: 750000 },
  { id: 3, vehicleName: 'Honda City', vehicleNumber: 'UP14CD5678', type: 'Sedan', price: 1200000 }
];

const isPositiveNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;
const isBlank = (value) => value === undefined || value === null || value === '';

app.get('/vehicles', (req, res) => {
  res.status(200).json(vehicles);
});

app.get('/vehicles/:id', (req, res) => {
  const vehicle = vehicles.find((v) => v.id === Number(req.params.id));
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  res.status(200).json(vehicle);
});

app.post('/vehicles', (req, res) => {
  const { id, vehicleName, vehicleNumber, type, price } = req.body || {};

  const missing = Object.entries({ id, vehicleName, vehicleNumber, type, price })
    .filter(([, value]) => isBlank(value))
    .map(([key]) => key);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }
  if (!isPositiveNumber(price)) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }
  if (vehicles.some((v) => v.id === id)) {
    return res.status(400).json({ error: `Vehicle with id ${id} already exists` });
  }

  const vehicle = { id, vehicleName, vehicleNumber, type, price };
  vehicles.push(vehicle);
  res.status(201).json({ message: 'Vehicle added successfully', vehicle });
});

app.put('/vehicles/:id', (req, res) => {
  const vehicle = vehicles.find((v) => v.id === Number(req.params.id));
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const { vehicleName, vehicleNumber, type, price } = req.body || {};
  if ([vehicleName, vehicleNumber, type, price].every(isBlank)) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }
  if (price !== undefined && !isPositiveNumber(price)) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }
  if ([vehicleName, vehicleNumber, type].some((value) => value === '' || value === null)) {
    return res.status(400).json({ error: 'Fields cannot be empty' });
  }

  if (vehicleName !== undefined) vehicle.vehicleName = vehicleName;
  if (vehicleNumber !== undefined) vehicle.vehicleNumber = vehicleNumber;
  if (type !== undefined) vehicle.type = type;
  if (price !== undefined) vehicle.price = price;

  res.status(200).json({ message: 'Vehicle updated successfully', vehicle });
});

app.delete('/vehicles/:id', (req, res) => {
  const index = vehicles.findIndex((v) => v.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  const [deleted] = vehicles.splice(index, 1);
  res.status(200).json({ message: 'Vehicle deleted successfully', vehicle: deleted });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
