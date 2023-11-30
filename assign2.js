/*
  file: assign2.js
  names: Ben Cacic, Mohammed Arab
  class: Comp 3612
  
  description: Contains all of the javascript for assignment 2. 
  */

const api = 'https://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php';
const artists = 'artists.json';
const genres = 'genres.json';

const container = document.querySelector(".container");
const songInfoContainer = document.getElementById('songInfo');

document.addEventListener('DOMContentLoaded', function() {
  const searchButton = document.getElementById("searchButton");
  const homeButton = document.getElementById("homeButton");
  const playlistButton = document.getElementById("playlistButton");
  const filterButton = document.getElementById("filterButton");
  const clearButton = document.getElementById("clearButton");
  const creditsButton = document.getElementById("creditsButton");
  const clearPlaylistButton = document.getElementById('clearPlaylist');
  const searchSelection = document.querySelectorAll('input[name="filter"]');
  const creditsPopup = document.getElementById("creditsPopup");

  const homePage = document.getElementById("homePage");
  const songPage = document.getElementById("songPage");
  const playlistPage = document.getElementById("playlistPage");
  const searchPage = document.getElementById("searchPage");

  const genrePick = document.getElementById("genrePick");
  const artistPick = document.getElementById("artistPick");
  const songsData = localStorage.getItem('songs');

  let fetchedGenres = [];
  let fetchedArtists = [];

  // Check if the song data is being stored locally. If it is not, retrieve it from the API.
  if (!songsData) {
    fetchDataAndStoreInLocalStorage();
  }
  // Perform the fetch and populate the fetchedArtists array
    fetch(artists)
    .then(response => response.json())
    .then(artistsObject => {
      fetchedArtists = artistsObject.map(artist => ({
        id: artist.id,
        name: artist.name,
        type: artist.type
      }));
      
      // This holds the artist selected by the user 
      const artistPick = document.getElementById('artistPick');

      // Add all of the artists to the drop down menu on the search page
      artistsObject.forEach(artist => {
        const option = document.createElement('option');
        option.value = artist.id;
        option.text = artist.name;
        artistPick.appendChild(option);
      });
     });

// Perform the fetch and populate the fetchedGenres array
fetch(genres)
.then(response => response.json())
.then(genresObject => {
  fetchedGenres = genresObject.map(genre => ({
    id: genre.id,
    name: genre.name
  }));

  // This is the selected genre by the user
  const genrePick = document.getElementById('genrePick');

  // Add each genre to the drop down menu on the search page
  fetchedGenres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre.id;
    option.text = genre.name;
    genrePick.appendChild(option);
  });
});

    // parse through the fetched api
    const songObject = JSON.parse(songsData);

    // Retrieve the order that each song, artist, and genre should be displayed
    // in on the home page.
    const genreOccurrences = countGenres(songObject);
    const artistOccurrences = countArtists(songObject);
    const highestPopularity = songPopularity(songObject);

    // Display the home page with top genres, top artists, and most popular songs
    populateDOMWithTopGenres(genreOccurrences);
    populateDOMWithTopArtists(artistOccurrences); 
    populateDOMWithTopSongs(highestPopularity);

    // Default display on the search page (ordered alphabetically by title)
    newListSongsinSearch(songObject, "title", 0, 0);
  
// This function returns the occurence of each genre     
function countGenres(songData) {
   const genreCount = {};
   
   songData.forEach(song => {
     const genreName = song.genre.name;
     if (genreCount[genreName]) {
       genreCount[genreName]++;
     } else {
       genreCount[genreName] = 1;
     }
   });
   
   return genreCount;
 }
 // This function returns the amount of times an artist appears in the provided api
 function countArtists(songData) {
   const artistsCount = {};
   
   songData.forEach(song => {
     const artistName = song.artist.name; 
     
     if (artistsCount[artistName]) {
      artistsCount[artistName]++;

     } else {
      artistsCount[artistName] = 1;
     }
   });
   
   return artistsCount;
 }

 // Returns an array that contains the popularity of each song
 function songPopularity(songData) {
   const songPop = {};
   
   songData.forEach(song => {
     const songName = song.title; 
     songPop[songName] = song.details.popularity;
   });
   return songPop;
 }

