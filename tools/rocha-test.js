const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=new Function(h.slice(h.indexOf('const TS=16'),h.indexOf('const me=',h.indexOf('const TS=16')))+';return{buildMap,chaseStep,rochaAction,NPCS,MW,MH};')();
const grid=m.buildMap(),r={x:24,y:62,cooldown:0,nextStep:0},target={x:20,y:60};
assert.ok(m.MW>42&&m.MH>62);assert.equal(m.rochaAction(r,target,1000,false),'chase');
for(let i=0;i<20&&m.rochaAction(r,target,1000,false)==='chase';i++){const next=m.chaseStep(grid,r,target,(x,y)=>m.NPCS.some(n=>n.x===x&&n.y===y));assert.ok(next);assert.equal(Math.abs(r.x-next.x)+Math.abs(r.y-next.y),1);assert.ok(!'TB~D'.includes(grid[next.y][next.x]));Object.assign(r,next)}
assert.equal(m.rochaAction(r,target,1000,false),'challenge');assert.equal(m.rochaAction(r,target,1000,true),'wait');r.cooldown=45000;assert.equal(m.rochaAction(r,target,2000,false),'wait');assert.equal(m.rochaAction(r,target,46000,false),'challenge');
assert.equal(m.chaseStep(['TTTTT','T.T.T','TTTTT'].map(x=>x.split('')),{x:1,y:1},{x:3,y:1}),null,'Sin ruta no bloquea el juego');
const E=new Function(h.slice(h.indexOf('/*ENGINE-START'),h.indexOf('/*ENGINE-END*/'))+';return{ROSTER,newMatch,resolve,aiPick,upkeep};')();
assert.equal(E.ROSTER.bad_rocha.name,'BAD ROCHA');assert.equal(E.ROSTER.bad_rocha.q.intro,'el Diablooo');assert.equal(E.ROSTER.bad_rocha.pal.style,'bald');assert.ok(E.ROSTER.bad_rocha.sets.includes('legs'));
for(let i=0;i<100;i++){const s=E.newMatch(E.ROSTER.don_moi,E.ROSTER.bad_rocha);let turns=0;while(!s.over&&turns++<100){E.resolve(s,'p',E.aiPick(s,'p'));if(!s.over)E.resolve(s,'e',E.aiPick(s,'e'));if(!s.over)E.upkeep(s)}assert.ok(s.over,'El combate termina')}
console.log('OK: Bad Rocha, persecución sin atravesar obstáculos, pausa, cooldown, ruta imposible y 100 combates completos.');
