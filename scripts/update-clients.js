#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const SSH_KEY = 'P:/APPs/Claude/.ssh/id_rsa';
const SERVER = 'root@82.223.120.38';
const NAVBAR_FILE = path.join(__dirname, '../src/components/Navbar.astro');
const PUBLIC_JSON = path.join(__dirname, '../public/clients.json');

// Función para obtener logo de un cliente
async function fetchClientLogo(clientId) {
  try {
    const url = `https://${clientId}.erpsolwed.es`;
    console.log(`  🔍 Buscando logo en ${url}...`);

    const response = await fetch(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      console.log(`  ⚠️  ${clientId}: HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Buscar imagen con clase card-img-top
    const logoImg = $('.card-img-top').first();

    if (logoImg.length > 0) {
      let logoUrl = logoImg.attr('src');

      // Si es una URL relativa, convertirla a absoluta
      if (logoUrl && !logoUrl.startsWith('http')) {
        logoUrl = new URL(logoUrl, url).href;
      }

      if (logoUrl) {
        console.log(`  ✅ ${clientId}: ${logoUrl}`);
        return logoUrl;
      }
    }

    console.log(`  ⚠️  ${clientId}: No se encontró .card-img-top`);
    return null;

  } catch (error) {
    console.log(`  ❌ ${clientId}: ${error.message}`);
    return null;
  }
}

console.log('🔍 Obteniendo lista de clientes ERP desde server0...');

try {
  // Ejecutar comando SSH para obtener subdominios
  const command = `ssh -i "${SSH_KEY}" ${SERVER} "plesk bin domain -l | grep -E '\.erpsolwed\.es$' | awk '{print \$1}' | sed 's/\.erpsolwed\.es$//' | sort"`;

  const output = execSync(command, { encoding: 'utf-8' });

  // Procesar salida: convertir a array
  const clientIds = output
    .trim()
    .split('\n')
    .filter(client => client && client !== 'erpsolwed'); // Filtrar vacíos y dominio principal

  if (clientIds.length === 0) {
    console.warn('⚠️  No se encontraron subdominios. Manteniendo lista actual.');
    process.exit(0);
  }

  console.log(`✅ Encontrados ${clientIds.length} clientes ERP`);
  console.log(`\n📷 Obteniendo logos de clientes...`);

  // Obtener logos de forma secuencial para no saturar
  const clientsWithLogos = [];
  for (const clientId of clientIds) {
    const logo = await fetchClientLogo(clientId);
    clientsWithLogos.push({ id: clientId, logo });
  }

  console.log(`\n✅ Procesados ${clientsWithLogos.length} clientes`);
  const withLogos = clientsWithLogos.filter(c => c.logo).length;
  console.log(`   ${withLogos} con logo, ${clientsWithLogos.length - withLogos} sin logo`);

  // Guardar JSON público
  fs.writeFileSync(PUBLIC_JSON, JSON.stringify(clientsWithLogos, null, 2), 'utf-8');
  console.log(`✅ JSON público guardado en ${PUBLIC_JSON}`);

  // Leer Navbar.astro
  let navbarContent = fs.readFileSync(NAVBAR_FILE, 'utf-8');

  // Reemplazar la línea const erpClients = [...]
  const clientsArray = JSON.stringify(clientsWithLogos);
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

  console.log(`✅ Navbar.astro actualizado con ${clientsWithLogos.length} clientes`);

} catch (error) {
  console.error('❌ Error al obtener clientes:', error.message);
  console.warn('⚠️  Continuando con lista actual...');
  // No salir con error para no bloquear el build
  process.exit(0);
}