// Display top 15 genres on home page.
function populateDOMWithTopGenres(genreOccurrences) {
   const rowSearch = document.querySelector("#topGenres");
   // Sort genres by their occurrence in descending order
   const sortedGenres = Object.keys(genreOccurrences).sort((a, b) => genreOccurrences[b] - genreOccurrences[a]);
 
   // Set up the top 15 genres to be displayed
   sortedGenres.slice(0, 15).forEach(genreName => {
     const genreLink = document.createElement("a");
     genreLink.textContent = `${genreName}`;
     genreLink.href = "#";
 
     // Link the genres on the home page to the search page.
     // Upon arriving at the search page, the filters will be
     // applied with the selected genre, and the genre radio 
     // button option selected.
      genreLink.addEventListener("click", function(event) {
        event.preventDefault();
        const genreId = findGenreId(genreName);
        navigateGenreSongsPage(genreId);
        document.getElementById('artistPick').selectedIndex = 0;
      });
 
      // Display the genres on home page.
     const genreList = document.createElement("li");
     genreList.appendChild(genreLink);
     rowSearch.appendChild(genreList);
   });
 }
 
 // Called by populateDomWithTopGenres to 
 // retrieve id for a clicked genre.
 function findGenreId(genreName) {
  const foundGenre = fetchedGenres.find(genre => genre.name === genreName);
  if (foundGenre) {
    return foundGenre.id;
  } else {
    return null;
  }
}

// Responsible for updating the listed songs on 
// the search page after a particular genre 
// is selected on the home page.
function navigateGenreSongsPage(genreId) {
  searchPage.style.display = "flex";
  homePage.style.display = "none";
  songPage.style.display = "none";

 document.getElementById('Genre').checked = true; 

 // Retrieve the genre selected by the user on the home 
 // page. 
 const genrePick = document.getElementById('genrePick');
 const selectedOption = Array.from(genrePick.options).find(option => parseInt(option.value) === genreId);
  if (selectedOption) {
    selectedOption.selected = true;
    //Perform filtering based on the selected genre. Radio value: 3 
    let choice = 3; 
    updateTable( 'title', titleButton, 0, genreId, choice);
  }  
}

// Display top 15 artists on home page.
function populateDOMWithTopArtists(artistOccurrences) {
  songPage.style.display = "none";

  const artistSearch = document.querySelector("#topArtists");
  
  // Sort artists by their occurrence count in descending order
  const sortedArtists = Object.keys(artistOccurrences).sort((a, b) => artistOccurrences[b] - artistOccurrences[a]);

  // Display the top 15 artists
  sortedArtists.slice(0, 15).forEach(artistName => {
    const artistLink = document.createElement("a");
   artistLink.textContent = `${artistName}`;
    artistLink.href = "#";

    // Link the artist on the home page to the search page.
    // Upon arriving at the search page, the filters will be
    // applied with the selected artist, and the artist radio 
    // button selected.
    artistLink.addEventListener("click", function(event) {
      event.preventDefault();
      const artistId = findArtistId(artistName);
      navigateArtistSongsPage(artistId);
       // Reset genre selects to default
      document.getElementById('genrePick').selectedIndex = 0;
    });

    const artistList = document.createElement("li");
  
    // display top 15 artists on home page with link
    artistList.appendChild(artistLink);
    artistSearch.appendChild(artistList);
  });
}

// Called by populateDomWithTopArtists to 
// retrieve id for a clicked artist.
function findArtistId(artistName) {
  const foundArtist = fetchedArtists.find(artist => artist.name === artistName);
  if (foundArtist) {
    return foundArtist.id;
  } else {
    return null;
  }
}

// Passed a chosen artist id from the populateDomWithTopArtists 
// function. Will provide filtering based on the provided 
// id.
function navigateArtistSongsPage(artistId) {
  searchPage.style.display = "flex";
  homePage.style.display = "none";
  songPage.style.display = "none"

 document.getElementById('Artist').checked = true;

 // Set the selected genre ID in the genre pick select element
 const artistPick = document.getElementById('artistPick');
 const selectedOption = Array.from(artistPick.options).find(option => parseInt(option.value) === artistId);
  if (selectedOption) {
    selectedOption.selected = true;
    //Perform filtering based on the selected artist
    let choice = 2;
  
    updateTable('title', titleButton, 0, artistId, choice);
  }  
}

