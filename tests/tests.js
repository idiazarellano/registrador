;(function(){
const chk=(n,c)=>print((c?'OK  ':'FAIL')+' '+n);
const D=86400000,H=3600000,M=60000; const ds=new Date(); ds.setHours(0,0,0,0); const t0=ds.getTime();
chk('schema 4', data.schema===4);
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
// hoy cuenta además desde el último registro hasta ahora (si no hay nada en marcha)
chk('cruce de medianoche: hoy 1h (01→02) más la cola hasta ahora', unassignedOfDay(t0+86400000)===H+Math.max(0,Date.now()-T(27)));
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
state.selDay=t0; state.range=7;
try{const v=viewRegistros(); chk('viewRegistros pinta el día elegido', v.includes('daytot')&&v.includes('Elige un día'));}catch(e){chk('viewRegistros '+e.message,false)}
try{const v=viewStats(); chk('viewStats con sin asignar', v.includes('Sin registrar'));}catch(e){chk('viewStats '+e.message,false)}
try{const v=viewTareas(); chk('viewTareas vacía', v.includes('Sin tareas'));}catch(e){chk('viewTareas '+e.message,false)}
try{const v=viewHoy(); chk('viewHoy con marcas vacías', v.includes('Marcas'));}catch(e){chk('viewHoy '+e.message,false)}
// marcas: alternar y contar
data.marks=[{id:'m1',name:'Leer',color:'#333',icon:'',archived:false}]; data.markDays={};
toggleMark('m1',t0); chk('marca puesta', isMarked('m1',t0));
toggleMark('m1',t0); chk('marca quitada', !isMarked('m1',t0)&&!Object.keys(data.markDays).length);
// tareas: crear, hacer, agrupar
data.tasks=[{id:'t1',cat:'c1',text:'Fontanero',done:false,created:1},{id:'t2',cat:'c1',text:'Ya',done:true,created:2}];
chk('tareas agrupadas por categoría', taskGroups().length===1&&taskGroups()[0].list.length===2);
chk('pendientes primero', taskGroups()[0].list[0].id==='t1');
data.marks=[];data.markDays={};data.tasks=[];
try{viewHoy(); chk('viewHoy ok',true);}catch(e){chk('viewHoy '+e.message,false)}
print(fails?('FALLOS4: '+fails):'TODO OK 4');
})();
;(function(){
let fails=0; const chk=(n,c)=>{if(!c)fails++;print((c?'OK  ':'FAIL')+' '+n);};
// las hojas nuevas se pintan sin reventar
state.taskEdit={id:null,text:'',cat:'c1'}; state.sheet='task';
try{renderSheet(); chk('hoja tarea',true);}catch(e){chk('hoja tarea '+e.message,false)}
state.catEdit={kind:'mark',id:null,name:'',color:'#333',icon:''}; state.sheet='cat';
try{renderSheet(); chk('hoja marca',true);}catch(e){chk('hoja marca '+e.message,false)}
state.sheet=null; renderSheet();
for(const v of ['hoy','tareas','registros','stats','ajustes']){ state.view=v; try{render(); chk('render '+v,true);}catch(e){chk('render '+v+' '+e.message,false)} }
state.view='hoy';
print('FALLOS5: '+fails);
})();
;(function(){
let fails=0; const chk=(n,c)=>{if(!c)fails++;print((c?'OK  ':'FAIL')+' '+n);};
const H=3600000,M=60000,D=86400000; const t0=dayStart(Date.now())-D;
data.entries=[{id:'a',cat:'c1',start:t0+9*H,end:t0+11*H+30*M},{id:'b',cat:'c2',start:t0+14*H,end:t0+15*H}];
data.restDays=[];
// reparto por hora
const hm=hourMatrix([t0]);
chk('hora 9 entera en c1', hm[9].m.get('c1')===H && hm[9].t===H);
chk('hora 11 media hora', hm[11].m.get('c1')===30*M);
chk('hora 12 vacía', hm[12].t===0);
chk('hora 14 en c2', hm[14].m.get('c2')===H);
// la semana empieza en lunes
const lun=weekStart(t0); chk('weekStart cae en lunes', new Date(lun).getDay()===1);
chk('weekStart idempotente', weekStart(lun)===lun);
// las cuatro vistas se pintan
state.view='stats';
for(const a of ['resumen','diatipo','semana','progresion']){
  state.analysis=a; try{const v=viewStats(); chk('viewStats '+a, v.length>200);}catch(e){chk('viewStats '+a+' '+e.message,false)}
}
state.analysis='resumen'; state.view='hoy'; data.entries=[];
print('FALLOS6: '+fails);
})();
;(function(){
let fails=0; const chk=(n,c)=>{if(!c)fails++;print((c?'OK  ':'FAIL')+' '+n);};
const H=3600000,M=60000,D=86400000;
// huecos: entre registros, nunca antes del primero ni después del último (salvo hoy)
const t0=dayStart(Date.now())-D;
data.entries=[{id:'a',cat:'c1',start:t0+9*H,end:t0+10*H},{id:'b',cat:'c2',start:t0+11*H,end:t0+12*H}];
data.restDays=[];
let g=gapsOfDay(t0);
chk('un hueco de 1 h', g.length===1 && g[0].b-g[0].a===H);
chk('el hueco viene detrás de c1', g[0].after==='c1');
chk('coincide con unassignedOfDay', g.reduce((a,x)=>a+(x.b-x.a),0)===unassignedOfDay(t0));
data.restDays=[dayKey(t0)]; chk('día de descanso sin huecos', gapsOfDay(t0).length===0); data.restDays=[];
// días agrupables: vectores por proporción
data.entries=[];
for(let i=1;i<=20;i++){const d=dayStart(dayStart(Date.now())-i*D+12*H);
  data.entries.push({id:'x'+i,cat:i%2?'c1':'c2',start:d+9*H,end:d+13*H},{id:'y'+i,cat:i%2?'c2':'c1',start:d+14*H,end:d+15*H});}
const days=[];for(let i=1;i<=20;i++)days.push(dayStart(dayStart(Date.now())-i*D+12*H));
const dv=dayVectors(days);
chk('20 días con vector', dv.rows.length===20);
chk('vectores suman 1', dv.rows.every(r=>Math.abs(r.v.reduce((a,x)=>a+x,0)-1)<1e-9));
const km=bestClustering(dv.rows.map(r=>r.v));
chk('dos grupos claros: k='+km.k+' silueta '+km.score.toFixed(2), km.k===2 && km.score>0.8);
const km2=bestClustering(dv.rows.map(r=>r.v));
chk('mismo resultado en dos pasadas', km2.lab.join('')===km.lab.join(''));
const pc=pca2(dv.rows.map(r=>r.v));
chk('pca devuelve una coordenada por día', pc.x.length===20 && pc.y.length===20);
state.view='stats';
for(const a of ['tipos','huecos']){ state.analysis=a; try{const v=viewStats(); chk('viewStats '+a, v.length>200);}catch(e){chk('viewStats '+a+' '+e.message,false)} }
state.analysis='resumen'; state.view='hoy'; data.entries=[];
// Balanzas: contar, deshacer, migrar y no mezclarse con las marcas
chk('migrate v3 crea balanzas vacías', (()=>{const d=migrate({schema:3});return Array.isArray(d.balances)&&Array.isArray(d.balanceLog)&&d.schema===4;})());
chk('migrate rellena los dos lados', (()=>{const d=migrate({schema:4,balances:[{id:'b1',name:'X',color:'#000'}]});return d.balances[0].a.label==='A'&&d.balances[0].b.label==='B'&&d.balances[0].archived===false;})());
data.balances=[{id:'b1',name:'Comentarios',color:'#2a78d6',icon:'',archived:false,a:{label:'Me lo callé'},b:{label:'Lo dije'}}];
data.balanceLog=[];
const ayer=dayStart(t0-D+12*H);
addBalance('b1','a',t0); addBalance('b1','a',t0); addBalance('b1','b',t0); addBalance('b1','b',ayer);
chk('cuenta por lado y día', balOfDay('b1',t0,'a')===2 && balOfDay('b1',t0,'b')===1 && balOfDay('b1',t0)===3 && balOfDay('b1',ayer)===1);
chk('el toque de un día pasado cae a mediodía', data.balanceLog.filter(x=>x.t<t0)[0].t===ayer+12*H);
chk('suma de varios días', balOfDays('b1',[t0,ayer])===4 && balOfDays('b1',[t0,ayer],'a')===2);
chk('deshacer quita el último de ese día', undoBalance('b1',t0)&&balOfDay('b1',t0)===2&&balOfDay('b1',ayer)===1);
chk('deshacer en día sin ocasiones no hace nada', undoBalance('b1',dayStart(t0-5*D+12*H))===false && data.balanceLog.length===3);
chk('la fila del día se pinta', balancesHTML(t0).indexOf('Me lo callé')>0);
chk('estadística con reparto', statsBalancesHTML([t0,ayer],[]).indexOf('ocasiones')>0);
chk('sin balanzas activas no se pinta nada', (()=>{data.balances[0].archived=true;const r=balancesHTML(t0)===''&&statsBalancesHTML([t0],[])==='';data.balances[0].archived=false;return r;})());
chk('borrar registros se lleva las ocasiones pero no las balanzas', (()=>{wipeEntries();return data.balanceLog.length===0&&data.balances.length===1;})());
data.balances=[]; data.balanceLog=[];
// El inicio de lo que corre arrastra el fin de la anterior si iban pegadas: al restar
// y volver a sumar no debe quedar un hueco artificial entre las dos.
(function(){
  const ini=t0+9*H, med=t0+10*H;
  data.entries=[{id:'p',cat:'c1',start:ini,end:med},{id:'r',cat:'c2',start:med,end:null}];
  setRunningStart(med-15*MIN);
  chk('restar arrastra el fin de la anterior', data.entries[0].end===med-15*MIN);
  setRunningStart(med);
  chk('sumar lo devuelve, sin hueco', data.entries[0].end===med && data.entries[1].start===med);
  // con un hueco real de por medio, sumar no se lo come
  data.entries=[{id:'p',cat:'c1',start:ini,end:med-30*MIN},{id:'r',cat:'c2',start:med,end:null}];
  setRunningStart(med+5*MIN);
  chk('un hueco real se respeta', data.entries[0].end===med-30*MIN);
  // detener a una hora concreta
  data.entries=[{id:'r',cat:'c2',start:ini,end:null}];
  stopRunningAt(ini+40*MIN);
  chk('detener a una hora concreta', data.entries[0].end===ini+40*MIN);
  data.entries=[{id:'r',cat:'c2',start:ini,end:null}];
  stopRunningAt(ini-5*MIN);
  chk('no se puede terminar antes de empezar', data.entries[0].end===null);
  data.entries=[];
})();
print('FALLOS7: '+fails);
})();
