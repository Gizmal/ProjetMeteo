// site secondaire à explorer https://open-meteo.com/en/docs#api-documentation
//variable de type objet contenant la clé et le lien de l'API météo ( https://openweathermap.org/api )
const meteoApi = {
    cle: '9f23b56e8dcad8299bf4e5a2a3fc932b',
    lien: 'https://api.openweathermap.org/data/2.5/weather',
    lien2: 'https://api.openweathermap.org/data/2.5/forecast'
}
// console.log(`${meteoApi.lien}?appid=${meteoApi.cle}`)

//validateur de saisie
let champSaisie = document.getElementById('zoneSaisie');
champSaisie.addEventListener('keypress', (event) => {
    if (event.code == "Enter" || event.code == "NumpadEnter") {
        // console.log(champSaisie.value);
        bulletinMeteo(champSaisie.value);
        
    }
})


//Donne le bulletin météo de la ville

function bulletinMeteo(ville) {
    const resultat = fetch(`${meteoApi.lien}?q=${ville}&appid=${meteoApi.cle}&units=metric&lang=fr`)  // Retourne un résultat basé sur la ville , les unités de mesure( m /s ) et la langue
    // fetch(`${meteoApi.lien2}?lat=49.3333&lon=3.3333&units=metric&lang=fr&cnt=8&appid=${meteoApi.cle}`) // Pour les prévisions météos
        .then(response=> response.json())  // retourne un objet sous le nom météo et retourne l'objet en format json
        .then(data => {
            // console.log(data)
            const lattitude = data.coord.lat;
            const longitude = data.coord.lon;

            return fetch(`${meteoApi.lien2}?lat=${lattitude}&lon=${longitude}&units=metric&lang=fr&cnt=40&appid=${meteoApi.cle}`);
        })
        .then(meteo => meteo.json())
        .catch(err => {
            swal("Erreur de saisie", "La ville saisie n'a pu être trouvée", "warning");
            reset();
        })
       resultat.then(r => {
            // console.log(r);
            rapportMeteo(r);
       });

}

//Affiche le bulletin météo

function rapportMeteo(meteo) {
    let codeVille=meteo.cod;
    if(codeVille==='400'){ 
        swal("Entrée Invalide", "Veuillez saisir une ville", "error");
        reset();
    }else if(codeVille==='404'){
        swal("Erreur de saisie", "La ville saisie n'a pu être trouvée", "warning");
        reset();
    }
    else{

    // console.log(meteo.cod);
    // console.log(meteo);  
    
    let heureActuelle = new Date();
    // console.log(heureActuelle)
    let parent=document.getElementById('parent');
    let meteoBody = document.getElementById('zoneCentrale');
    meteoBody.innerHTML =
        `
    <div class="lieuCible">
        <div class="ville" id="ville">${meteo.city.name}, ${meteo.city.country}</div>
        <div class="date" id="date"> ${dateDuJour(heureActuelle)}</div>
    </div>
    <div class="etatMeteo">
        <div class="temp" id="temp">${Math.round(meteo.list[0].main.temp)}&deg;C </div>
        <div class="meteo" id="meteo"> ${changeTemps(meteo.list[0].weather[0].main)} <i class="${classeIcone(meteo.list[0].weather[0].main)}"></i>  </div>
        <div class="min-max" id="min-max">${Math.floor(meteo.list[0].main.temp_min)}&deg;C (min) / ${Math.ceil(meteo.list[0].main.temp_max)}&deg;C (max) </div>
        <div id="updated_on">Mise à jour à ${donneHeure(heureActuelle)}</div>
    </div>
    <hr>
    <div class="day-details">
        <div class="basic">Ressenti : ${Math.round(meteo.list[0].main.feels_like)}&deg;C | Humidité : ${meteo.list[0].main.humidity}%  <br> Pression : ${meteo.list[0].main.pressure} hPa | Vent : ${Math.ceil(meteo.list[0].wind.speed*3.6)} km/h</div>
        <div class="prevision">
            <div class="bloc"><p>Dans 3h</p><img src=${previsionHeure((meteo.list[1].weather[0].main),heureActuelle,1)} alt""></div>
            <div class="bloc"><p>Dans 6h</p><img src=${previsionHeure((meteo.list[2].weather[0].main),heureActuelle,2)} alt""></div>
            <div class="bloc"><p>Dans 9h</p><img src=${previsionHeure((meteo.list[3].weather[0].main),heureActuelle,3)} alt""></div>
        </div>
    </div>
        `;
    parent.append(meteoBody);
    changeBg(meteo.list[0].weather[0].main);
    reset();
    }
}


// fonction pour afficher l'heure actuelle

