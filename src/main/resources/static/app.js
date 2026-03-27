const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const adForm = document.getElementById("adForm");
const adsContainer = document.getElementById("adsContainer");
const mesajGlobal = document.getElementById("mesajGlobal");
const statusAutentificare = document.getElementById("statusAutentificare");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const cardAutentificare = document.getElementById("cardAutentificare");
const cardAnuntNou = document.getElementById("cardAnuntNou");
const cardAnunturi = document.getElementById("cardAnunturi");
const imagineFisierInput = document.getElementById("imagineFisier");
const mesajImagine = document.getElementById("mesajImagine");
const previewImagine = document.getElementById("previewImagine");
const mesajAuth = document.getElementById("mesajAuth");

let token = localStorage.getItem("token") || "";
let currentUsername = localStorage.getItem("username") || "";
let imagineSelectataBase64 = null;

const DIMENSIUNE_MAXIMA_IMAGINE = 3 * 1024 * 1024;
const CURS_EUR_MDL = 20;

function seteazaMesaj(text, tip = "") {
    mesajGlobal.textContent = text;
    mesajGlobal.className = "mesaj-global";

    if (tip === "eroare") {
        mesajGlobal.classList.add("mesaj-eroare");
    }
    if (tip === "succes") {
        mesajGlobal.classList.add("mesaj-succes");
    }
}

function seteazaMesajAuth(text, tip = "") {
    mesajAuth.textContent = text;
    mesajAuth.className = "mesaj-auth";

    if (tip === "eroare") {
        mesajAuth.classList.add("mesaj-eroare");
    }
    if (tip === "succes") {
        mesajAuth.classList.add("mesaj-succes");
    }
}

function actualizeazaStatusAutentificare() {
    const esteLogat = Boolean(token && currentUsername);

    if (esteLogat) {
        statusAutentificare.textContent = `Ești autentificat ca ${currentUsername}.`;
    } else {
        statusAutentificare.textContent = "Nu ești autentificat.";
    }

    actualizeazaVizibilitateContinutPrivat(esteLogat);
}

function actualizeazaVizibilitateContinutPrivat(esteLogat) {
    cardAutentificare.classList.toggle("ascuns", esteLogat);
    cardAnuntNou.classList.toggle("ascuns", !esteLogat);
    cardAnunturi.classList.toggle("ascuns", !esteLogat);
    logoutBtn.classList.toggle("ascuns", !esteLogat);

    if (!esteLogat) {
        seteazaMesaj("", "");
        adsContainer.innerHTML = "";
    }
}

function salveazaAutentificare(tokenNou, usernameNou) {
    token = tokenNou;
    currentUsername = usernameNou;

    localStorage.setItem("token", tokenNou);
    localStorage.setItem("username", usernameNou);

    actualizeazaStatusAutentificare();
}

function curataAutentificare() {
    token = "";
    currentUsername = "";

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    actualizeazaStatusAutentificare();
}

function reseteazaImagineSelectata() {
    imagineSelectataBase64 = null;
    imagineFisierInput.value = "";
    previewImagine.src = "";
    previewImagine.classList.add("ascuns");
    mesajImagine.textContent = "Poți încărca o imagine JPG/PNG de maxim 3 MB.";
    mesajImagine.classList.remove("mesaj-eroare");
}

function formatPretCuMdl(pret) {
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

async function citesteMesajEroare(response) {
    try {
        const data = await response.json();
        return data.mesaj || "A apărut o eroare.";
    } catch (error) {
        return "A apărut o eroare.";
    }
}

async function incarcaAnunturi() {
    if (!(token && currentUsername)) {
        adsContainer.innerHTML = "";
        return;
    }

    const response = await fetch("/ads", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            curataAutentificare();
            adsContainer.innerHTML = "";
            seteazaMesajAuth("Sesiune invalidă. Reautentifică-te.", "eroare");
            return;
        }

        const mesaj = await citesteMesajEroare(response);
        seteazaMesaj(mesaj, "eroare");
        return;
    }

    const ads = await response.json();
    const anunturiMele = ads.filter((ad) => ad.ownerUsername === currentUsername);
    afiseazaAnunturi(anunturiMele);
}