// Will display the songs visible on the home page.
 function populateDOMWithTopSongs( songPopularity) {
   const songSearch = document.querySelector("#topSongs");
   // Sort songs by their occurrence count in descending order
   const sortedSongs = Object.keys(songPopularity).sort((a, b) => songPopularity[b] - songPopularity[a]);
 
   sortedSongs.slice(0, 15).forEach(songName => {
     const songLink = document.createElement("a");
     songLink.textContent = `${songName}`;
     songLink.href = "#";
 
    // Provide a link over the song title to navigate to the
    // specific single song page view. 
     songLink.addEventListener("click", function(event) {
       event.preventDefault();
       navigateToSongPage(songName);
     });
 
     // Display the top songs
     const songList = document.createElement("li");
     songList.appendChild(songLink);
     songSearch.appendChild(songList);
   });
 }

 // needs to be initialized to null outside of the 
 // function in order for new songs' graphs to display
 // properly.
 let activeSpiderChart = null;

 function navigateToSongPage(songName) {
  searchPage.style.display = "none";
  homePage.style.display = "none";
  songPage.style.display = "block";

  songObject.forEach (song => {
    if(song.title === songName) {
      document.getElementById('title').innerText = song.title;
      document.getElementById('artist').innerText = song.artist.name;

      for (let artist of fetchedArtists) {
        if(song.artist.id === artist.id) {
          document.getElementById('artistType').innerText = artist.type;
        }
      }
      document.getElementById('genre').innerText = song.genre.name;
      document.getElementById('releaseYear').innerText = song.year;
      document.getElementById('bpm').innerText = song.details.bpm;
      
      // Convert from total seconds to mm:ss format
      let duration = song.details.duration;
      let formattedDuration = new Date(duration * 1000).toISOString().substr(14, 5);      

      document.getElementById('duration').innerText = formattedDuration;

      // If a song has already been clicked creating the chart, it needs to be 
      // reset here to later on fill the data for the most recent song clicked.
      if (activeSpiderChart !== null) {
        activeSpiderChart.destroy();
      }

      let ctx = document.getElementById('spiderChart').getContext('2d');

      let radarData = {
        labels: ['Danceability', 'Energy', 'Speechiness', 'Acousticness', 'Liveness', 'Valence'],
        datasets: [{
          label: 'Song Details',
          data: [song.analytics.danceability, song.analytics.energy, song.analytics.speechiness, song.analytics.acousticness, song.analytics.liveness, song.analytics.valence],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 4,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
        }]
      };
      let chartOptions = {
        scales: {
          r: {
            min: 0,
            max: 100,
          }
        }
      };
       activeSpiderChart = new Chart(ctx, {
        type: 'radar',
        data: radarData,
        options: chartOptions
      });
    }
  });
}

 function homeClick() {
     searchPage.style.display = "none"
     homePage.style.display = "block"
     songPage.style.display = "none" 
     playlistPage.style.display = "none";
  }

 function searchClick() {
     searchPage.style.display = "flex";
     homePage.style.display = "none";
     songPage.style.display = "none";
     playlistPage.style.display = "none";
     clearClick();
   // Get the radio button by its ID and set it to checked
    const titleRadio = document.getElementById('Title');
    if (titleRadio) {
      titleRadio.checked = true;
    }
  }

  function playlistClick() {
    searchPage.style.display = "none";
    homePage.style.display = "none";
    songPage.style.display = "none";
    playlistPage.style.display = "block";
  }

  function clearClick() {
    let threadBodySelector = document.querySelector("#listSongs");
    threadBodySelector.innerHTML = '';
        
  newListSongsinSearch(songObject, "title", 0, 0);

  const radioButtons = document.querySelectorAll('input[type="radio"]');
  //unncheck each radio button
  radioButtons.forEach(radioButton => {
  
    radioButton.checked = false;
  });
    document.getElementById('artistPick').selectedIndex = 0;
    document.getElementById('genrePick').selectedIndex = 0;
    document.getElementById('search').value = '';
    document.getElementById('search').placeholder = 'Type here';
  }


