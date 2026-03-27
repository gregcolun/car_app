const backBtn = document.getElementById("backBtn");
const logoutBtnDetalii = document.getElementById("logoutBtnDetalii");
const detaliiAnunt = document.getElementById("detaliiAnunt");
const mesajDetalii = document.getElementById("mesajDetalii");
const mesajEditare = document.getElementById("mesajEditare");
const editForm = document.getElementById("editForm");
const editTitlu = document.getElementById("editTitlu");
const editDescriere = document.getElementById("editDescriere");
const editPret = document.getElementById("editPret");
const editImagineFisier = document.getElementById("editImagineFisier");
const mesajImagineEditare = document.getElementById("mesajImagineEditare");
const previewImagineEditare = document.getElementById("previewImagineEditare");
const stergeImagineBtn = document.getElementById("stergeImagineBtn");

const DIMENSIUNE_MAXIMA_IMAGINE = 3 * 1024 * 1024;
const CURS_EUR_MDL = 20;

let token = localStorage.getItem("token") || "";
let currentUsername = localStorage.getItem("username") || "";
let anuntCurent = null;
let imagineNouaBase64 = null;
let stergeImaginea = false;

function seteazaMesaj(element, text, tip = "") {
    element.textContent = text;
    element.className = "mesaj-global";

    if (tip === "eroare") {
        element.classList.add("mesaj-eroare");
    }
    if (tip === "succes") {
        element.classList.add("mesaj-succes");
    }
}

function esteAutentificat() {
    return Boolean(token && currentUsername);
}

function citesteIdAnuntDinUrl() {
    const query = new URLSearchParams(window.location.search);
    const id = Number(query.get("id"));
    return Number.isInteger(id) && id > 0 ? id : null;
}

function formatPret(pret) {
    const pretNumeric = Number(pret);
    const pretEur = new Intl.NumberFormat("ro-RO", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 2
    }).format(pretNumeric);
    const pretMdl = new Intl.NumberFormat("ro-RO", {
        style: "currency",
        currency: "MDL",
        maximumFractionDigits: 2
    }).format(pretNumeric * CURS_EUR_MDL);

    return `${pretEur} (~${pretMdl})`;
}

function afiseazaDetaliiAnunt(ad) {
    const areImagine = Boolean(ad.imagineUrl);
    const imagine = areImagine
        ? `<img class="ad-imagine ad-imagine-mare" src="${ad.imagineUrl}" alt="${ad.titlu}" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">`
        : "";
    const placeholderStyle = areImagine ? "style='display:none'" : "";
    const placeholder = `<div class="ad-placeholder ad-placeholder-mare" ${placeholderStyle}>Fără imagine</div>`;

    detaliiAnunt.innerHTML = `
        <article class="ad-card ad-card-mare">
            ${imagine}
            ${placeholder}
            <div class="ad-body">
                <h3>${ad.titlu}</h3>
                <p class="ad-descriere">${ad.descriere}</p>
                <p class="ad-pret">${formatPret(ad.pret)}</p>
                <p class="ad-owner">Publicat de: ${ad.ownerUsername}</p>
            </div>
        </article>
    `;
}

function precompleteazaFormular(ad) {
    editTitlu.value = ad.titlu;
    editDescriere.value = ad.descriere;
    editPret.value = ad.pret;

    imagineNouaBase64 = null;
    stergeImaginea = false;
    editImagineFisier.value = "";

    if (ad.imagineUrl) {
        previewImagineEditare.src = ad.imagineUrl;
        previewImagineEditare.classList.remove("ascuns");
        mesajImagineEditare.textContent = "Poza curentă a anunțului.";
    } else {
        previewImagineEditare.src = "";
        previewImagineEditare.classList.add("ascuns");
        mesajImagineEditare.textContent = "Poți încărca o imagine JPG/PNG de maxim 3 MB.";
    }
    mesajImagineEditare.classList.remove("mesaj-eroare");
}

