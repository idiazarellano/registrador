;(function(){
const chk=(n,c)=>print((c?'OK  ':'FAIL')+' '+n);
const D=86400000,H=3600000,M=60000; const ds=new Date(); ds.setHours(0,0,0,0); const t0=ds.getTime();
chk('schema 2', data.schema===2);
chk('backupMode off desde autoBackup:false', data.settings.backupMode==='off' && !('autoBackup' in data.settings));
chk('migrate schema1 autoBackup:true -> auto', migrate({schema:1,settings:{autoBackup:true}}).settings.backupMode==='auto');
chk('migrate sin settings -> auto', migrate({schema:1}).settings.backupMode==='auto');
chk('migrate schema2 conserva ask', migrate({schema:2,settings:{backupMode:'ask'}}).settings.backupMode==='ask');
chk('snapshot diario creado', snapshotKeys().length===1 && snapshotKeys()[0]===KEY_SNAP+dayKey(Date.now()));
chk('registros intactos tras migrar', data.entries.length===3 && data.restDays.length===1);
// listado: joint entre a-b (sin hueco), gap entre b-c (20 min)
const html=entriesListHTML(t0,true);
chk('un círculo de inserción', (html.match(/data-insert=/g)||[]).length===1);
chk('un hueco', (html.match(/entry gap/g)||[]).length===1);
chk('insert en el fin de a', html.includes('data-insert="'+(t0+9*H)+'"'));
// editor con duración 0 y previsualización
let ed={id:null,cat:'c2',start:t0+9*H,end:t0+9*H,isNew:true};
chk('preview vacía con duración 0', overlapPreview(ed)==='');
ed.start-=15*M; chk('preview −15 anterior: '+overlapPreview(ed), overlapPreview(ed)==='Trabajo −15 min');
ed.end+=10*M; chk('preview ambos: '+overlapPreview(ed), overlapPreview(ed)==='Trabajo −15 min, Ocio −10 min');
let ed2={id:null,cat:'c2',start:t0+8*H,end:t0+9*H+30*M};
chk('preview eliminación: '+overlapPreview(ed2), overlapPreview(ed2).startsWith('se elimina Trabajo'));
// guardar la inserción de verdad
state.editing=ed; state.sheet='edit';
let target={id:uid(),cat:ed.cat,start:ed.start,end:ed.end}; data.entries.push(target); resolveOverlaps(target); sortEntries(); save();
const names=data.entries.map(e=>catById(e.cat).name[0]+fmtTime(e.start)+'-'+fmtTime(e.end)).join(' ');
chk('tras insertar: '+names, names==='T08:00-08:45 O08:45-09:10 O09:10-10:00 T10:20-11:00');
// wipe / undo
const n=data.entries.length;
chk('wipeEntries', wipeEntries() && data.entries.length===0 && data.restDays.length===0 && !!trash());
chk('trash n', trash().entries.length===n);
undoWipe();
chk('undo recupera', data.entries.length===n && data.restDays.length===1 && trash()===null);
// backupPending con off
chk('pending off', backupPending()===false);
data.settings.backupMode='auto'; data.meta.updated=Date.now();
chk('pending auto', backupPending()===true);
// nuke
storeMap['otra.clave']='x';
nukeEverything();
chk('nuke borra claves registrador.*', Object.keys(storeMap).join(',')==='otra.clave');
// nombre de archivo
chk('backupName '+backupName('.json'), /^registrador-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(backupName('.json')));
})();
;(function(){
const chk=(n,c)=>print((c?'OK  ':'FAIL')+' '+n);
try{ const h=viewAjustes(); chk('viewAjustes off', h.includes('Zona peligrosa')&&h.includes('data-bmode="off"')&&h.includes('data-act="share"')&&!h.includes('data-act="nuke"')); }catch(e){print('FAIL viewAjustes '+e.message)}
wipeEntries();
try{ const h=viewAjustes(); chk('viewAjustes con papelera', h.includes('data-act="nuke"')&&h.includes('data-act="wipe-undo"')); }catch(e){print('FAIL viewAjustes2 '+e.message)}
undoWipe();
for(const sh of ['wipe','nuke']){ state.sheet=sh; try{renderSheet(); chk('sheet '+sh, true);}catch(e){print('FAIL sheet '+sh+' '+e.message)} }
state.sheet='edit'; state.editing={id:null,cat:'c2',start:Date.now()-H,end:Date.now()-H,isNew:true};
try{renderSheet(); chk('sheet edit dur 0', true);}catch(e){print('FAIL sheet edit '+e.message)}
state.sheet=null; try{render(); chk('render hoy',true);}catch(e){print('FAIL render '+e.message)}
})();
;(function(){
let fails=0; const chk=(n,c)=>{if(!c)fails++;print((c?'OK  ':'FAIL')+' '+n);};
const H=3600000,M=60000; const ds=new Date(); ds.setHours(0,0,0,0); const t0=ds.getTime();
const T=h=>t0-86400000+h*H, show=()=>data.entries.map(e=>(e.cat==='c1'?'T':e.cat==='c2'?'O':'X')+fmtTime(e.start)+'-'+(e.end==null?'…':fmtTime(e.end))).join(' ');
const reset=(ents)=>{data.entries=ents.map((e,i)=>Object.assign({id:'e'+i},e));sortEntries();};
const base=()=>reset([{cat:'c1',start:T(8),end:T(9)},{cat:'c2',start:T(9),end:T(10)},{cat:'c1',start:T(10)+20*M,end:T(11)}]);
const insert=(t,ds,de,cat='c2')=>{openInsertEditor(t);state.editing.cat=cat;state.editing.start+=ds*M;state.editing.end+=de*M;const pv=overlapPreview(state.editing);const ok=saveEditing();return {ok,pv};};
const noGap=(a,b)=>{const s=data.entries.filter(e=>e.start>=a&&e.start<b).sort((x,y)=>x.start-y.start);for(let i=1;i<s.length;i++) if(s[i].start!==s[i-1].end) return false; return true;};
let r;
base(); r=insert(T(9),-15,-5); chk('caso del usuario −15/−5: '+show(), show()==='T08:00-08:45 O08:45-08:55 O08:55-10:00 T10:20-11:00'); chk('  preview: '+r.pv, r.pv==='Trabajo −15 min, Ocio +5 min');
base(); r=insert(T(9),-15,0); chk('−15 inicio: '+show(), show()==='T08:00-08:45 O08:45-09:00 O09:00-10:00 T10:20-11:00'); chk('  preview solo recorte: '+r.pv, r.pv==='Trabajo −15 min');
base(); r=insert(T(9),0,10); chk('+10 fin: '+show(), show()==='T08:00-09:00 O09:00-09:10 O09:10-10:00 T10:20-11:00');
base(); r=insert(T(9),5,15,'c1'); chk('+5 inicio +15 fin (hueco a la izquierda): '+show(), show()==='T08:00-09:05 T09:05-09:15 O09:15-10:00 T10:20-11:00'); chk('  preview: '+r.pv, r.pv==='Trabajo +5 min, Ocio −15 min');
base(); r=insert(T(9),-20,-10); chk('−20/−10: '+show(), show()==='T08:00-08:40 O08:40-08:50 O08:50-10:00 T10:20-11:00');
base(); r=insert(T(9),-10,10); chk('a ambos lados: '+show(), show()==='T08:00-08:50 O08:50-09:10 O09:10-10:00 T10:20-11:00'); chk('  sin hueco', noGap(T(8),T(10)+M));
base(); r=insert(T(9),0,0); chk('duración 0 no guarda', r.ok===false && data.entries.length===3);
base(); r=insert(T(9),-5,-10); chk('fin antes que inicio no guarda', r.ok===false && data.entries.length===3);
// el nuevo cubre entero al siguiente: se elimina y no se estira nada raro
base(); r=insert(T(9),0,70,'c1'); chk('cubre a b entero: '+show(), show()==='T08:00-09:00 T09:00-10:10 T10:20-11:00');
// el nuevo se lleva lejos (más allá de b): a no debe estirarse por encima de b
base(); r=insert(T(9),75,85); chk('movido tras b, sin estirar a: '+show(), show()==='T08:00-09:00 O09:00-10:00 O10:15-10:25 T10:20-11:00'.replace('O10:15-10:25 T10:20-11:00','O10:15-10:25 T10:25-11:00'));
// inserción en la unión con hueco real (b–c tiene 20 min): la unión es b|c a las 10:00? no hay círculo; pero probamos inserción a las 10:00 con +10: c no se acerca
base(); r=insert(T(10),0,10); chk('unión b|c con hueco de 20: '+show(), show()==='T08:00-09:00 O09:00-10:00 O10:00-10:10 T10:20-11:00'.replace('T10:20-11:00','T10:10-11:00'));
// siguiente en marcha (end null)
reset([{cat:'c1',start:T(8),end:T(9)},{cat:'c2',start:T(9),end:null}]); r=insert(T(9),-15,-5); chk('siguiente en marcha: '+show(), show()==='T08:00-08:45 O08:45-08:55 O08:55-…');
reset([{cat:'c1',start:T(8),end:T(9)},{cat:'c2',start:T(9),end:null}]); r=insert(T(9),0,10); chk('siguiente en marcha +10: '+show(), show()==='T08:00-09:00 O09:00-09:10 O09:10-…');
// sin anterior / sin siguiente
reset([{cat:'c2',start:T(9),end:T(10)}]); r=insert(T(9),-15,-5); chk('sin anterior: '+show(), show()==='O08:45-08:55 O08:55-10:00');
reset([{cat:'c1',start:T(8),end:T(9)}]); r=insert(T(9),5,15); chk('sin siguiente: '+show(), show()==='T08:00-09:05 O09:05-09:15');
// hueco oculto de 3 min (granularidad 1): se rellena también
reset([{cat:'c1',start:T(8),end:T(9)},{cat:'c2',start:T(9)+3*M,end:T(10)}]); r=insert(T(9),-10,0); chk('hueco oculto de 3 min: '+show(), show()==='T08:00-08:50 O08:50-09:00 O09:00-10:00');
// === ediciones normales: NO cambian (pueden dejar hueco a propósito) ===
base(); state.editing={id:'e1',cat:'c2',start:T(9)+10*M,end:T(10),isNew:false}; saveEditing(); chk('editar b dejando hueco a propósito: '+show(), show()==='T08:00-09:00 O09:10-10:00 T10:20-11:00');
base(); state.editing={id:'e1',cat:'c2',start:T(8)+30*M,end:T(10),isNew:false}; saveEditing(); chk('editar b solapando a: '+show(), show()==='T08:00-08:30 O08:30-10:00 T10:20-11:00');
base(); state.editing={id:null,cat:'c1',start:T(10),end:T(10)+20*M,isNew:true}; saveEditing(); chk('rellenar hueco normal: '+show(), show()==='T08:00-09:00 O09:00-10:00 T10:00-10:20 T10:20-11:00');
base(); state.editing={id:null,cat:'c1',start:T(10),end:T(10)+10*M,isNew:true}; saveEditing(); chk('rellenar hueco a medias deja hueco: '+show(), show()==='T08:00-09:00 O09:00-10:00 T10:00-10:10 T10:20-11:00');
base(); state.editing={id:null,cat:'c1',start:T(12),end:T(13),isNew:true}; saveEditing(); chk('nuevo manual suelto: '+show(), show()==='T08:00-09:00 O09:00-10:00 T10:20-11:00 T12:00-13:00');
base(); state.editing={id:'e0',cat:'c1',start:T(8),end:T(8)+30*M,isNew:false}; saveEditing(); chk('acortar a deja hueco: '+show(), show()==='T08:00-08:30 O09:00-10:00 T10:20-11:00');
// joint no se filtra a un editor normal
base(); openInsertEditor(T(9)); closeSheet(); openEditor(data.entries[1]); chk('editor normal sin joint', !state.editing.joint);
// círculos en el listado
base(); const html=entriesListHTML(t0-86400000,true); chk('un círculo y un hueco', (html.match(/data-insert=/g)||[]).length===1&&(html.match(/entry gap/g)||[]).length===1);
print(fails?('FALLOS: '+fails):'TODO OK');
})();
;(function(){
let fails=0; const chk=(n,c)=>{if(!c)fails++;print((c?'OK  ':'FAIL')+' '+n);};
const H=3600000,M=60000; const ds=new Date(); ds.setHours(0,0,0,0); const t0=ds.getTime()-86400000;
const T=h=>t0+h*H, show=()=>data.entries.map(e=>(e.cat==='c1'?'T':'O')+fmtTime(e.start)+'-'+(e.end==null?'…':fmtTime(e.end))).join(' ');
const reset=(ents)=>{data.entries=ents.map((e,i)=>Object.assign({id:'e'+i},e));sortEntries();};
// edición normal que solapa el inicio de un registro en marcha: ahora se desplaza
const now=Date.now(), rs=roundTo(now)-30*M;
reset([{cat:'c1',start:rs-H,end:rs},{cat:'c2',start:rs,end:null}]);
state.editing={id:null,cat:'c1',start:rs,end:rs+10*M,isNew:true}; saveEditing();
chk('rellenar sobre el inicio del que está en marcha: '+show(), data.entries.length===3&&data.entries[2].end===null&&data.entries[2].start===rs+10*M);
// inserción dentro de un registro largo: cabecera al anterior, cola al siguiente, nada perdido
reset([{cat:'c1',start:T(8),end:T(9)},{cat:'c2',start:T(9),end:T(12)}]);
openInsertEditor(T(9)); state.editing.cat='c1'; state.editing.start+=30*M; state.editing.end+=60*M; saveEditing();
chk('nuevo dentro de b: '+show(), show()==='T08:00-09:30 T09:30-10:00 O10:00-12:00');
// inserción que se lleva lejos hacia atrás: no se estira b sobre a
reset([{cat:'c1',start:T(8),end:T(9)},{cat:'c2',start:T(9),end:T(10)}]);
openInsertEditor(T(9)); state.editing.start-=90*M; state.editing.end-=80*M; saveEditing();
chk('movido antes de a: '+show(), show()==='T07:30-07:40 T08:00-09:00 O09:00-10:00');
// 1 minuto de granularidad
data.settings.granularity=1;
reset([{cat:'c1',start:T(8),end:T(9)},{cat:'c2',start:T(9),end:T(10)}]);
openInsertEditor(T(9)); state.editing.cat='c2'; state.editing.start-=M; saveEditing();
chk('1 min: '+show(), show()==='T08:00-08:59 O08:59-09:00 O09:00-10:00');
data.settings.granularity=5;
print(fails?('FALLOS2: '+fails):'TODO OK 2');
})();
;(function(){
let fails=0; const chk=(n,c)=>{if(!c)fails++;print((c?'OK  ':'FAIL')+' '+n);};
const H=3600000,M=60000; const ds=new Date(); ds.setHours(0,0,0,0); const t0=ds.getTime()-86400000; const T=h=>t0+h*H;
const reset=(ents)=>{data.entries=ents.map((e,i)=>Object.assign({id:'e'+i},e));sortEntries();};
reset([{cat:'c1',start:T(8),end:T(9)},{cat:'c2',start:T(9),end:T(10)},{cat:'c1',start:T(10)+20*M,end:T(11)}]);
chk('sin asignar ayer = 20 min', unassignedOfDay(t0)===20*M);
data.restDays=[dayKey(t0)]; chk('descanso: 0', unassignedOfDay(t0)===0); data.restDays=[];
reset([{cat:'c1',start:T(8),end:T(12)},{cat:'c2',start:T(9),end:T(10)},{cat:'c1',start:T(13),end:T(14)}]);
chk('solape no cuenta, hueco 12-13', unassignedOfDay(t0)===H);
reset([{cat:'c1',start:T(23),end:T(25)},{cat:'c2',start:T(26),end:T(27)}]);
chk('cruce de medianoche: ayer 0', unassignedOfDay(t0)===0);
chk('cruce de medianoche: hoy 1h (01→02)', unassignedOfDay(t0+86400000)===H);
// hoy: desde el último hasta ahora si no hay nada en marcha
const now=Date.now(), td=dayStart(now);
if(now-td>2*H){
  reset([{cat:'c1',start:td,end:now-H}]);
  const u=unassignedOfDay(td); chk('hoy hasta ahora ≈1h', Math.abs(u-H)<2000);
  reset([{cat:'c1',start:td,end:now-H},{cat:'c2',start:now-H+30*M,end:null}]);
  chk('hoy con algo en marcha: 30 min', unassignedOfDay(td)===30*M);
}
reset([{cat:'c1',start:T(8),end:T(9)},{cat:'c2',start:T(9),end:T(10)},{cat:'c1',start:T(10)+20*M,end:T(11)}]);
const h=dayTotalsHTML(t0); chk('línea del día con +12 %: '+h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(), h.includes('+13 %')&&h.includes('2h 40')&&h.includes('Trabajo'));
chk('fila en totales', unassignedRowHTML(20*M,160*M).includes('+13 %'));
chk('sin huecos no hay fila', unassignedRowHTML(0,160*M)==='');
state.selDay=t0; state.range=7; try{const v=viewRegistros(); chk('viewRegistros con sin asignar', v.includes('Sin registrar')&&v.includes('daytot'));}catch(e){chk('viewRegistros '+e.message,false)}
try{viewHoy(); chk('viewHoy ok',true);}catch(e){chk('viewHoy '+e.message,false)}
print(fails?('FALLOS4: '+fails):'TODO OK 4');
})();
