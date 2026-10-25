"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('Monde lot 77 T1 — les noms longs de soirée et de discours restent adaptables',()=>{
  const cadre=fs.readFileSync('mgmt-soiree-cadre.js','utf8');
  const discours=fs.readFileSync('mgmt-ecran-discours.js','utf8');
  const css=fs.readFileSync('ui-cadre.css','utf8');
  assert.match(cadre,/n<=14\?72:n<=22\?56:44/);
  assert.match(cadre,/side\.first\|\|''/);
  assert.match(discours,/surnom\.length<=9\?230:surnom\.length<=14\?170:surnom\.length<=20\?120:84/);
  assert.match(discours,/overflow-wrap:anywhere;white-space:normal/);
  assert.match(css,/grid-template-columns:42px 190px minmax\(0,1fr\) auto/);
  assert.match(css,/\.so3-carte-combat\{display:grid;grid-template-columns:54px 190px minmax\(0,1fr\) auto/);
  assert.match(css,/\.so3-carte-combat \.mf-so-nb\{width:44px\}/);
  assert.match(css,/\.so3-carte-noms\{[^}]*white-space:normal/);
  assert.match(css,/\.so3-carte-noms b span\{display:block;white-space:normal;overflow-wrap:anywhere\}/);
  assert.match(css,/\.mf-so-entete \.mf-so-chip:not\(\.org\) span\{[^}]*white-space:nowrap/);
});
