/* eslint-disable no-console */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const path = __dirname + '/';
const port = 3000;

// Trust the first proxy (Radix/ingress) for accurate client IP detection
app.set('trust proxy', 1);

const limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 100,
});

app.use(limiter);

// Define routes
router.get('*', (req, res) => {
	res.sendFile(path + 'dist/index.html');
});

app.use(express.static(path + 'dist/'));
app.use('/', router);

app.listen(port, () => {
	console.log('Dot is running on port 3000');
});
