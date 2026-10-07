"use strict";
/* Aide de test (lot 10) : joue `n` soirées d'une partie à l'agenda actif, la carte composée de deux en deux dans les
   catégories qui tournent ; `titre` : le premier combat de la carte est un combat de titre si c'est possible.
   S'évalue dans la fenêtre du jeu. */
module.exports=function jouerSoirees(win,n,opts){
  const titre=!!(opts&&opts.titre);
  return win.eval(`(function(){
    const m=G.mgmt; let joues=0;
    for(let k=0;k<${n};k++){
      m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
      /* Les contrats se renouvellent d'eux-mêmes : la partie sert aux tests de lecture, pas à ceux de l'argent (lot 9). */
      for(const f of m.roster){ if(f.libre){ delete f.libre; f.ct={n:6,f:0,b:mgmtBourseSouhaitee(m,f,false),since:m.cycle}; } else if(f.ct&&f.ct.n-f.ct.f<=1) f.ct.n+=5; }
      if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+10,'petite');
      const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))];
      let essais=0;
      while(m.card.main.length<m.card.sizeMain&&essais++<40){
        const div=divs[(k+m.card.main.length+essais)%divs.length];
        const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null));
        const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id));
        if(a&&b) mgmtBookMain(m,a.id,b.id);
      }
      ${titre?`if(m.card.main[0]&&mgmtCanTitle(m,m.card.main[0])) mgmtSetTitle(m,0,true);`:''}
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate');
      if(!mgmtAgendaJouer(m)) break;
      joues++;
      mgmtNewPile(m);
    }
    return joues;
  })()`);
};
