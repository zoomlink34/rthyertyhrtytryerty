const firebaseConfig = {
  apiKey: "AIzaSyDcFXKaFi1lPOV5wMqFwcjhXlpKdpKkxgE",
  authDomain: "the-10-million-pixels-plus.firebaseapp.com",
  projectId: "the-10-million-pixels-plus",
  databaseURL: "https://the-10-million-pixels-plus-default-rtdb.firebaseio.com/",
  storageBucket: "the-10-million-pixels-plus.firebasestorage.app",
  messagingSenderId: "589782307046",
  appId: "1:589782307046:web:fcc40b27c846d5dcb86b27"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const cv = document.getElementById('mainCanvas');
const ctx = cv.getContext('2d');
cv.width = 5000; cv.height = 2000;

let scale = 0.3, pX = 0, pY = 0, isD = false, sX, sY, pixels = {};

// ফায়ার অ্যানিমেশন
const fCv = document.getElementById('fireCanvas'); const fCtx = fCv.getContext('2d');
fCv.width = window.innerWidth; fCv.height = 100;
let pt = [];
class Fire { constructor(x,y){this.x=x;this.y=y;this.s=Math.random()*4+1;this.sy=Math.random()*1.5+0.5;this.l=1;} update(){this.y-=this.sy;this.l-=0.015;} draw(){fCtx.globalAlpha=this.l;fCtx.fillStyle='#ff4500';fCtx.beginPath();fCtx.arc(this.x,this.y,this.s,0,Math.PI*2);fCtx.fill();} }
function animF(){ fCtx.clearRect(0,0,fCv.width,100); for(let i=0;i<2;i++)pt.push(new Fire(fCv.width/2+(Math.random()*500-250),90)); pt.forEach((p,i)=>{p.update();p.draw();if(p.l<=0)pt.splice(i,1);}); requestAnimationFrame(animF); } animF();

function updateUI() { document.getElementById('canvas-mover').style.transform = `translate(${pX}px,${pY}px) scale(${scale})`; }

function render() {
    ctx.clearRect(0, 0, 5000, 2000);
    ctx.strokeStyle = "rgba(0, 0, 255, 0.05)";
    for(let x=0;x<=5000;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,2000);ctx.stroke();}
    for(let y=0;y<=2000;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(5000,y);ctx.stroke();}

    Object.keys(pixels).forEach(id => {
        const p = pixels[id];
        if(p.imageUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = p.imageUrl;
            img.onload = () => {
                const size = Math.sqrt(parseInt(p.pixelCount || 100));
                ctx.drawImage(img, p.x, p.y, size, size);
            };
        }
    });
}

db.ref('pixels').on('value', s => { 
    pixels = s.val() || {}; render(); 
    let total = 0; Object.keys(pixels).forEach(k => total += parseInt(pixels[k].pixelCount || 0));
    document.getElementById('pixel-count-display').innerText = total.toLocaleString();
});

const vp = document.getElementById('pixel-viewport');
vp.onwheel = (e) => { e.preventDefault(); scale = Math.min(Math.max(0.1, scale*(e.deltaY>0?0.9:1.1)), 4); updateUI(); };
vp.onmousedown = (e) => { isD = true; sX = e.clientX-pX; sY = e.clientY-pY; vp.style.cursor = "grabbing";};
window.onmouseup = () => { isD = false; vp.style.cursor = "grab"; };
window.onmousemove = (e) => { if(isD){ pX = e.clientX-sX; pY = e.clientY-sY; updateUI(); } };

vp.onclick = (e) => {
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left - pX) / scale;
    const my = (e.clientY - rect.top - pY) / scale;
    Object.keys(pixels).forEach(id => {
        const p = pixels[id];
        const sz = Math.sqrt(parseInt(p.pixelCount || 100));
        if(mx>=p.x && mx<=p.x+sz && my>=p.y && my<=p.y+sz) if(p.websiteUrl) window.open(p.websiteUrl, '_blank');
    });
};
