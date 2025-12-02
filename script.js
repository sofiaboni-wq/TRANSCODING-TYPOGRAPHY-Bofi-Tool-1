/* -----------------------------------------------------
   VARIABILI GLOBALI
----------------------------------------------------- */
let letterVariants = {};  
let trailImages = [];     
let letterIntervals = [];
let lastTrail = 0;

/* -----------------------------------------------------
   1. CARICAMENTO LETTERE
----------------------------------------------------- */
async function loadLetterVariants() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const variants = {};
    for (let letter of letters) {
        variants[letter] = [];
        let idx = 1;
        while (true) {
            const src = `img/letters/${letter}_${idx}.png`;
            if (!(await imageExists(src))) break;
            variants[letter].push(src);
            idx++;
        }
    }
    return variants;
}

function imageExists(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
    });
}

/* -----------------------------------------------------
   2. CARICA IMMAGINI SCIA
----------------------------------------------------- */
function loadTrailImages() {
    const arr = [];
    const maxImages = 50;
    for(let i=1;i<=maxImages;i++){
        arr.push(`img/references/trail${i}.png`);
    }
    return arr;
}

/* -----------------------------------------------------
   3. RENDER TESTO
----------------------------------------------------- */
function renderText() {
    const wrapper = document.getElementById("textWrapper");
    wrapper.innerHTML = "";
    clearLetterIntervals();

    const text = document.getElementById("textInput").value || "";
    const size = document.getElementById("sizeSlider").value;

    [...text].forEach(char => {
        const upper = char.toUpperCase();
        if(!letterVariants[upper] || letterVariants[upper].length === 0){
            const spacer = document.createElement("span");
            spacer.style.display = "inline-block";
            spacer.style.width = size/2 + "px";
            wrapper.appendChild(spacer);
            return;
        }

        const container = document.createElement("span");
        const img = document.createElement("img");
        img.src = letterVariants[upper][0];
        img.style.width = size + "px";
        img.style.height = "auto";
        container.appendChild(img);
        wrapper.appendChild(container);

        startVariantAnimation(img, upper);
    });
}

/* -----------------------------------------------------
   4. CRAZYNESS
----------------------------------------------------- */
function startVariantAnimation(img, letter){
    const crazyness = Number(crazySlider.value);
    if(crazyness===0) return;

    const variants = letterVariants[letter];
    function change(){ img.src = variants[Math.floor(Math.random()*variants.length)]; }
    change();
    const interval = setInterval(change, 200 + Math.random()*1200);
    letterIntervals.push(interval);
}

function clearLetterIntervals(){
    letterIntervals.forEach(i=>clearInterval(i));
    letterIntervals=[];
}

/* -----------------------------------------------------
   5. SCIA DI COMETA
----------------------------------------------------- */
canvas.addEventListener("mousemove", e => {
    if(!mouseMode.checked) return;
    if(document.getElementById("galleryMode").checked) return;

    const now = performance.now();
    if(now - lastTrail < 100) return;
    lastTrail = now;

    if(trailImages.length===0) return;

    const imgSrc = trailImages[Math.floor(Math.random()*trailImages.length)];
    const size = sizeSlider.value*1.8;

    const img = document.createElement("img");
    img.src = imgSrc;
    img.classList.add("trail");
    img.style.width = size+"px";
    img.style.height="auto";

    const rect = canvas.getBoundingClientRect();
    const jitter = 70;

    img.style.left = (e.clientX - rect.left - size/2 + (Math.random()-0.5)*jitter)+"px";
    img.style.top  = (e.clientY - rect.top - size/2 + (Math.random()-0.5)*jitter)+"px";

    canvas.appendChild(img);

    setTimeout(()=>img.style.opacity=0, 4000);
    setTimeout(()=>img.remove(), 6000);
});

/* -----------------------------------------------------
   6. DOWNLOAD CANVAS
----------------------------------------------------- */
downloadBtn.onclick = () => {
    html2canvas(document.getElementById("canvas")).then(canvasImg => {
        const a = document.createElement("a");
        a.download = "canvas.png";
        a.href = canvasImg.toDataURL("image/png");
        a.click();
    });
};

/* -----------------------------------------------------
   7. GALLERY MODE + LIGHTBOX
----------------------------------------------------- */
galleryMode.addEventListener("change", () => {
    const canvasEl = document.getElementById("canvas");
    const galleryEl = document.getElementById("gallery");

    if(galleryMode.checked){
        canvasEl.style.display="none";
        galleryEl.innerHTML="";
        trailImages.forEach(src=>{
            const img = document.createElement("img");
            img.src = src;
            galleryEl.appendChild(img);
        });
        galleryEl.style.display="block";
    } else {
        canvasEl.style.display="flex";
        galleryEl.style.display="none";
    }
});

// Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

document.getElementById("gallery").addEventListener("click", e => {
    if(e.target.tagName === "IMG"){
        lightbox.style.display = "flex";
        lightboxImg.src = e.target.src;
        const filename = e.target.src.split("/").pop().split(".")[0];
        lightboxCaption.textContent = filename;
    }
});

lightboxClose.onclick = () => { lightbox.style.display = "none"; }
lightbox.onclick = e => { if(e.target === lightbox) lightbox.style.display = "none"; }

/* -----------------------------------------------------
   8. INIT
----------------------------------------------------- */
trailImages = loadTrailImages();

loadLetterVariants().then(v => {
    letterVariants = v;
    renderText();
});

textInput.oninput = renderText;
sizeSlider.oninput = renderText;
crazySlider.oninput = renderText;
