const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const E=new Function(h.slice(h.indexOf('/*ENGINE-START'),h.indexOf('/*ENGINE-END*/'))+';return{ROSTER,newMatch,resolve,avail,setPos,usable,U};')();
let s=E.newMatch(E.ROSTER.chelo,E.ROSTER.ryker);const special=s.p.moves.find(m=>m.special);assert.ok(special);
E.setPos(s,'p','GUARD:bottom');assert.equal(E.usable(s,'p',special),false);let before=JSON.stringify(s);E.resolve(s,'p',special,()=>0);assert.equal(JSON.stringify(s),before,'No especial sin carga');
s.p.charge=100;E.setPos(s,'p','STANDING:neutral');before=JSON.stringify(s);E.resolve(s,'p',special,()=>0);assert.equal(JSON.stringify(s),before,'No especial desde una posición incompatible');
E.setPos(s,'p','GUARD:bottom');const events=E.resolve(s,'p',special,()=>.99);assert.equal(s.p.charge,0);assert.ok(events.some(e=>e.t==='special'&&e.text===special.n));assert.equal(E.usable(s,'p',special),false,'No encadenar especiales gratis');
s=E.newMatch(E.ROSTER.aurik,E.ROSTER.johnny);E.resolve(s,'p',E.U.find(m=>m.id==='collar'),()=>.5);assert.ok(s.p.charge>0&&s.p.charge<=100,'Daño carga el especial');
s.p.charge=99;s.p.sta=100;E.resolve(s,'p',E.U.find(m=>m.id==='collar'),()=>.5);assert.equal(s.p.charge,100,'Carga limitada');
for(const def of Object.values(E.ROSTER)){const state=E.newMatch(def,E.ROSTER.ryker);const m=state.p.moves.find(x=>x.special);assert.ok(m?.from?.length,def.name+' tiene especial');}
console.log('OK: carga por daño, límite, consumo, posición legal y evento de animación especial.');
