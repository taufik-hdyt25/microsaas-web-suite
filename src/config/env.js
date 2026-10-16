import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '../..');
export const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
export const OUTPUTS_DIR = path.join(ROOT_DIR, 'outputs');
export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

export const PORT = process.env.PORT || 8080;
export const NODE_ENV = process.env.NODE_ENV || 'production';
