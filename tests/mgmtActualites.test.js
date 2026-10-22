"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function neuve(){const w=newGameWindow({runMain:true});w.eval('setSeed(20261008); CL.mgmtEnter(1)');return w;}
test('Aucun suivi ni événement ne produit de nouvelle',()=>{const w=neuve();assert.deepEqual(Array.from(w.eval('mgmtActualites(G.mgmt)')),[]);});
test('Résultats suivis — une nouvelle par combat, au bon point de vue',()=>{const w=neuve();const ok=w.eval(`(()=>{const m=G.mgmt;m.suivis=[m.roster[0].id];m.hist=[{c:m.cycle,a:{id:m.suivis[0],name:'Suivi'},b:{id:'adv',name:'Adversaire'},winner:'A',family:'ko',round:1,slot:'main'}];const a=mgmtActualites(m);return a.length===1&&a[0].titre.includes('Adversaire')&&!a[0].titre.includes('{')})()`);assert.equal(ok,true);});
test('Blessure et contrat — faits relus',()=>{const w=neuve();assert.equal(w.eval(`(()=>{const m=G.mgmt,id=m.roster[0].id;m.suivis=[id];m.facts.push({c:m.cycle,k:'injury',a:id,nom:'Entorse'});m.facts.push({c:m.cycle,k:'fin_contrat',a:id});return mgmtActualites(m).length})()`),2);});
test('Variantes — résultat reproductible',()=>{const w=neuve();assert.equal(w.eval(`mgmtActuVariante('cle','resultat','ko',MGMT_ACTU_RESULTATS.win.ko)`),w.eval(`mgmtActuVariante('cle','resultat','ko',MGMT_ACTU_RESULTATS.win.ko)`));});
test('Lu/non lu — lecture et réparation de la clé',()=>{const w=neuve();assert.equal(w.eval(`(()=>{const m=G.mgmt;m.actuLu=['x'];return mgmtRepair(m).actuLu.length})()`),1);});
test('Registre — refuse les doublons',()=>{const w=neuve();assert.equal(w.eval(`mgmtActuSourceAjouter({type:'test',lire(){return []}})&&!mgmtActuSourceAjouter({type:'test',lire(){return []}})`),true);});
test('Monde vivant — source organisationnelle tolérée',()=>{const w=neuve();assert.deepEqual(Array.from(w.eval('mgmtActualites({suivis:[],facts:[],hist:[]})')),[]);});
