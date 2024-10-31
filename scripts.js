let area = "1014";
let nrOfDays = 6;

let url = `https://www.finnkino.fi/xml/Schedule/?area=${area}&nrOfDays=${nrOfDays}`;

let xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", url, true);
xmlhttp.send();

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        let xmlDoc = xmlhttp.responseXML;
        populateTheaterDropdown(xmlDoc);
        populateDateDropdown(xmlDoc);
        displayMovies(xmlDoc, ""); // Display all movies on load

        // Add event listeners to dropdowns for filterring 
        document.querySelector("#theatreSelect").addEventListener("change", function() {
            let selectedTheater = this.value;
            let selectedDate = document.querySelector("#calendarSelect").value;
            displayMovies(xmlDoc, selectedTheater, selectedDate);
        });

        document.querySelector("#calendarSelect").addEventListener("change", function(event) {
            let selectedDate = event.target.value;
            let selectedTheater = document.querySelector("#theatreSelect").value;
            displayMovies(xmlDoc, selectedTheater, selectedDate);
        });
    }
};

xmlhttp.onerror = function() {
    movieContainer.innerHTML = "<p>Failed to load movies. Please try again later.</p>";
};


// Add theater names to dropdown
function populateTheaterDropdown(xmlDoc) {
    let theaterSelect = document.querySelector("#theatreSelect");
    let theaters = new Set(); // Use set to avoid duplicates
    // Go through theater names
    let movies = xmlDoc.querySelectorAll("Show");
    for (let i = 0; i < movies.length; i++) {
        let theaterName = movies[i].querySelectorAll("Theatre")[0].textContent;
        theaters.add(theaterName);
    }
    // Add names
    theaters.forEach(theater => {
        let option = document.createElement("option");
        option.value = theater;
        option.textContent = theater;
        theaterSelect.appendChild(option);
    });
}

// DATES function
function populateDateDropdown(xmlDoc) {
    let calendarSelect = document.querySelector("#calendarSelect");
    let dates = new Set(); // Used set to avoid duplicates
    
    // Loop through each show
    let movies = xmlDoc.querySelectorAll("Show");
    for (let i = 0; i < movies.length; i++) {
        let dateTime = movies[i].querySelectorAll("dttmShowStart")[0].textContent; // Get the date-time string
        let formattedDate = dateTime.split("T")[0]; // Extract just the date part (yyyy-mm-dd)
        // Convert to dd.mm.yyyy format
        let parts = formattedDate.split("-");
        let displayDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
        dates.add(displayDate); // Add formatted date to set
    }
    // Add dates in the dropdown
    dates.forEach(date => {
        let option = document.createElement("option");
        option.value = date;
        option.textContent = date; // Display date in the dropdown
        calendarSelect.appendChild(option); // Append to calendarSelect
    });
}

// Function to display movies based on selected theater and date

function displayMovies(xmlDoc, selectedTheater, selectedDate) {
    let movieContainer = document.querySelector("#movieContainer");
    movieContainer.innerHTML = ""; // Epmty previous content

    let movies = xmlDoc.querySelectorAll("Show");

    for (let i = 0; i < movies.length; i++) {
        let show = movies[i];
        let title = show.querySelector("Title").textContent;
        let theater = show.querySelector("Theatre").textContent;
        let showtime = show.querySelector("dttmShowStart").textContent;
        let duration = show.querySelector("LengthInMinutes").textContent;
        let rating = show.querySelector("Rating").textContent;
        let imageUrl = show.querySelector("EventSmallImagePortrait").textContent;
        let ratingImg = show.querySelector("RatingImageUrl").textContent;
        let formattedShowtime = formatShowtime(showtime);

        // Extract the date part from the showtime
        let showDate = showtime.split("T")[0]; // Extract the date part (yyyy-mm-dd)
        let formattedShowDate = `${showDate.split("-")[2]}.${showDate.split("-")[1]}.${showDate.split("-")[0]}`; // Convert to dd-mm-yyyy format

        // Display movies matching the selected theater and date
        if ((!selectedTheater || selectedTheater === theater) &&
            (!selectedDate || selectedDate === formattedShowDate)) {
            let movieDiv = document.createElement("div");
            movieDiv.classList.add("movie");

            // Create the inner HTML structure
            movieDiv.innerHTML = `
                <img src="${imageUrl}" alt="Movie Poster" class="moviePoster" loading="lazy">
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

function onDateChange(event) {
    let selectedDate = event.target.value; // Selected date
    let selectedTheater = document.querySelector("#theatreSelect").value; // Selected theater

    // Call displayMovies with the selected theater and date
    displayMovies(xmlDoc, selectedTheater, selectedDate);
}

function formatShowtime(showtime) {
    // Get the date part (yyyy-mm-dd)
    let formattedDate = showtime.split("T")[0]; 

    // Convert format
    let parts = formattedDate.split("-");
    let displayDate = `${parts[2]}.${parts[1]}.${parts[0]}`;

    // Extract time 
    let timeParts = showtime.split("T")[1].split(":"); // Split to get the time part
    let hours = timeParts[0]; // Get hours
    let minutes = timeParts[1]; // Get minutes

    // Combine date and time 
    return `${displayDate} ${hours}:${minutes}`;
}
