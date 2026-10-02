const SUPABASE_URL = 'https://tbtnzwvffdxjbmoeprfa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Gu2ww48WEZPGHaONvjhATg_23TC5Cth';
const BUCKET = 'participant-photos';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $=id=>document.getElementById(id);
const nameEl=$('name'), photoEl=$('photo'), consentEl=$('consent'), createEl=$('create'), msg=$('message');
let photoFile=null, photoData=null, currentParticipant=null;
photoEl.addEventListener('change',e=>{photoFile=e.target.files?.[0]||null; validate()}); nameEl.addEventListener('input',validate); consentEl.addEventListener('change',validate);
function validate(){createEl.disabled=!(nameEl.value.trim().length>=2&&photoFile&&photoFile.size<=5*1024*1024&&consentEl.checked)}
function setMsg(t,error=false){msg.textContent=t;msg.style.color=error?'#b00020':'#087f3f'}
async function createCard(){
  const name=nameEl.value.trim(); createEl.disabled=true; setMsg('Uploading your photo…');
  try{
    const id=crypto.randomUUID(); const ext=(photoFile.name.split('.').pop()||'jpg').toLowerCase(); const path=`${id}.${ext}`;
    const {error:upErr}=await sb.storage.from(BUCKET).upload(path,photoFile,{contentType:photoFile.type||'image/jpeg',upsert:false}); if(upErr) throw upErr;
    const {data:pub}=sb.storage.from(BUCKET).getPublicUrl(path); const photo_url=pub.publicUrl;
    const {error:dbErr}=await sb.from('participants').insert({id,name,photo_url}); if(dbErr) throw dbErr;
    currentParticipant={id,name,photo_url}; history.replaceState({},'',`?ref=${id}`); photoData=photo_url; await showCard(currentParticipant); setMsg('Your card is ready!');
  }catch(e){console.error(e);setMsg('Something went wrong. Please check the Supabase permissions, then try again.',true);createEl.disabled=false}
}
createEl.addEventListener('click',createCard);
async function getParticipant(id){const {data,error}=await sb.from('participants').select('id,name,photo_url').eq('id',id).single(); if(error) throw error; return data}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
async function showCard(p){
  $('builder').classList.add('hidden');$('result').classList.remove('hidden');
  $('welcome').textContent=`${p.name} — I WILL BE THERE!`; $('shareStatus').textContent='Your card is ready';
  await document.fonts?.ready;
  const canvas=$('card'),ctx=canvas.getContext('2d'); const W=canvas.width,H=canvas.height;
  const red='#e21b2d',green='#064b2d',brightGreen='#087f3f',yellow='#ffd400',black='#101010',cream='#fff8e9',white='#fff';
  // warm sky / paper background
  const sky=ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#dff1f8'); sky.addColorStop(.55,'#fff7e5'); sky.addColorStop(1,'#f7bd45');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  // subtle red/green/yellow corner ribbons
  ctx.fillStyle=red;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(185,0);ctx.lineTo(0,155);ctx.closePath();ctx.fill();
  ctx.fillStyle=yellow;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(125,0);ctx.lineTo(0,105);ctx.closePath();ctx.fill();
  ctx.fillStyle=green;ctx.beginPath();ctx.moveTo(W,H);ctx.lineTo(W,H-170);ctx.lineTo(W-170,H);ctx.closePath();ctx.fill();
  // logos and fellowship header
  const logos=[['assets/fellowship-logo.jpeg',55,48,135],['assets/nysc-logo.jpeg',W/2-68,48,135],['assets/youth-alive-logo.jpeg',W-190,48,135]];
  for(const [src,x,y,s] of logos){try{const im=await loadImage(src);ctx.fillStyle=white;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2+10,0,Math.PI*2);ctx.fill();ctx.drawImage(im,x,y,s,s)}catch{}}
  ctx.fillStyle=black;ctx.textAlign='center';ctx.font='900 37px Arial';ctx.fillText('WINNERS YOUTH',W/2,215);ctx.fillText('CORPERS FELLOWSHIP',W/2,255);
  ctx.font='700 20px Arial';ctx.fillText('SERVICE  •  FELLOWSHIP  •  IMPACT',W/2,292);
  // photo frame, tilted like the approved poster
  try{
    const im=await loadImage(p.photo_url); const pw=475,ph=455,px=70,py=335;
    ctx.save();ctx.translate(px+pw/2,py+ph/2);ctx.rotate(-0.045);ctx.fillStyle=white;ctx.shadowColor='#0005';ctx.shadowBlur=16;ctx.shadowOffsetY=10;ctx.fillRect(-pw/2-18,-ph/2-18,pw+36,ph+76);ctx.shadowColor='transparent';
    const scale=Math.max(pw/im.width,ph/im.height),dw=im.width*scale,dh=im.height*scale;ctx.save();ctx.beginPath();ctx.rect(-pw/2,-ph/2,pw,ph);ctx.clip();ctx.drawImage(im,-dw/2,-dh/2,dw,dh);ctx.restore();
    ctx.fillStyle=yellow;ctx.fillRect(-pw/2-5,ph/2-5,pw+10,74);ctx.fillStyle=black;ctx.font='900 38px Arial';ctx.textAlign='center';ctx.fillText(p.name.toUpperCase(),0,ph/2+43);ctx.restore();
  }catch{}
  // brush-style I WILL BE THERE blocks
  function brushBlock(x,y,w,h,color,skew=0){ctx.save();ctx.translate(x,y);ctx.rotate(skew);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-w/2+18,-h/2);ctx.lineTo(w/2-8,-h/2+7);ctx.lineTo(w/2,h/2-9);ctx.lineTo(-w/2+12,h/2);ctx.lineTo(-w/2,h/2-18);ctx.closePath();ctx.fill();ctx.restore()}
  brushBlock(790,405,500,150,red,-.025);brushBlock(800,545,520,155,green,.02);
  ctx.fillStyle=white;ctx.font='900 72px "Arial Black",Arial';ctx.textAlign='center';ctx.fillText('I WILL BE',800,430);
  ctx.fillStyle=yellow;ctx.font='900 86px "Arial Black",Arial';ctx.fillText('THERE!',800,565);
  // NEW BEGINNING in brush-like marker font
  ctx.font='900 82px "Permanent Marker","Arial Black",Arial';ctx.fillStyle=red;ctx.fillText('NEW',W/2,835);ctx.fillStyle=green;ctx.font='900 92px "Permanent Marker","Arial Black",Arial';ctx.fillText('BEGINNING',W/2,915);
  ctx.fillStyle=black;ctx.font='900 49px Arial';ctx.fillText('CORPERS WEEK 2026',W/2,980);
  // date
  ctx.fillStyle=red;ctx.fillRect(270,1010,540,8);ctx.fillStyle=black;ctx.font='900 39px Arial';ctx.fillText('22ND – 25TH OCTOBER 2026',W/2,1065);
  // crowd / sunset silhouette
  const horizon=1140;const sun=ctx.createRadialGradient(W/2,horizon,10,W/2,horizon,180);sun.addColorStop(0,'#fff59a');sun.addColorStop(1,'#ffbd2e00');ctx.fillStyle=sun;ctx.fillRect(0,horizon-180,W,220);
  ctx.fillStyle='#251600';for(let i=0;i<48;i++){const x=(i/47)*W;const hh=30+(i%7)*12;ctx.fillRect(x,horizon-hh,22,hh);ctx.beginPath();ctx.arc(x+11,horizon-hh-8,13,0,Math.PI*2);ctx.fill();if(i%4===0){ctx.fillRect(x+3,horizon-hh-38,7,30);ctx.fillRect(x+12,horizon-hh-32,7,24)}}
  // dark green footer with hashtags and activities
  ctx.fillStyle=green;ctx.beginPath();ctx.moveTo(0,1190);ctx.quadraticCurveTo(W/2,1135,W,1190);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  ctx.fillStyle=white;ctx.font='800 29px Arial';ctx.fillText('#NewBeginning    #CorpersWeek2026',W/2,1250);
  const acts=['FELLOWSHIP','WORD','PRAISE','MOVIE NIGHT','OUTREACH','AND MORE'];ctx.font='800 23px Arial';const xs=[100,280,450,625,825,1000];for(let i=0;i<acts.length;i++){ctx.fillText(acts[i],xs[i],1320)}
}
$('download').addEventListener('click',()=>{const a=document.createElement('a');a.download='corpers-week-2026-card.png';a.href=$('card').toDataURL('image/png');a.click()});
function shareUrl(){return `${location.origin}${location.pathname}?ref=${currentParticipant?.id||''}`.replace('?ref=','?ref=')}
function shareText(url){return `I WILL BE THERE! — Corpers Week 2026\n#NewBeginning #CorpersWeek2026\n${url}`}
async function cardFile(){
  const blob=await new Promise((resolve,reject)=>$('card').toBlob(b=>b?resolve(b):reject(new Error('Could not prepare card')),'image/png'));
  return new File([blob],'corpers-week-2026-card.png',{type:'image/png'});
}
async function shareCard(){
  const url=shareUrl();
  const text=shareText(url);
  try{
    const file=await cardFile();
    if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
      await navigator.share({title:'Corpers Week 2026',text,files:[file]});
      $('shareStatus').textContent='Card and link shared';
      return;
    }
  }catch(e){
    if(e?.name==='AbortError') return;
    console.warn('File sharing failed:',e);
  }
  try{await navigator.share({title:'Corpers Week 2026',text,url});$('shareStatus').textContent='Link shared';}
  catch{await navigator.clipboard.writeText(text);$('shareStatus').textContent='Message copied — paste into WhatsApp';}
}
$('share').addEventListener('click',shareCard);
$('whatsapp').addEventListener('click',shareCard);
// Shared links intentionally open a fresh card-creation form. The ref identifies the inviter only;
// the previous participant's name/photo are never loaded from the URL.
(async()=>{const params=new URLSearchParams(location.search);if(params.has('ref')){$('builder').scrollIntoView({behavior:'smooth',block:'start'});}})();
