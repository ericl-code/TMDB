var page = 1;
var likedMovies = [];
async function showMovies() {
    document.getElementById("main").style.display = "block";
    document.getElementById("page-control").style.display = "block";
    document.getElementById("backdrop").style.display = "none";

    var response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=25e00b96695a415bf2e3117d518033e6&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_watch_monetization_types=flatrate`)
    var data = await response.json();
    //console.log(data);
    var results = data["results"];
    console.log(results)
    document.getElementById("main").innerHTML = "";
    results.forEach(movie => {
        document.getElementById("main").innerHTML += `<div onmouseover='showLikeButton(event,${movie.id})' id='movie${movie.id}' class='movie-item'>
        <button id='like${movie.id}' class='btn'>Like it</button>
        <img class='imgg' id='image${movie.id}' src='https://image.tmdb.org/t/p/w300${movie.poster_path}' onclick='showDetails(${movie.id})'>
        <p><strong>${movie.title}</strong></p><p>${movie.release_date}</p></div>`;
    });

    document.getElementById("previous").disabled = false;
    document.getElementById("next").disabled = false;
    if (page === 1)
        document.getElementById("previous").disabled = true;
    if (page === 500)
        document.getElementById("next").style.disabled = true;
    document.getElementById("page").innerText = "Page: " + page + " / 500 (10000 results)";
}

async function showNextPage() {
    page = page + 1;
    await showMovies();
}

async function showPreviousPage() {
    page = page - 1;
    await showMovies();
}

async function showDetails(id) {
    document.getElementById("main").style.display = "none";
    document.getElementById("page-control").style.display = "none";
    document.getElementById("backdrop").style.display = "block";
    var response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=25e00b96695a415bf2e3117d518033e6&language=en-US`)
    var data = await response.json();
    //console.log(data);
    document.getElementById("movie-backdrop").innerHTML = `<img id='movie-backdrop-image' src='https://image.tmdb.org/t/p/original${data.backdrop_path}'>`;
    document.getElementById("aux").style.height = document.getElementById('movie-backdrop-image').style.height;
    document.getElementById("movie-image").innerHTML = `<img src='https://image.tmdb.org/t/p/w300${data.poster_path}'>`;
    document.getElementById("movie-title").innerHTML = `<h2>${data.original_title}</h2>`;
    document.getElementById("movie-overview").innerHTML = `<p style='color:white'>Overview:&nbsp;${data.overview}</p>`;
    document.getElementById("movie-genre").innerHTML = "";
    data.genres.forEach(genre => {
        document.getElementById("movie-genre").innerHTML += `<span>${genre.name}</span>`;
    })
    document.getElementById("movie-production").innerHTML = "";
    data.production_companies.forEach(company => {
        document.getElementById("movie-production").innerHTML += `<img src='https://image.tmdb.org/t/p/w200${company.logo_path}' alt='${company.name}'>`;
    })
}

function showLikeButton(event, movieId) {
    document.getElementById('like' + movieId).style.display = "block";
    document.getElementById('like' + movieId).onclick = () => likeMovie(movieId);

    event.target.onmouseout = function () {
        document.getElementById('like' + movieId).style.display = "none";
    }
}

function likeMovie(movieId) {
    if (likedMovies.indexOf(movieId) === -1) {
        likedMovies.push(movieId);
        console.log(likedMovies);
    }
}

function showLikedMovies() {
    document.getElementById("page-control").style.display = "none";
    document.getElementById("main").innerHTML = "<h1>Liked list</h1>";
    likedMovies.forEach(async (id) => {
        var response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=25e00b96695a415bf2e3117d518033e6&language=en-US`)
        var data = await response.json();
        console.log(data);
        document.getElementById("main").innerHTML += `<div class="movie-item"><img src='https://image.tmdb.org/t/p/w300${data.poster_path}'><p>${data.title}</p><p>${data.release_date}</p></div>`;
    })
    document.getElementById("main").innerHTML += "<button id='configBtn' onclick='showConfig()'>CONFIG</button>";
}

function showConfig() {
    document.getElementById("main").innerHTML = "";
    var count = 1;
    likedMovies.forEach(async (id) => {
        var response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=25e00b96695a415bf2e3117d518033e6&language=en-US`)
        var data = await response.json();
        document.getElementById("main").innerHTML += `<div class='placeholder' id='placeholder${count}' ondrop='drop(event)' ondragover='allowDrop(event)'><div draggable='true' ondragstart='drag(event)' class='list-item' id='item${data.id}'>${data.title}</div></div>`;
        count++;
    })
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("item", ev.target.id);
    ev.dataTransfer.setData("from", ev.target.parentNode.id);
    //console.log(ev.target.parentNode.id);
}

function drop(ev) {
    ev.preventDefault();
    var to = ev.target.parentNode.id;
    var item = ev.dataTransfer.getData("item");
    var from = ev.dataTransfer.getData("from");
    //console.log(from+" "+to);
    //console.log(from.substring(11) + " " + to.substring(11));
    var f = parseInt(from.substring(11));
    var t = parseInt(to.substring(11));
    if (f < t) {
        for (var i = f; i < t; i++) {
            //console.log(i);
            document.getElementById('placeholder' + i).appendChild(document.getElementById('placeholder' + (i + 1)).childNodes[0]);
        }
    }
    else if (f > t) {
        for (var i = t; i < f; i++) {
            document.getElementById('placeholder' + (i + 1)).appendChild(document.getElementById('placeholder' + i).childNodes[0]);
        }
    }
    document.getElementById(to).appendChild(document.getElementById(from).childNodes[0]);
    likedMovies.splice(0, likedMovies.length);
    var placeholders = document.getElementsByClassName('placeholder');
    for (var i = 0; i < placeholders.length; i++) {
        likedMovies.push(placeholders[i].childNodes[0].id.substring(4));
    }
}

showMovies();