function donneHeure(heureActuelle) {
    let heure =ajoutZero(heureActuelle.getHours());
    let minute =ajoutZero(heureActuelle.getMinutes());
    return `${heure}:${minute}`;
}

// fonction pour retourner la date d'aujourd'hui
function dateDuJour(dateArg) {
    let jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    let moisS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    let annee = dateArg.getFullYear();
    let mois = moisS[dateArg.getMonth()];
    let date = dateArg.getDate();
    let jour = jours[dateArg.getDay()];
    // console.log(annee+" "+date+" "+jour+" "+mois);
    return `${jour} ${date} ${mois} , ${annee}`
}

// fonction pour adapter l'image de fond en fonction de la météo (j'ai pas trouvé de meilleures méthodes que celle-ci ... dsl)
function changeBg(status) {
    let imageFond = '';
    if (status === 'Clouds') {
        imageFond = 'url(img/clouds.jpg)';
    }
    else if (status === 'Rain') {
        imageFond = 'url(img/rainy.jpg)';
    }
    else if (status === 'Clear') {
        imageFond = 'url(img/clear.jpg)';
    }
    else if (status === 'Snow') {
        imageFond = 'url(img/snow.jpg)';
    }
    else if (status === 'Sunny') {
        imageFond = 'url(img/sunny.jpg)';
    }
    else if (status === 'Thunderstorm') {
        imageFond = 'url(img/thunderstrom.jpg)';
    }
    else if (status === 'Drizzle') {
        imageFond = 'url(img/drizzle.jpg)';
    }
    else if (status === 'Mist' || status === 'Haze' || status === 'Fog') {
        imageFond = 'url(img/mist.jpg)';
    }
    else {
        imageFond = 'url(img/bg.jpg)';
    }
    document.body.style.backgroundImage = imageFond;
}

// fonction pour le nom de classe de l'icône
function classeIcone(classarg) {
    if (classarg === 'Rain') {
        return 'fas fa-cloud-showers-heavy';
    } else if (classarg === 'Clouds') {
        return 'fas fa-cloud';
    } else if (classarg === 'Clear') {
        return 'fas fa-cloud-sun';
    } else if (classarg === 'Snow') {
        return 'fas fa-snowman';
    } else if (classarg === 'Sunny') {
        return 'fas fa-sun';
    } else if (classarg === 'Mist') {
        return 'fas fa-smog';
    } else if (classarg === 'Thunderstorm' || classarg === 'Drizzle') {
        return 'fas fa-thunderstorm';
    } else {
        return 'fas fa-cloud-sun';
    }
}

// fonction pour réinitialiser le contenu de la barre de recherche
function reset() {
    let saisie = document.getElementById('zoneSaisie');
    saisie.value = "";
}

// fonction qui ajoute des zeros si l'heure ou les minutes sont inférieures à 10
function ajoutZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

// fonction de traduction en français du temps
function changeTemps(status) {
    if (status === 'Clouds') {
        return 'Nuageux'
    } else if (status === 'Rain') {
        return 'Pluvieux'
    } else if (status === 'Clear') {
        return 'Dégagé'
    } else if (status === 'Snow') {
        return 'Neigeux'
    } else if (status === 'Sunny') {
        return 'Ensoleillé'
    } else if (status === 'Thunderstorm') {
        return 'Orageux'
    } else if (status === 'Drizzle') {
        return 'Légéres pluies'
    } else if (status === 'Mist'|| status === 'Haze' || status === 'Fog' ) {
        return 'Brumeux'
    } else {
        return 'Couvert';
    }
}

function previsionHeure(status,heureActuelle,tranche) {
    let icoPrevision;
    let heure = heureActuelle.getHours()+tranche*3;
    let nuit = '';
    if(heure>24) {
        heure-=24;
    };
    if(heure<8 || heure>20) {
        nuit = 'night'
    }
    // console.log(heure);
    if (status === 'Clouds') {
        icoPrevision = `./img/${nuit}clouds.png`
    } else if (status === 'Rain') {
        icoPrevision = `./img/${nuit}rain.png`   
    } else if (status === 'Clear') {
        icoPrevision = `./img/${nuit}clear.png`
    } else if (status === 'Snow') {
        icoPrevision = `./img/${nuit}snow.png`
    } else if (status === 'Sunny') {
        icoPrevision = `./img/sunny.png`
    } else if (status === 'Thunderstorm') {
        icoPrevision = `./img/${nuit}Thunderstorm.png`
    } else if (status === 'Drizzle') {
        icoPrevision = `./img/${nuit}rain.png`
    } else if (status === 'Mist'|| status === 'Haze' || status === 'Fog' ) {
        icoPrevision = `./img/mist.png`
    } else {
        icoPrevision = `./img/${nuit}clouds.png`
    }
    return icoPrevision
}