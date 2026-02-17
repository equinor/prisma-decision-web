/* eslint-disable no-console */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
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

// Define routes with strict CSP
router.get('*', (req, res) => {
	const nonce = randomBytes(16).toString('base64');

	const csp = [
		'default-src \'self\'',
		`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
		'style-src \'self\' \'unsafe-inline\' https://cdn.eds.equinor.com',
		'font-src \'self\' https://cdn.eds.equinor.com',
		'img-src \'self\' data: https:',
		'connect-src \'self\' https://api-prisma-decision-api-prod.radix.equinor.com https://api-prisma-decision-api-test.radix.equinor.com https://api-prisma-decision-api-dev.radix.equinor.com https://login.microsoftonline.com',
		'base-uri \'self\'',
		'form-action \'self\'',
	].join('; ');

	res.setHeader('Content-Security-Policy', csp);

	const htmlPath = path + 'dist/index.html';
	let html = fs.readFileSync(htmlPath, 'utf8');
	html = html.replace(/<script/g, `<script nonce="${nonce}"`);

	res.send(html);
});

app.use(
	express.static(path + 'dist/', {
		index: false,
	})
);
app.use('/', router);

app.listen(port, () => {
	console.log('Dot is running on port 3000');
});
