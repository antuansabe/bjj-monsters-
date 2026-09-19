const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const E=new Function(h.slice(h.indexOf('/*ENGINE-START'),h.indexOf('/*ENGINE-END*/'))+';return{ROSTER,newMatch,resolve,aiPick,upkeep,useItem};')();
let seed=90210;const rng=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);const n=500,rows=[];
for(const foe of ['chanops','vagabundo','johnny','black_johnny']){let wins=0,turns=0,specials=0;
 for(let i=0;i<n;i++){const s=E.newMatch(E.ROSTER.chelo,E.ROSTER[foe],{underground:foe==='black_johnny'});s.p.hp+=12;s.p.maxHp+=12;
  while(!s.over){let ev;if(s.p.hp<45&&s.bag.acai)ev=E.useItem(s,'acai');else if(s.p.sta<20&&s.bag.electro)ev=E.useItem(s,'electro');else ev=E.resolve(s,'p',E.aiPick(s,'p',12,rng),rng);specials+=ev.filter(e=>e.t==='special').length;if(!s.over)E.resolve(s,'e',E.aiPick(s,'e',26,rng),rng);if(!s.over)E.upkeep(s);assert.ok(s.turn<=24)}
  wins+=s.over.winner==='p';turns+=s.turn;}
 rows.push({foe,win:Math.round(wins/n*100),turns:(turns/n).toFixed(1),specials});}
console.table(rows);assert.ok(rows[0].win>=90,'Chanops debe ser accesible');assert.ok(rows[3].win<rows[2].win,'Black Johnny debe ser más difícil');assert.ok(rows[3].win>=8,'Black Johnny debe ser vencible');
