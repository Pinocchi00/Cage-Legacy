"use strict";
/* Le pont entre la page et les fichiers : window.cageStockagePC, synchrone, lu par stockage.js du jeu. */
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('cageStockagePC', {
  lire: cle => ipcRenderer.sendSync('stockage:lire', cle),
  ecrire: (cle, valeur) => { if (!ipcRenderer.sendSync('stockage:ecrire', cle, valeur)) throw new Error('écriture refusée'); },
  supprimer: cle => ipcRenderer.sendSync('stockage:supprimer', cle),
  quitter: () => ipcRenderer.send('quitter'),
  fenetre: reglage => ipcRenderer.send('fenetre', reglage),
});
