// Imprime un HTML de assets/pdf a PDF con Chrome (sin servidor: abre el archivo directo).
// Uso:  node herramientas/documentos/imprimir_pdf.mjs assets/pdf/reglamento-admision.html assets/pdf/reglamento-admision.pdf
// Variable opcional CHROME con la ruta del navegador. Requiere Node 22 o superior.
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
const [,, entrada, salida] = process.argv;
if (!entrada || !salida) { console.error('Uso: node imprimir_pdf.mjs <entrada.html> <salida.pdf>'); process.exit(1); }
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const puerto = 9300 + Math.floor(Math.random() * 500);
const perfil = fs.mkdtempSync(os.tmpdir() + '/cpp-pdf-');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${puerto}`, '--window-size=1000,1400', `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
const espera = ms => new Promise(r => setTimeout(r, ms));
let lista;
for (let i = 0; i < 60; i++) { try { lista = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json(); if (lista.length) break; } catch {} await espera(250); }
const ws = new WebSocket(lista.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = {};
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) pend[m.id](m); };
const enviar = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async ex => (await enviar('Runtime.evaluate', { expression: ex, awaitPromise: true, returnByValue: true })).result.result.value;
await enviar('Page.enable'); await enviar('Runtime.enable');
await enviar('Page.navigate', { url: pathToFileURL(resolve(entrada)).href });
await espera(1500);
await ev('document.fonts.ready.then(()=>1)'); await espera(800);
if (await ev("!!document.querySelector('script[src*=\"paginar\"]')")) {      // documentos largos: esperar a que se armen las hojas
  for (let i = 0; i < 80; i++) { if (await ev('window.__listo===true')) break; await espera(500); }
  console.log('hojas armadas:', await ev('window.__hojas')); await espera(500);
}
const pdf = await enviar('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 });
fs.writeFileSync(salida, Buffer.from(pdf.result.data, 'base64'));
console.log('PDF:', salida, fs.statSync(salida).size, 'bytes');
ws.close(); chrome.kill(); await espera(700);
try { fs.rmSync(perfil, { recursive: true, force: true, maxRetries: 3 }); } catch {}   // la carpeta temporal puede tardar en liberarse