async function citesteMesajEroare(response) {
    try {
        const data = await response.json();
        return data.mesaj || "A apărut o eroare.";
    } catch (error) {
        return "A apărut o eroare.";
    }
}

async function incarcaAnunt() {
    const idAnunt = citesteIdAnuntDinUrl();
    if (!idAnunt) {
        seteazaMesaj(mesajDetalii, "ID anunț invalid.", "eroare");
        editForm.classList.add("ascuns");
        return;
    }

    const response = await fetch(`/ads/${idAnunt}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            window.location.href = "/index.html";
            return;
        }

        const mesaj = await citesteMesajEroare(response);
        seteazaMesaj(mesajDetalii, mesaj, "eroare");
        editForm.classList.add("ascuns");
        return;
    }

    const ad = await response.json();
    anuntCurent = ad;
    afiseazaDetaliiAnunt(ad);

    if (ad.ownerUsername !== currentUsername) {
        seteazaMesaj(mesajEditare, "Poți modifica doar propriile anunțuri.", "eroare");
        editForm.classList.add("ascuns");
        return;
    }

    editForm.classList.remove("ascuns");
    seteazaMesaj(mesajEditare, "", "");
    precompleteazaFormular(ad);
}

editImagineFisier.addEventListener("change", () => {
    const fisier = editImagineFisier.files[0];

    if (!fisier) {
        if (anuntCurent) {
            precompleteazaFormular(anuntCurent);
        }
        return;
    }

    if (!fisier.type.startsWith("image/")) {
        mesajImagineEditare.textContent = "Te rugăm să alegi doar fișiere imagine.";
        mesajImagineEditare.classList.add("mesaj-eroare");
        editImagineFisier.value = "";
        return;
    }

    if (fisier.size > DIMENSIUNE_MAXIMA_IMAGINE) {
        mesajImagineEditare.textContent = "Imaginea este prea mare. Limita este 3 MB.";
        mesajImagineEditare.classList.add("mesaj-eroare");
        editImagineFisier.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        imagineNouaBase64 = reader.result;
        stergeImaginea = false;
        previewImagineEditare.src = reader.result;
        previewImagineEditare.classList.remove("ascuns");
        mesajImagineEditare.textContent = `Imagine selectată: ${fisier.name}`;
        mesajImagineEditare.classList.remove("mesaj-eroare");
    };
    reader.onerror = () => {
        mesajImagineEditare.textContent = "Nu am putut citi imaginea selectată.";
        mesajImagineEditare.classList.add("mesaj-eroare");
    };
    reader.readAsDataURL(fisier);
});

stergeImagineBtn.addEventListener("click", () => {
    imagineNouaBase64 = null;
    stergeImaginea = true;
    editImagineFisier.value = "";
    previewImagineEditare.src = "";
    previewImagineEditare.classList.add("ascuns");
    mesajImagineEditare.textContent = "Poza va fi ștearsă la salvare.";
    mesajImagineEditare.classList.remove("mesaj-eroare");
});

editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!anuntCurent) {
        return;
    }

    const imagineFinala = stergeImaginea
        ? ""
        : imagineNouaBase64 !== null
            ? imagineNouaBase64
            : anuntCurent.imagineUrl;

    const payload = {
        titlu: editTitlu.value.trim(),
        descriere: editDescriere.value.trim(),
        pret: Number(editPret.value),
        imagineUrl: imagineFinala
    };

    const response = await fetch(`/ads/${anuntCurent.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const mesaj = await citesteMesajEroare(response);
        seteazaMesaj(mesajEditare, mesaj, "eroare");
        return;
    }

    const adActualizat = await response.json();
    anuntCurent = adActualizat;
    afiseazaDetaliiAnunt(adActualizat);
    precompleteazaFormular(adActualizat);
    seteazaMesaj(mesajEditare, "Anunț actualizat cu succes.", "succes");
});

backBtn.addEventListener("click", () => {
    window.location.href = "/index.html";
});

logoutBtnDetalii.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/index.html";
});

if (!esteAutentificat()) {
    window.location.href = "/index.html";
} else {
    incarcaAnunt();
}
