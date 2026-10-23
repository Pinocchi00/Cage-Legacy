"use strict";

const { newGameWindow } = require('../tests/helpers/loadGame');

const args = process.argv.slice(2);
const sansTraits = args.includes('--sans-traits');
const soirees = Number(args.find(x => /^\d+$/.test(x)) || 62);
if(!Number.isInteger(soirees) || soirees < 1) throw new Error('Le nombre de soirées doit être un entier positif.');

const win = newGameWindow({ runMain: true });
if(sansTraits) win.eval('mgmtTraitsAppliquer=function(_m,_f,_cycle,c){return c;};');
const ms = win.eval(`(()=>{setSeed(20261008);const t=Date.now();mgmtPasseGenerer('split',{soirees:${soirees}});return Date.now()-t;})()`);
console.log(`${sansTraits ? 'sans-traits' : 'avec-traits'} ${soirees} soirees: ${ms} ms`);
win.close();