function afiseazaAnunturi(ads) {
    adsContainer.innerHTML = "";

    if (!ads.length) {
        adsContainer.innerHTML = "<p class='text-gri'>Nu ai anunțuri publicate încă.</p>";
        return;
    }

    ads.forEach((ad) => {
        const card = document.createElement("article");
        card.className = "ad-card";

        const imagine = ad.imagineUrl
            ? `<img class="ad-imagine" src="${ad.imagineUrl}" alt="${ad.titlu}" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">`
            : "";

        const placeholderStyle = ad.imagineUrl ? "style='display:none'" : "";
        const placeholder = `<div class="ad-placeholder" ${placeholderStyle}>Fără imagine</div>`;

        const pretFormatat = formatPretCuMdl(ad.pret);

        const butonDelete = ad.ownerUsername === currentUsername
            ? `<button class="btn-delete" data-id="${ad.id}">Șterge</button>`
            : "";

        const butonDetalii = `<button class="btn-detalii" data-id="${ad.id}">Detalii / Editare</button>`;

        card.innerHTML = `
            ${imagine}
            ${placeholder}
            <div class="ad-body">
                <h3>${ad.titlu}</h3>
                <p class="ad-descriere">${ad.descriere}</p>
                <p class="ad-pret">${pretFormatat}</p>
                <p class="ad-owner">Publicat de: ${ad.ownerUsername}</p>
                <div class="actiuni-anunt">
                    ${butonDetalii}
                    ${butonDelete}
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            mergiLaDetaliiAnunt(ad.id);
        });

        adsContainer.appendChild(card);
    });

    document.querySelectorAll(".btn-detalii").forEach((btn) => {
        btn.addEventListener("click", (event) => {
            event.stopPropagation();
            const id = btn.getAttribute("data-id");
            mergiLaDetaliiAnunt(id);
        });
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async (event) => {
            event.stopPropagation();
            const id = btn.getAttribute("data-id");
            await stergeAnunt(id);
        });
    });
}

function mergiLaDetaliiAnunt(id) {
    window.location.href = `/ad.html?id=${id}`;
}

async function stergeAnunt(id) {
    if (!(token && currentUsername)) {
        seteazaMesaj("Trebuie să fii autentificat pentru această acțiune.", "eroare");
        return;
    }

    const response = await fetch(`/ads/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const mesaj = await citesteMesajEroare(response);
        seteazaMesaj(mesaj, "eroare");
        return;
    }

    seteazaMesaj("Anunț șters cu succes.", "succes");
    await incarcaAnunturi();
}

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    seteazaMesajAuth("");

    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;

    const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        const mesaj = await citesteMesajEroare(response);
        seteazaMesajAuth(mesaj, "eroare");
        return;
    }

    registerForm.reset();
    seteazaMesajAuth("Contul a fost creat. Acum te poți autentifica.", "succes");
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    seteazaMesajAuth("");

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        if (response.status === 401) {
            seteazaMesajAuth("parola gresita", "eroare");
            return;
        }

        const mesaj = await citesteMesajEroare(response);
        seteazaMesajAuth(mesaj, "eroare");
        return;
    }

    const data = await response.json();
    salveazaAutentificare(data.token, data.username);

    loginForm.reset();
    seteazaMesajAuth("");
    seteazaMesaj("Autentificare realizată cu succes.", "succes");
    await incarcaAnunturi();
});

imagineFisierInput.addEventListener("change", () => {
    const fisier = imagineFisierInput.files[0];

    if (!fisier) {
        reseteazaImagineSelectata();
        return;
    }

    if (!fisier.type.startsWith("image/")) {
        reseteazaImagineSelectata();
        mesajImagine.textContent = "Te rugăm să alegi doar fișiere imagine.";
        mesajImagine.classList.add("mesaj-eroare");
        return;
    }

    if (fisier.size > DIMENSIUNE_MAXIMA_IMAGINE) {
        reseteazaImagineSelectata();
        mesajImagine.textContent = "Imaginea este prea mare. Limita este 3 MB.";
        mesajImagine.classList.add("mesaj-eroare");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        imagineSelectataBase64 = reader.result;
        previewImagine.src = reader.result;
        previewImagine.classList.remove("ascuns");
        mesajImagine.textContent = `Imagine selectată: ${fisier.name}`;
        mesajImagine.classList.remove("mesaj-eroare");
    };

    reader.onerror = () => {
        reseteazaImagineSelectata();
        mesajImagine.textContent = "Nu am putut citi imaginea selectată.";
        mesajImagine.classList.add("mesaj-eroare");
    };

    reader.readAsDataURL(fisier);
});

adForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!(token && currentUsername)) {
        seteazaMesaj("Autentifică-te înainte să publici un anunț.", "eroare");
        return;
    }

    const titlu = document.getElementById("titlu").value.trim();
    const descriere = document.getElementById("descriere").value.trim();
    const pret = Number(document.getElementById("pret").value);

    const payload = {
        titlu,
        descriere,
        pret,
        imagineUrl: imagineSelectataBase64
    };

    const response = await fetch("/ads", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const mesaj = await citesteMesajEroare(response);
        seteazaMesaj(mesaj, "eroare");
        return;
    }

    adForm.reset();
    reseteazaImagineSelectata();
    seteazaMesaj("Anunț publicat cu succes.", "succes");
    await incarcaAnunturi();
});

logoutBtn.addEventListener("click", () => {
    curataAutentificare();
    adsContainer.innerHTML = "";
    reseteazaImagineSelectata();
    seteazaMesajAuth("Te-ai delogat.", "succes");
});

refreshBtn.addEventListener("click", async () => {
    await incarcaAnunturi();
});

actualizeazaStatusAutentificare();
reseteazaImagineSelectata();
incarcaAnunturi();
