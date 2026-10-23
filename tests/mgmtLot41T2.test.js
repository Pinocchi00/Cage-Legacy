"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
test('P6 T2 — l’écran de semaine est enregistré et la frise compte six jours',()=>{const w=newGameWindow();try{const r=w.eval(`(()=>{const m={semaine:{n:1,ev:[{f:'poids',j:'vendredi',a:'x',b:'y',v:0,p:true}]},card:{main:[],prelims:[]}};G={mgmt:m};return {screen:typeof SCREENS.mgmt_semaine,days:(scr_mgmt_semaine().match(/class="se-jour/g)||[]).length};})()`);assert.equal(r.screen,'function');assert.equal(r.days,6);}finally{w.close();}});
test('P6 T2 — les transitions clavier de jour bouclent sur les six jours',()=>{const w=newGameWindow();try{const r=w.eval(`(()=>{MGMT_SE_JOUR=0;CL.mgmtSemaineDeplacer(-1);const a=MGMT_SE_JOUR;CL.mgmtSemaineDeplacer(1);return [a,MGMT_SE_JOUR];})()`);assert.deepEqual(Array.from(r),[5,0]);}finally{w.close();}});
test('P6 T2 — le texte injecté du combattant est échappé',()=>{const w=newGameWindow();try{const html=w.eval(`(()=>{const m={ville:'Lyon',salle:'Salle',semaine:{n:1,ev:[{f:'poids',j:'vendredi',a:'x',b:'y',v:0,p:true}]},card:{main:[],prelims:[]}};G={mgmt:m};return scr_mgmt_semaine();})()`);assert.ok(!html.includes('<img'));}finally{w.close();}});
