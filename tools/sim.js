/* Simulador de balance. Extrae el motor de index.html y juega miles de combates.
   Uso: node tools/sim.js [combates_por_cruce]                                  */
require('./regression.js');
require('./campaign-test.js');
require('./special-test.js');
require('./training-test.js');
require('./rocha-test.js');
require('./don-moi-test.js');
require('./campaign-balance.js');
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const eng=html.slice(html.indexOf('/*ENGINE-START'),html.indexOf('/*ENGINE-END*/'));
const E=new Function(eng+'\nreturn{U,SIG,ROSTER,PLAYABLE,newMatch,resolve,aiPick,upkeep,avail,usable,useItem};')();
const{U,SIG,ROSTER,PLAYABLE,newMatch,resolve,aiPick,upkeep,avail,usable,useItem}=E;
const N=parseInt(process.argv[2]||'1500',10);
function play(pk,ek,smart){const S=newMatch(ROSTER[pk],ROSTER[ek]);
  while(!S.over){
    if(smart){ if(S.bag.porrosetamol>0&&S.p.hp<=S.p.maxHp-25&&S.p.sta<=S.p.maxSta-30)useItem(S,'porrosetamol'); else if(S.p.hp<45&&S.bag.acai>0)useItem(S,'acai'); else if(S.p.sta<20&&S.bag.electro>0)useItem(S,'electro'); else resolve(S,'p',aiPick(S,'p',12)) }
    else{const ms=avail(S,'p').filter(x=>usable(S,'p',x));resolve(S,'p',ms[Math.floor(Math.random()*ms.length)])}
    if(!S.over)resolve(S,'e',aiPick(S,'e'));if(!S.over)upkeep(S)}
  return S}
const ids=new Set(),all=U.concat(...Object.values(SIG));
for(const m of all){if(ids.has(m.id))console.log('ID DUPLICADO:',m.id);ids.add(m.id)}
for(const m of all)for(const c of m.chain||[])if(!ids.has(c))console.log('CADENA ROTA:',m.id,'->',c);
console.log(`${PLAYABLE.length} jugables · ${all.length} tecnicas · ${N} combates por cruce\n`);
const foes=['ryker','tonelada','bia','kolya','luana'];
console.log('personaje'.padEnd(10),foes.map(f=>f.slice(0,8).padEnd(9)).join(''),' azar vs ryker');
for(const k of PLAYABLE){const row=foes.map(e=>{if(e===k)return '  --     ';let w=0;
    for(let i=0;i<N;i++)if(play(k,e,true).over.winner==='p')w++;return((w/N*100).toFixed(0)+'%').padEnd(9)});
  let r=0;for(let i=0;i<N;i++)if(play(k,'ryker',false).over.winner==='p')r++;
  console.log(k.padEnd(10),row.join(''),' ',(r/N*100).toFixed(0)+'%')}
