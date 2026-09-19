/* Regresiones de combate, desbloqueos y rutas. Sin dependencias ni navegador. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const between=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));
new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
const E=new Function(between('/*ENGINE-START','/*ENGINE-END*/')+';return{ROSTER,U,SIG,newMatch,resolve,useItem,avail,setPos,upkeep};')();
for(const id of ['vagabundo','johnny','black_johnny','chanops'])assert.ok(E.ROSTER[id]);
assert.ok(E.ROSTER.black_johnny.hp>E.ROSTER.johnny.hp);assert.ok(E.ROSTER.chanops.hp<E.ROSTER.spaz.hp);
let restricted=E.newMatch(E.ROSTER.black_johnny,E.ROSTER.johnny);E.setPos(restricted,'p','BACK:top');assert.ok(!E.avail(restricted,'p').some(m=>m.forbidden));restricted.underground=true;assert.ok(E.avail(restricted,'p').some(m=>m.forbidden));
let S=E.newMatch(E.ROSTER.kolya,E.ROSTER.spaz),before=JSON.stringify(S);
E.resolve(S,'p',E.U.find(m=>m.id==='rnc'));assert.equal(JSON.stringify(S),before,'No hay sumisión de espalda estando de pie');
S.p.sta=0;before=JSON.stringify(S);E.resolve(S,'p',E.U.find(m=>m.id==='double'));assert.equal(JSON.stringify(S),before,'No se gasta estamina inexistente');
S=E.newMatch(E.ROSTER.kolya,E.ROSTER.spaz);E.resolve(S,'p',E.SIG.wrestle.find(m=>m.id==='fhl'),()=>0);assert.equal(S.pos,'TURTLE');assert.ok(S.p.chain.includes('gobehind'),'Front headlock conserva continuación a espalda');
S.bag.acai=0;before=JSON.stringify(S);E.useItem(S,'acai');assert.equal(JSON.stringify(S),before,'No se consume inventario vacío');
S.over={winner:'p'};before=JSON.stringify(S);E.resolve(S,'p',E.U.find(m=>m.id==='breathe'));assert.equal(JSON.stringify(S),before,'Combate terminado no cambia');
// El bloque incluye PLAYABLE como dependencia explícita, sin DOM.
const profile={progress:{stage:99,medals:[]}};
const prog=new Function('account','PLAYABLE',between('const CIRCUIT=','async function saveProgress')+';return{CIRCUIT,canEnter,unlockedFighters,progress};')({profile},Object.keys(E.ROSTER).filter(k=>!['spaz','ryker'].includes(k)));
assert.deepEqual(prog.CIRCUIT.map(t=>t.id),['copa','flow','umbral','carnales','ibjjf','adcc','cji']);
for(const t of prog.CIRCUIT){assert.ok(t.fights.length>0);for(const id of t.fights)assert.ok(E.ROSTER[id],id+' existe');}
const finalStage=prog.CIRCUIT.findIndex(t=>t.id==='cji');
assert.equal(prog.canEnter(finalStage),false,'Inflar stage no abre CJI');
const required=prog.CIRCUIT.filter(t=>t.id!=='cji').map(t=>t.id);
for(const missing of required){profile.progress.medals=required.filter(id=>id!==missing);assert.equal(prog.canEnter(finalStage),false,'CJI exige '+missing)}
profile.progress.medals=[...required];assert.equal(prog.canEnter(finalStage),true);
profile.progress.medals=['copa','copa','unknown'];assert.deepEqual(prog.progress().medals,['copa']);assert.equal(prog.canEnter(finalStage),false);
profile.progress.johnnyDefeated=true;assert.ok(prog.unlockedFighters().includes('johnny'));assert.ok(!prog.unlockedFighters().includes('black_johnny'));
profile.progress.medals.push('carnales');assert.ok(prog.unlockedFighters().includes('black_johnny'));
const map=new Function(between('const TS=16','const me=')+';return{buildMap,VENUES,NPCS,MW,MH};')();
for(const v of map.VENUES.filter(v=>v.stage!==null)){assert.ok(prog.CIRCUIT[v.stage].fights.length);assert.equal(prog.CIRCUIT[v.stage].id,v.id==='dojo'?'copa':v.id==='nogi'?'umbral':v.id)}
const grid=map.buildMap(),seen=new Set(['12,22']),queue=[[12,22]];
for(const[x,y]of queue)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,key=X+','+Y;if(X<0||Y<0||X>=map.MW||Y>=map.MH||seen.has(key)||'TB~'.includes(grid[Y][X])||map.NPCS.some(n=>n.x===X&&n.y===Y))continue;seen.add(key);queue.push([X,Y])}
for(const v of map.VENUES)assert.ok(seen.has(v.dx+','+v.dy),v.name+' accesible desde el inicio');
const economy=new Function('account','progress',between('function wallet()','function openShop(')+';return{wallet,credits};')({profile:{xp:240}},()=>profile.progress);
assert.equal(economy.credits(),240);economy.wallet().spent=180;assert.equal(economy.credits(),60);economy.wallet().spent=999;assert.equal(economy.credits(),0);
console.log('OK: sintaxis, acciones legales, cadenas, inventario, fin de combate, CJI, sedes accesibles y créditos.');
// Compras: descuenta una vez, equipar es gratis y un fallo de guardado revierte el cargo.
(async()=>{
 const source=between('async function buyItem(item)',"$('#shopBack')");
 const harness=new Function('source',`
   let account={mode:'guest'},myFighter={rash:'#e0483c'},shopBusy=false,saveError='',fail=false;
   const pr={shop:{spent:0,owned:[]}},msg={textContent:''};
   const wallet=()=>pr.shop,credits=()=>240-pr.shop.spent,progress=()=>pr;
   const renderShop=()=>{},$=()=>msg,store={set(){}},Snd={ok(){}};
   async function saveProgress(){saveError=fail?'Sin conexión':''}
   return eval(source+';({buyItem,get:()=>({spent:pr.shop.spent,owned:pr.shop.owned,fighter:myFighter}),fail:()=>{fail=true}})');
 `)(source);
 const item={id:'gi',cost:120,look:{gi:true,rash:'#3f7562'}};
 await harness.buyItem(item);assert.equal(harness.get().spent,120);assert.equal(harness.get().fighter.rash,'#3f7562');
 await harness.buyItem(item);assert.equal(harness.get().spent,120,'Equipar de nuevo no cobra');
 harness.fail();await harness.buyItem({id:'band',cost:80,look:{band:'#69c9b4'}});assert.equal(harness.get().spent,120);assert.ok(!harness.get().owned.includes('band'));
 console.log('OK: compra, equipamiento gratuito y reversión por fallo de guardado.');
})().catch(e=>{console.error(e);process.exitCode=1});
