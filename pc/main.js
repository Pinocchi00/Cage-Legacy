"use strict";
/* Cage Legacy — version PC (Electron). Brief démo du 09/10/2026, lot 3.
   Ouvre index.html en plein écran, sans barre de menus ni outils de développement. Chaque partie est un fichier du dossier de données du joueur
   (celui que Steam Cloud synchronise par Auto-Cloud) : écriture temporaire puis renommage, la copie de secours reste la dernière version valide.
   Fermer la fenêtre, par le bouton ou par Alt+F4, sauvegarde avant de fermer. Le service worker n'est pas enregistré (voir main.js du jeu). */
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

const JEU = fs.existsSync(path.join(__dirname, 'jeu', 'index.html')) ? path.join(__dirname, 'jeu', 'index.html') : path.join(__dirname, '..', 'index.html');
const DOSSIER = () => path.join(app.getPath('userData'), 'parties');
const fichier = cle => path.join(DOSSIER(), encodeURIComponent(cle) + '.json');

function lire(cle) {
  try { return fs.readFileSync(fichier(cle), 'utf8'); } catch (e) { return null; }
}
function ecrire(cle, valeur) {
  fs.mkdirSync(DOSSIER(), { recursive: true });
  const cible = fichier(cle), tmp = cible + '.tmp';
  fs.writeFileSync(tmp, String(valeur), 'utf8');
  fs.renameSync(tmp, cible);
}
function supprimer(cle) {
  try { fs.unlinkSync(fichier(cle)); } catch (e) { /* déjà absent */ }
}

let fenetre = null, fermeture = false;

function creer() {
  Menu.setApplicationMenu(null);
  fenetre = new BrowserWindow({
    width: 1920, height: 1080, fullscreen: true, autoHideMenuBar: true, backgroundColor: '#1B1517',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, devTools: false },
  });
  fenetre.loadFile(JEU);
  /* La fermeture sauvegarde d'abord : la page écrit sa partie, puis la fenêtre se ferme. */
  fenetre.on('close', e => {
    if (fermeture) return;
    e.preventDefault(); fermeture = true;
    fenetre.webContents.executeJavaScript('typeof saveMgmt==="function"&&saveMgmt()').catch(() => {}).finally(() => { fenetre.destroy(); });
  });
  fenetre.on('closed', () => { fenetre = null; });
}

ipcMain.on('stockage:lire', (e, cle) => { e.returnValue = lire(cle); });
ipcMain.on('stockage:ecrire', (e, cle, valeur) => { try { ecrire(cle, valeur); e.returnValue = true; } catch (err) { e.returnValue = false; } });
ipcMain.on('stockage:supprimer', (e, cle) => { supprimer(cle); e.returnValue = true; });
ipcMain.on('quitter', () => { if (fenetre) fenetre.close(); else app.quit(); });
ipcMain.on('fenetre', (e, { plein, taille }) => {
  if (!fenetre) return;
  fenetre.setFullScreen(!!plein);
  if (!plein && Number.isFinite(taille)) fenetre.setContentSize(taille, Math.round(taille * 9 / 16));
});

app.whenReady().then(creer);
app.on('window-all-closed', () => { app.quit(); });
