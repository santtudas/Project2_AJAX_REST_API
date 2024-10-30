let xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "https://www.finnkino.fi/xml/Schedule/", true);
xmlhttp.send();

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        let xmlDoc = xmlhttp.responseXML;
        populateTheaterDropdown(xmlDoc); // Populate dropdown on load
        displayMovies(xmlDoc, ""); // Display all movies initially (no filter)
        
        // Add event listener to filter movies based on dropdown selection
        document.querySelector("#theatreSelect").addEventListener("change", function() {
            displayMovies(xmlDoc, this.value); // Filter movies based on selected theater
        });
    }
};

// Step 1: Populate the Theater Dropdown with unique theater names
function populateTheaterDropdown(xmlDoc) {
    let theaterSelect = document.querySelector("#theatreSelect");
    let theaters = new Set(); // Use a Set to store unique theater names

    // Loop through each show and collect unique theater names
    let movies = xmlDoc.getElementsByTagName("Show");
    for (let i = 0; i < movies.length; i++) {
        let theaterName = movies[i].getElementsByTagName("Theatre")[0].textContent;
        theaters.add(theaterName);
    }

    // Add each unique theater name as an option in the dropdown
    theaters.forEach(theater => {
        let option = document.createElement("option");
        option.value = theater;
        option.textContent = theater;
        theaterSelect.appendChild(option);
    });
}

// Step 2: Display Movies based on selected theater (or all if no filter)
function displayMovies(xmlDoc, selectedTheater) {
    let movieContainer = document.querySelector("#movieContainer");
    movieContainer.innerHTML = ""; // Clear previous content

    let movies = xmlDoc.getElementsByTagName("Show");

    for (let i = 0; i < movies.length; i++) {
        let show = movies[i];
        let title = show.getElementsByTagName("Title")[0].textContent;
        let theater = show.getElementsByTagName("Theatre")[0].textContent;
        let showtime = show.getElementsByTagName("dttmShowStart")[0].textContent;
        let duration = show.getElementsByTagName("LengthInMinutes")[0].textContent;
        let rating = show.getElementsByTagName("Rating")[0].textContent;
        let imageUrl = show.getElementsByTagName("EventSmallImagePortrait")[0].textContent;
        let ratingImg = show.getElementsByTagName("RatingImageUrl")[0].textContent;
        let formattedShowtime = formatShowtime(showtime);

        // Filter: Display only movies matching the selected theater, or all if no filter
        if (!selectedTheater || selectedTheater === theater) {
            let movieDiv = document.createElement("div");
            movieDiv.classList.add("movie");

            // Create the inner HTML structure
            movieDiv.innerHTML = `
                <img src="${imageUrl}" alt="Movie Poster" class="moviePoster">
                <h4>${title}</h4>
                <p><strong>Theater:</strong> ${theater}</p>
                <p><strong>Showtime:</strong> ${formattedShowtime}</p>
                <p><strong>Duration:</strong> ${duration} minutes</p>
                <img src="${ratingImg}" alt="${rating}" class="ageRating">
                <hr>
            `;

            movieContainer.appendChild(movieDiv);
        }
    }
}

function formatShowtime(showtime) {
    let date = new Date(showtime);
    
    // Extract date components
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    let year = date.getFullYear();

    // Extract time components
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    // Combine into the desired format
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}