// event listeners for the various buttons 
 searchButton.addEventListener("click", searchClick);
 homeButton.addEventListener("click", homeClick);
 clearButton.addEventListener("click", clearClick);
 playlistButton.addEventListener("click",playlistClick);

const addedPlaylistSongs = [];

function newListSongsinSearch(songData, property, id, choice) {
  const tbodySelector = document.querySelector("#listSongs");
  const filteredSongs = [];
  const playListSongs = [];

  if (choice === 1) {
    // Perform operations for search by text. Includes lower case input matching
    const searchTerm = document.getElementById('search').value.toLowerCase();
    songData.forEach(song => {
      // Check lowercase for search
      if (song.title.toLowerCase().includes(searchTerm)) {
        filteredSongs.push(song);
        playListSongs.push(song);
      }
    });
  } else if (choice === 2) {
    // Filter songs based on artist selection
    songData.forEach(song => {
      if (id === song.artist.id) {
        filteredSongs.push(song); 
        playListSongs.push(song);
      }
    });
  } else if (choice === 3) {
    // Filter songs by genre
    songData.forEach(song => {
      if (id === song.genre.id) {
        filteredSongs.push(song);
        playListSongs.push(song);
      }
    });
  }
  else{
    // No choice selected - default
    songData.forEach(song => {
        filteredSongs.push(song); 
        playListSongs.push(song);
      });
  }

  // Triangle sort selectors.
  if (property === 'title'){
    filteredSongs.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  } else if (property === 'artist'){
    filteredSongs.sort((a, b) => a.artist.name.localeCompare(b.artist.name, undefined, { sensitivity: 'base' }));
  }
  else if (property === 'year') {
    filteredSongs.sort((a, b) => a.year - b.year);
  }
  else if (property === 'genre'){
    filteredSongs.sort((a, b) => a.genre.name.localeCompare(b.genre.name, undefined, { sensitivity: 'base' }));
  }else if (property === 'popularity'){
    filteredSongs.sort((a, b) => a.details.popularity - b.details.popularity);
  } 

  filteredSongs.forEach(song => {
    const createTableRow = document.createElement("tr");
    const createTitleData = document.createElement("td");
    const titleLink = document.createElement("a");

    // handles title when it is greater than 15
    const truncatedTitle = song.title.length > 25 ? `${song.title.slice(0, 24)}...` : song.title;
    titleLink.textContent = truncatedTitle;
    titleLink.href = "#";
    titleLink.addEventListener("click", function(event) {
      event.preventDefault();
      navigateToSongPage(song.title);
    });
    createTitleData.appendChild(titleLink);

    function displayFullTitle() {
      const fullTitlePopup = document.createElement("div");
      fullTitlePopup.textContent = song.title;
      fullTitlePopup.classList.add('popuptext');

      document.body.appendChild(fullTitlePopup);

      fullTitlePopup.style.visibility = 'visible';

      setTimeout(() => {
        fullTitlePopup.style.visibility = 'hidden';
        setTimeout(() => {
          fullTitlePopup.remove();
        }, 1000);
      }, 5000);
    }

    // Displays a popup of the full song title when it is hovered over
    // and the title is longer than 25 characters
    if (song.title.length > 25) {
      createTitleData.addEventListener('mouseover', displayFullTitle);
    }

    const createArtistData = document.createElement("td");
    createArtistData.textContent = song.artist.name;

    const createYearData = document.createElement("td");
    createYearData.textContent = song.year;

    const createGenreData = document.createElement("td");
    createGenreData.textContent = song.genre.name;

    const createPopularityData = document.createElement("td");
    createPopularityData.textContent = song.details.popularity;

    createTableRow.appendChild(createTitleData);
    createTableRow.appendChild(createArtistData);
    createTableRow.appendChild(createYearData);
    createTableRow.appendChild(createGenreData);
    createTableRow.appendChild(createPopularityData);

    tbodySelector.appendChild(createTableRow);
  });

const addPlaylistButton = document.getElementById('addPlaylist');
const songDropdownPopup = document.getElementById('songDropdownPopup');
const songDropdown = document.getElementById('songDropdown');
const removeDropdown = document.getElementById('songDropdownRemove');
const songDropdownPopupRemove = document.getElementById('songDropdownPopupRemove');
const playlistTableBody = document.getElementById('playListSongs');

function openSongDropdown() {
  createSongDropdown();
  songDropdownPopup.style.display = 'block';
  document.addEventListener('click', closeDropdownOutside);
}

function closeSongDropdown() {
  songDropdownPopup.style.display = 'none';
  document.removeEventListener('click', closeDropdownOutside);
}

function closeDropdownOutside(event) {
  if (!songDropdownPopup.contains(event.target)) {
    closeSongDropdown();
  }
}

function openSongDropdownRemove() {
  createRemoveDropdown();
  songDropdownPopupRemove.style.display = 'block';
  document.addEventListener('click', closeDropdownOutsideRemove);
}

function closeSongDropdownRemove() {
  songDropdownPopupRemove.style.display = 'none';
  document.removeEventListener('click', closeDropdownOutsideRemove);
}

function closeDropdownOutsideRemove(event) {
  if (!songDropdownPopupRemove.contains(event.target)) {
    closeSongDropdownRemove();
  }
}

let songItemsMap = {};
function createSongDropdown() {
  // Sort the songs by title in playlist array
  playListSongs.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

  // Clear previous dropdown items
  songDropdown.innerHTML = '';
  // Create and append dropdown items for each song title
  playListSongs.forEach(song => {
    const songItem = document.createElement('div');
    songItem.textContent = song.title;
    songItem.classList.add('song-item');

    songItem.addEventListener('click', function() {
      const isSongAdded = addedPlaylistSongs.some(addedSong => addedSong.song_id === song.song_id);
      if (!isSongAdded) {
        addedPlaylistSongs.push(song);
        addToPlaylist(song);

        const selectedItem = songItemsMap[song.song_id];
        if (selectedItem && selectedItem.parentElement) {
          selectedItem.parentElement.removeChild(selectedItem);
        }

        closeSongDropdown();
      } else {
        console.log("Song already added to the playlist.");
      }
    });

    songDropdown.appendChild(songItem);
    songItemsMap[song.song_id] = songItem;
  });

  clearPlaylistButton.addEventListener('click', function() {
    // all playlist data holding arrays are set to 0. 
    // the textcontent on the playlist page will also manually 
    // be cleared here.
    playListSongs.length = 0;
    addedPlaylistSongs.length = 0;
    addToPlaylist.length = 0;
    document.getElementById('numberOfSongs').textContent = 0;

    while(playlistTableBody.firstChild) {
      playlistTableBody.removeChild(playlistTableBody.firstChild);
    }
  });
}

function createRemoveDropdown() {
  removeDropdown.innerHTML = '';

  // Create and append dropdown items for each song in addedPlaylistSongs
  addedPlaylistSongs.forEach(song => {
    const removeItem = document.createElement('div');
    removeItem.textContent = song.title;
    removeItem.classList.add('song-item');

    removeItem.addEventListener('click', function() {
      const songIndex = addedPlaylistSongs.findIndex(addedSong => addedSong.song_id === song.song_id);
      if (songIndex !== -1) {
        addedPlaylistSongs.splice(songIndex, 1); 
        removeItem.remove();
        removeSongFromPlaylist(song);
      }
    });

    removeDropdown.appendChild(removeItem);
  });
}

function removeSongFromPlaylist(song) {
  const rows = document.getElementById('playListSongs').querySelectorAll('tr');
  // Clear out all rows of data for a particular song when it is removed from
  // the playlist.
  rows.forEach(row => {
    if (row.firstChild.textContent === song.title) {
      row.remove();
      document.getElementById('numberOfSongs').textContent = ` ${rows.length - 1} Songs`;
    }
  });
}

const removePlaylistButton = document.getElementById('removePlaylist');
removePlaylistButton.addEventListener('click', function(event) {
  event.stopPropagation(); 
  openSongDropdownRemove(); 
});

addPlaylistButton.addEventListener('click', function(event) {
  event.stopPropagation(); 
  openSongDropdown(); 
});
}

