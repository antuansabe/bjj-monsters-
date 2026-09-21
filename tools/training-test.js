const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const E=new Function(h.slice(h.indexOf('/*ENGINE-START'),h.indexOf('/*ENGINE-END*/'))+';return{ROSTER,U,TRAINING,trainingUnlocked,applyTraining,beltCombat,newMatch,hurt,avail,setPos};')();
const medals=['copa','flow','umbral','carnales'];
for(const t of E.TRAINING){assert.ok(E.U.find(m=>m.id===t.base));assert.equal(E.trainingUnlocked({xp:t.xp-1,progress:{medals}},t),false);assert.equal(E.trainingUnlocked({xp:t.xp,progress:{medals:medals.slice(0,t.medals-1)}},t),false);assert.equal(E.trainingUnlocked({xp:t.xp,progress:{medals}},t),true)}
const original=JSON.stringify(E.ROSTER.don_moi),s=E.newMatch(E.ROSTER.don_moi,E.ROSTER.ryker);
E.applyTraining(s.p,{belt:'negro',xp:350,progress:{medals}});assert.equal(s.p.stats.SUB,E.ROSTER.don_moi.stats.SUB+12);assert.equal(s.p.resistance,.12);assert.equal(JSON.stringify(E.ROSTER.don_moi),original,'No muta estadísticas del catálogo');
for(const t of E.TRAINING){const m=s.p.moves.find(m=>m.id===t.id);assert.ok(m);E.setPos(s,'p',m.from[0]);assert.ok(E.avail(s,'p').includes(m),'Técnica desbloqueada disponible en posición legal')}
const before=s.p.hp;E.hurt(s,'e',50,[],'test');assert.equal(before-s.p.hp,44,'Cinta negra reduce 12% de daño');
const fresh=E.newMatch(E.ROSTER.don_moi,E.ROSTER.ryker);E.applyTraining(fresh.p,{belt:'blanco',xp:0,progress:{medals:[]}});assert.equal(fresh.p.stats.SUB,E.ROSTER.don_moi.stats.SUB);assert.ok(!fresh.p.moves.some(m=>m.id.startsWith('trained_')));
assert.ok(E.beltCombat('negro').attack>E.beltCombat('marron').attack);
console.log('OK: técnicas por XP y medallas, posiciones legales, ataque, defensa y catálogo inmutable.');
