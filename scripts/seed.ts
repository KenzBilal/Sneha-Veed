import '../src/lib/db'; // Initialize schema
import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.resolve(process.cwd(), 'sneha_veed.db');
const db = new Database(dbPath);

const profiles = [
  {
    id: crypto.randomUUID(),
    name: 'Kenz',
    call_name: 'The Boss',
    description: 'Always talking, rarely coding.'
  },
  {
    id: crypto.randomUUID(),
    name: 'Sarah',
    call_name: 'Drama Queen',
    description: 'Sighs loudly when minor inconveniences happen.'
  },
  {
    id: crypto.randomUUID(),
    name: 'Mike',
    call_name: 'Sleeper',
    description: 'Can and will fall asleep anywhere.'
  },
  {
    id: crypto.randomUUID(),
    name: 'Sneha',
    call_name: 'The Origin',
    description: 'The one who started this mess.'
  }
];

const insert = db.prepare('INSERT INTO profiles (id, name, call_name, description) VALUES (@id, @name, @call_name, @description)');

for (const p of profiles) {
  try {
    insert.run(p);
    console.log(`Inserted ${p.name}`);
  } catch (e) {
    console.error(`Failed to insert ${p.name}`, e);
  }
}

console.log('Done!');