function addToPlaylist(song) {  
    const link = document.createElement("a");
    link.textContent = `${song.title}`;
    link.href = "#";

    link.addEventListener("click", function(event) {
      event.preventDefault();
      navigateToSongPage(song.title);
    });

    const playlistTableBody = document.getElementById('playListSongs'); 
   const createRow = document.createElement('tr');

   const createTitleData = document.createElement('td');
   createTitleData.appendChild(link);
 
   const createArtistData = document.createElement('td');
   createArtistData.textContent = song.artist.name;
 
   const createYearData = document.createElement('td');
   createYearData.textContent = song.year;
 
   const createGenreData = document.createElement('td');
   createGenreData.textContent = song.genre.name;
 
   const createPopularityData = document.createElement('td');
   createPopularityData.textContent = song.details.popularity;
 
   createRow.appendChild(createTitleData);
   createRow.appendChild(createArtistData);
   createRow.appendChild(createYearData);
   createRow.appendChild(createGenreData);
   createRow.appendChild(createPopularityData);
 
   playlistTableBody.appendChild(createRow);
   document.getElementById('numberOfSongs').textContent = ` ${playlistTableBody.children.length} Songs`;
 }

creditsButton.addEventListener('mouseover', function () {
  creditsPopup.style.display = 'block';
  
  // pop up timer set to close pop up after 5 seconds
  setTimeout(function () {
    creditsPopup.style.display = 'none';
  }, 5000);
});

