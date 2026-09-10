// Entorno mínimo (DOM y localStorage falsos) para ejecutar la lógica de index.html en gjs.
var storeMap={};
var localStorage={getItem:k=>(k in storeMap?storeMap[k]:null),setItem:(k,v)=>{storeMap[k]=String(v)},removeItem:k=>{delete storeMap[k]},key:i=>Object.keys(storeMap)[i],get length(){return Object.keys(storeMap).length}};
var sessionStorage={clear(){}};
var el=()=>({innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},focus(){},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},appendChild(){},remove(){},click(){},dataset:{}});
var document={addEventListener(){},querySelector:()=>el(),querySelectorAll:()=>[],getElementById:()=>el(),createElement:()=>el(),body:el(),documentElement:el(),hidden:false};
var history={pushState(){},back(){}};
var window={addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),scrollTo(){}};
var navigator={storage:{persist:()=>Promise.resolve(true)}};
var location={protocol:'file:',reload(){print('RELOAD')}};
var setInterval=()=>0, setTimeout=(f)=>0, requestAnimationFrame=()=>0;
var URL={createObjectURL:()=>'blob:',revokeObjectURL(){}}; var Blob=function(){};
var toasts=[];
const D=86400000,H=3600000,M=60000; const ds=new Date(); ds.setHours(0,0,0,0); const t0=ds.getTime();
storeMap['registrador.v1']=JSON.stringify({schema:1,categories:[{id:'c1',name:'Trabajo',color:'#2a78d6'},{id:'c2',name:'Ocio',color:'#e34948'}],
 entries:[{id:'a',cat:'c1',start:t0+8*H,end:t0+9*H},{id:'b',cat:'c2',start:t0+9*H,end:t0+10*H},{id:'c',cat:'c1',start:t0+10*H+20*M,end:t0+11*H}],
 restDays:['2026-01-01'],settings:{autoBackup:false,theme:'light',granularity:5},meta:{created:1,updated:2,lastBackup:0,lastBackupUpdated:0}});
