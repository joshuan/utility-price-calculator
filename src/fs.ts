import path from 'path';
import fs from 'fs';

export function saveFile(filepath: string, data: string): void {
    fs.writeFileSync(path.join(process.cwd(), filepath), data);
}
    