function updateTable( property, buttonElement,x ,id, choice) {
  const tbodySelector = document.querySelector("#listSongs");
  while (tbodySelector.firstChild) {
    tbodySelector.removeChild(tbodySelector.firstChild);
  }

  if(x===1){
  newListSongsinSearch(songObject, property, 0, 0);
  }else{
    newListSongsinSearch(songObject, property, id, choice);
  }
  const sortingButtons = document.querySelectorAll('.sortingButton');
  sortingButtons.forEach(button => {

    button.innerHTML = '<img src="triangle.webp" class="triangle" alt="triangle">';
    button.classList.remove('sortingButton'); 
  });

 const imgElement = buttonElement.querySelector('img');
  if (imgElement) {
    imgElement.src = 'flipped.png';
    imgElement.alt = 'flip';
  }
  buttonElement.classList.add('sortingButton');
}

  const titleButton = document.querySelector('.titlePadding button');
  const artistButton = document.querySelector('.artistPadding button');
  const yearButton = document.querySelector('.yearPadding button');
  const genreButton = document.querySelector('.genrePadding button');
  const popularityButton = document.querySelector('.popularityPadding button');

  titleButton.addEventListener('click', () => {
   const x = 1;
    updateTable('title', titleButton, x);
  });

  artistButton.addEventListener('click', () => {
    const x = 1;
    updateTable('artist', artistButton, x);
    
    titleButton.innerHTML = '<img src="triangle.webp" class="triangle" alt="triangle">';
  });

  yearButton.addEventListener('click', () => {
    const x = 1;
    updateTable('year', yearButton, x);
    titleButton.innerHTML = '<img src="triangle.webp" class="triangle" alt="triangle">';
  });

  genreButton.addEventListener('click', () => {
    const x = 1;
    updateTable('genre', genreButton, x);
    titleButton.innerHTML = '<img src="triangle.webp" class="triangle" alt="triangle">';
  });

  popularityButton.addEventListener('click', () => {
    const x = 1;
    updateTable('popularity', popularityButton, x);
    titleButton.innerHTML = '<img src="triangle.webp" class="triangle" alt="triangle">';
  });

  filterButton.addEventListener("click", function() {
    let choice;
    searchSelection.forEach(function(radioButton) {
      if (radioButton.checked) {
        choice = parseInt(radioButton.value);
      }
    });
  
    let id = 0;
    if (choice === 2) {
      id = parseInt(artistPick.value);
    } else if (choice === 3) {
      id = parseInt(genrePick.value);
    }
      
    const tbodySelector = document.querySelector("#listSongs");
    tbodySelector.innerHTML = '';

    newListSongsinSearch(songObject, 'title', id, choice); 
  });
  });

// Function to fetch data from API and handle local storage
function fetchDataAndStoreInLocalStorage() {
   fetch(api)
     .then((response) => {
       if (response.ok) {
         return response.json();
       } else {
         throw new Error("API not Fetched");
       }
     })
     .then(data => {
       const jsonString = JSON.stringify(data);
        localStorage.setItem('songs', jsonString);
     })
     .catch(error => {
       console.error('Error fetching data:', error);
     });
 }
