#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const SSH_KEY = 'P:/APPs/Claude/.ssh/id_rsa';
const SERVER = 'root@82.223.120.38';
const NAVBAR_FILE = path.join(__dirname, '../src/components/Navbar.astro');

console.log('🔍 Obteniendo lista de clientes ERP desde server0...');

try {
  // Ejecutar comando SSH para obtener subdominios
  const command = `ssh -i "${SSH_KEY}" ${SERVER} "plesk bin subscription -l | grep -E '\.erpsolwed\.es$' | awk '{print \$1}' | sed 's/\.erpsolwed\.es$//' | sort"`;

  const output = execSync(command, { encoding: 'utf-8' });

  // Procesar salida: convertir a array
  const clients = output
    .trim()
    .split('\n')
    .filter(client => client && client !== 'erpsolwed'); // Filtrar vacíos y dominio principal

  if (clients.length === 0) {
    console.warn('⚠️  No se encontraron subdominios. Manteniendo lista actual.');
    process.exit(0);
  }

  console.log(`✅ Encontrados ${clients.length} clientes ERP:`);
  console.log(clients.slice(0, 10).join(', ') + (clients.length > 10 ? '...' : ''));

  // Leer Navbar.astro
  let navbarContent = fs.readFileSync(NAVBAR_FILE, 'utf-8');

  // Reemplazar la línea const erpClients = [...]
  const clientsArray = JSON.stringify(clients);
  const newLine = `const erpClients = ${clientsArray};`;

  // Buscar y reemplazar la línea que contiene const erpClients
  const regex = /const erpClients\s*=\s*\[[\s\S]*?\];/;

  if (!regex.test(navbarContent)) {
    console.error('❌ No se encontró la variable erpClients en Navbar.astro');
    process.exit(1);
  }

  navbarContent = navbarContent.replace(regex, newLine);

  // Guardar archivo actualizado
  fs.writeFileSync(NAVBAR_FILE, navbarContent, 'utf-8');

  console.log(`✅ Navbar.astro actualizado con ${clients.length} clientes`);

} catch (error) {
  console.error('❌ Error al obtener clientes:', error.message);
  console.warn('⚠️  Continuando con lista actual...');
  // No salir con error para no bloquear el build
  process.exit(0);
}
