const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const slice=(a,b)=>h.slice(h.indexOf(a),h.indexOf(b,h.indexOf(a)));
(async()=>{
 const make=new Function('defs','gate',`
 let account={mode:'guest',profile:{lp:0,progress:{medals:['copa']}}},PLAYABLE=[],nodes={};
 const $=key=>nodes[key]||(nodes[key]={textContent:'',innerHTML:'',className:'',classList:{contains:()=>true},getContext:()=>({})});
 const show=()=>{},drawFace=()=>{},UP=x=>x,esc=x=>x,nextBelt=()=>null,say=async()=>{};
 let FOE={pal:{},sn:'TEST',q:{win:'',lose:''}},S={p:{hp:50},bag:{}},mode;
 async function saveProgress(){};function gateButtons(m){mode=m};
 return eval(defs+gate+';({run:async(idx,winner)=>{circuit={si:CIRCUIT.findIndex(t=>t.id==="carnales"),idx};await openGate({winner,by:"points",turns:10,lp:15});return{mode,pr:progress()}}})');
 `);
 const game=make(slice('const CIRCUIT=','let saveError='),slice('async function openGate(o)',"$('#s-gate').addEventListener"));
 let r=await game.run(2,'p');assert.equal(r.mode,'johnny');assert.equal(r.pr.johnnyDefeated,true);assert.ok(!r.pr.medals.includes('carnales'));
 r=await game.run(3,'e');assert.equal(r.mode,'retry');assert.ok(!r.pr.medals.includes('carnales'));
 r=await game.run(3,'p');assert.equal(r.mode,'stage');assert.ok(r.pr.medals.includes('carnales'));assert.equal(r.pr.bonusCredits,120);
 await game.run(3,'p');assert.equal(r.pr.bonusCredits,120,'Medalla no duplica bonus');
 console.log('OK: Johnny abre elección; Black Johnny concede medalla solo al ganar; bonus no duplicado.');
})().catch(e=>{console.error(e);process.exitCode=1});
