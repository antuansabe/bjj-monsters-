/* Regresiones de combate, desbloqueos y rutas. Sin dependencias ni navegador. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const between=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));
new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
const E=new Function(between('/*ENGINE-START','/*ENGINE-END*/')+';return{ROSTER,U,SIG,newMatch,resolve,useItem,avail,setPos,upkeep};')();
let S=E.newMatch(E.ROSTER.kolya,E.ROSTER.spaz),before=JSON.stringify(S);
E.resolve(S,'p',E.U.find(m=>m.id==='rnc'));assert.equal(JSON.stringify(S),before,'No hay sumisión de espalda estando de pie');
S.p.sta=0;before=JSON.stringify(S);E.resolve(S,'p',E.U.find(m=>m.id==='double'));assert.equal(JSON.stringify(S),before,'No se gasta estamina inexistente');
S=E.newMatch(E.ROSTER.kolya,E.ROSTER.spaz);E.resolve(S,'p',E.SIG.wrestle.find(m=>m.id==='fhl'),()=>0);assert.equal(S.pos,'TURTLE');assert.ok(S.p.chain.includes('gobehind'),'Front headlock conserva continuación a espalda');
S.bag.acai=0;before=JSON.stringify(S);E.useItem(S,'acai');assert.equal(JSON.stringify(S),before,'No se consume inventario vacío');
S.over={winner:'p'};before=JSON.stringify(S);E.resolve(S,'p',E.U.find(m=>m.id==='breathe'));assert.equal(JSON.stringify(S),before,'Combate terminado no cambia');
// El bloque incluye PLAYABLE como dependencia explícita, sin DOM.
const profile={progress:{stage:99,medals:[]}};
const prog=new Function('account','PLAYABLE',between('const CIRCUIT=','async function saveProgress')+';return{CIRCUIT,canEnter,unlockedFighters,progress};')({profile},Object.keys(E.ROSTER).filter(k=>!['spaz','ryker'].includes(k)));
assert.equal(prog.canEnter(3),false,'Inflar stage no abre CJI');
profile.progress.medals=['copa','ibjjf'];assert.equal(prog.canEnter(3),false);
profile.progress.medals.push('adcc');assert.equal(prog.canEnter(3),true);
const map=new Function(between('const TS=16','const me=')+';return{buildMap,VENUES,NPCS,MW,MH};')();
const grid=map.buildMap(),seen=new Set(['12,22']),queue=[[12,22]];
for(const[x,y]of queue)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,key=X+','+Y;if(X<0||Y<0||X>=map.MW||Y>=map.MH||seen.has(key)||'TB~'.includes(grid[Y][X])||map.NPCS.some(n=>n.x===X&&n.y===Y))continue;seen.add(key);queue.push([X,Y])}
for(const v of map.VENUES)assert.ok(seen.has(v.dx+','+v.dy),v.name+' accesible desde el inicio');
const economy=new Function('account','progress',between('function wallet()','function openShop(')+';return{wallet,credits};')({profile:{xp:240}},()=>profile.progress);
assert.equal(economy.credits(),240);economy.wallet().spent=180;assert.equal(economy.credits(),60);economy.wallet().spent=999;assert.equal(economy.credits(),0);
console.log('OK: sintaxis, acciones legales, cadenas, inventario, fin de combate, CJI, 8 sedes accesibles y créditos.');
