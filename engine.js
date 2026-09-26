/* ZrNb Lab 1.0 — educational, uncalibrated spatial kinetics. No physical-time conversion. */
(function (root) {
'use strict';
const VERSION='1.0.0';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function rng(seed){let x=seed>>>0;return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const DEFAULTS={seed:2026,temperature:150,hydrogen:85,radiation:65,beam:'neutron',nb:5,grains:9,initialH:120};
class Simulation{
 constructor(params={}){this.params={...DEFAULTS,...params};this.w=72;this.h=44;this.n=this.w*this.h;this.reset();}
 reset(){this.initialParams={...this.params};this.random=rng(this.params.seed);this.tick=0;this.hBudget=0;this.rBudget=0;this.pBudget=0;this.injected=0;this.generated=0;this.recombined=0;this.sunkV=0;this.sunkI=0;this.history=[];this.changes=[];
 for(const key of ['free','trapped','hydride','v','interstitial','grain','nbMask','boundary'])this[key]=new Int32Array(this.n);
 this.sites=Array.from({length:this.params.grains},()=>({x:this.random()*this.w,y:this.random()*this.h,angle:this.random()*Math.PI}));
 for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){let best=Infinity,id=0;this.sites.forEach((s,j)=>{let d=(x-s.x)**2+(y-s.y)**2;if(d<best){best=d;id=j;}});this.grain[y*this.w+x]=id;}
 for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){let k=y*this.w+x;this.boundary[k]=Number((x>0&&this.grain[k-1]!==this.grain[k])||(y>0&&this.grain[k-this.w]!==this.grain[k]));}
 const clusters=Array.from({length:7},()=>({x:4+this.random()*(this.w-8),y:3+this.random()*(this.h-6)}));
 const order=Array.from({length:this.n},(_,k)=>({k,d:Math.min(...clusters.map(c=>(k%this.w-c.x)**2+(Math.floor(k/this.w)-c.y)**2))})).sort((a,b)=>a.d-b.d);
 for(let j=0;j<Math.round(this.n*this.params.nb/100);j++)this.nbMask[order[j].k]=1;
 for(let j=0;j<this.params.initialH;j++){let k=Math.floor(this.random()*this.h)*this.w+Math.floor(this.random()*12);this.free[k]++;this.injected++;}
 this.record();}
 setParam(key,value){this.params[key]=value;this.changes.push({step:this.tick,key,value});}
 normal(){return Math.sqrt(-2*Math.log(Math.max(1e-12,this.random())))*Math.cos(2*Math.PI*this.random());}
 target(x,y){return clamp(Math.round(y),0,this.h-1)*this.w+clamp(Math.round(x),0,this.w-1);}
 step(count=1){for(let z=0;z<count;z++)this.one();return this.stats();}
 one(){const p=this.params;this.tick++;const kelvin=p.temperature+273.15;
 // 0.12 eV is a chosen teaching energy, NOT a fitted diffusion barrier for ZrNb.
 const mobility=clamp(0.32*Math.exp(-0.12/8.617333262e-5*(1/kelvin-1/573.15)),0.02,0.9);
 this.hBudget+=p.hydrogen/9;while(this.hBudget>=1){this.free[Math.floor(this.random()*this.h)*this.w]++;this.injected++;this.hBudget--;}
 this.rBudget+=p.radiation/12;const events=Math.floor(this.rBudget);this.rBudget-=events;
 const cx=this.w*(0.3+0.12*this.normal()),cy=this.random()*this.h;
 for(let e=0;e<events;e++){let x,y;
 if(p.beam==='heavy'){x=cx+this.normal()*2;y=cy+this.normal()*2;}
 else if(p.beam==='proton'){x=this.w*(0.35+0.10*this.normal());y=this.random()*this.h;}
 else{x=this.random()*this.w;y=this.random()*this.h;}
 const a=this.target(x,y),b=this.target(x+this.normal()*2,y+this.normal()*2);this.v[a]++;this.interstitial[b]++;this.generated++;
 if(p.beam==='proton'){this.pBudget+=0.5;if(this.pBudget>=1){this.free[a]++;this.injected++;this.pBudget--;}}
 }
 const next=new Int32Array(this.n);
 for(let k=0;k<this.n;k++){const x=k%this.w,y=Math.floor(k/this.w);let q=this.free[k];
 for(let j=0;j<q;j++){let dest=k;if(this.random()<Math.min(.95,mobility*(this.nbMask[k]?1.4:1))){const dir=Math.floor(this.random()*4);dest=this.target(x+(dir===0?1:dir===1?-1:0),y+(dir===2?1:dir===3?-1:0));}next[dest]++;}}
 this.free=next;
 // Mobile self-interstitial population diffuses; vacancy migration is omitted.
 const ni=new Int32Array(this.n);
 for(let k=0;k<this.n;k++)for(let j=0;j<this.interstitial[k];j++){let dest=k;if(this.random()<.4+.5*mobility){let dir=Math.floor(this.random()*4);dest=this.target(k%this.w+(dir===0?1:dir===1?-1:0),Math.floor(k/this.w)+(dir===2?1:dir===3?-1:0));}ni[dest]++;}this.interstitial=ni;
 const threshold=2+Math.floor(p.temperature/100);
 for(let k=0;k<this.n;k++){
 const pairs=Math.min(this.v[k],this.interstitial[k]);for(let j=0;j<pairs;j++)if(this.random()<.45+.5*mobility){this.v[k]--;this.interstitial[k]--;this.recombined++;}
 if(this.boundary[k]){const nv=this.v[k],nj=this.interstitial[k];for(let j=0;j<nv;j++)if(this.random()<.008+.1*mobility){this.v[k]--;this.sunkV++;}for(let j=0;j<nj;j++)if(this.random()<.08+.2*mobility){this.interstitial[k]--;this.sunkI++;}}
 const cap=1+this.v[k]*2+this.boundary[k]*2+this.nbMask[k]*2;
 const capture=(this.v[k]||this.boundary[k]||this.nbMask[k])?Math.min(.6,.04+.06*this.v[k]+.06*this.nbMask[k]):0;
 let q=this.free[k];for(let j=0;j<q;j++)if(this.trapped[k]<cap&&this.random()<capture){this.free[k]--;this.trapped[k]++;}
 q=this.trapped[k];for(let j=0;j<q;j++)if(this.random()<.003+.045*mobility){this.trapped[k]--;this.free[k]++;}
 // Every precipitate packet stores exactly three H tracer units. No stoichiometric mapping.
 if(!this.nbMask[k]&&this.free[k]>=threshold+3&&this.random()<.24){this.free[k]-=3;this.hydride[k]+=3;}
 if(this.hydride[k]>0&&this.free[k]<threshold&&this.random()<(.0005+.022*mobility)){this.hydride[k]-=3;this.free[k]+=3;}
 }
 if(this.tick%5===0)this.record();}
 stats(){const sum=a=>a.reduce((s,x)=>s+x,0);const free=sum(this.free),trapped=sum(this.trapped),hydride=sum(this.hydride),v=sum(this.v),interstitial=sum(this.interstitial);return{step:this.tick,free,trapped,hydride,totalH:free+trapped+hydride,v,interstitial,hydrideCells:this.hydride.reduce((s,x)=>s+(x>0),0),injected:this.injected,generated:this.generated,recombined:this.recombined,sunkV:this.sunkV,sunkI:this.sunkI};}
 record(){this.history.push(this.stats());}
 export(){return{version:VERSION,model:'uncalibrated-educational-tracer-grid',units:{time:'model steps',hydrogen:'tracer count, not ppm',defects:'model count, not dpa',length:'grid cells, not nm'},initialParams:{...this.initialParams},params:{...this.params},changes:this.changes,stats:this.stats(),history:this.history,grid:{width:this.w,height:this.h,...Object.fromEntries(['free','trapped','hydride','v','interstitial','grain','nbMask','boundary'].map(k=>[k,Array.from(this[k])]))}};}
}
const lattice={zr:{a:.32324,c:.51472},nb:{a:.330},hydride:{a:.47776}};
function diffraction({strain=0,size=80,microstrain=.1,hydride=true,nb=true}={}){
 const result=[],lambda=.15406;
 const groups=[{phase:'α-Zr',a:lattice.zr.a,c:lattice.zr.c,kind:'hcp',hkls:[[1,0,0,55],[0,0,2,40],[1,0,1,100],[1,0,2,30],[1,1,0,38],[1,0,3,42],[2,0,0,12],[1,1,2,30],[2,0,1,22]]}];
 if(nb)groups.push({phase:'Nb',a:lattice.nb.a,kind:'cubic',hkls:[[1,1,0,60],[2,0,0,25],[2,1,1,35]]});
 if(hydride)groups.push({phase:'δ-ZrHₓ',a:lattice.hydride.a,kind:'cubic',hkls:[[1,1,1,65],[2,0,0,40],[2,2,0,45],[3,1,1,30],[2,2,2,20]]});
 for(const g of groups)for(const [h,k,l,intensity] of g.hkls){const scale=1+strain/100,a=g.a*scale,c=(g.c||g.a)*scale;const d=g.kind==='hcp'?1/Math.sqrt(4/3*(h*h+h*k+k*k)/(a*a)+l*l/(c*c)):a/Math.sqrt(h*h+k*k+l*l);const v=lambda/(2*d);if(v>=1)continue;const theta=Math.asin(v),twoTheta=theta*360/Math.PI;if(twoTheta<25||twoTheta>85)continue;
 const scherrer=.9*lambda/(size*Math.cos(theta))*180/Math.PI;const strainWidth=4*(microstrain/100)*Math.tan(theta)*180/Math.PI;const fwhm=Math.sqrt(.15**2+scherrer**2+strainWidth**2);
 result.push({phase:g.phase,hkl:`${h}${k}${l}`,d,twoTheta,fwhm,intensity});}
 return result.sort((a,b)=>a.twoTheta-b.twoTheta);
}
root.ZrNb={Simulation,DEFAULTS,VERSION,lattice,diffraction,rng};
if(typeof module!=='undefined')module.exports=root.ZrNb;
})(typeof window!=='undefined'?window:globalThis);
