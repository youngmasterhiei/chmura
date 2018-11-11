$(document).ready(function () {
    // query links
    const actorQuery = "http://ceamovies.azurewebsites.net/api/actors";
    const movieQuery = "http://ceamovies.azurewebsites.net/api/movies";
    const validationQuery = "http://ceamovies.azurewebsites.net/api/validation";
    const key = "71AF6778-1F0C-48DF-B54B-0413EE269626";

    let uniqueFirstActorList = [];
    let uniqueSecondActorList = [];
    let firstActorNames = [];
    let secondActorNames = [];
    let actorsInBoth = [];

    //click function for actor name submit
    $("#actorSubmit").on("click", () => {
        event.preventDefault();
        //grabs first and second actor name from user
        let firstActorName = $("#firstActorSearch").val().trim();
        let secondActorName = $("#secondActorSearch").val().trim();
        $("#firstList").append("Supporting Cast for: " + firstActorName);
        $("#secondList").append("Supporting Cast for: " + secondActorName);
        $("#thirdList").append("Supporting Cast for both: " + firstActorName + " & " + secondActorName);

        //ajax call to grab list of actors names
        $.ajax({

            type: "GET",
            headers: {
                "x-chmura-cors": key,
            },
            url: actorQuery,
        }).done((data) => {
            // sets data from api call to local variable to be reused
            const actors = data;

            //finds first and second actors ID using name entered by user
            let firstActorId = actors.find(actors => actors.name.toLowerCase() === firstActorName.toLowerCase()).actorId;
            let secondActorId = actors.find(actors => actors.name.toLowerCase() === secondActorName.toLowerCase()).actorId;
            // second ajax call for movie titles and acting cast
            $.ajax({

                type: "GET",
                headers: {
                    "x-chmura-cors": key,
                },
                url: movieQuery,
            }).done((data) => {
                //sets data to moviedata to be reused
                const movieData = data
                // searches movie data for all movies that had first actor in it. sets it to the variable
                let firstActorResults = $.grep(movieData, (movieData) => {
                    return (movieData.actors.includes(firstActorId));
                });

                // searches movie data for all movies that had second actor in it and sets it to the letiable secondActorResults
                let secondActorResults = $.grep(movieData, (movieData) => {
                    return (movieData.actors.includes(secondActorId));
                });

                // grabs all actors that played with first searched actor, stores it to an array
                let firstActorList = $(firstActorResults).map((i) => {

                    return firstActorResults[i].actors;
                });
                // grabs all actors that played with second searched actor, stores it to an array
                let secondActorList = $(secondActorResults).map((i) => {

                    return secondActorResults[i].actors;
                });

                // goes through the first actors supporting cast list and removes any duplicates
                $.each(firstActorList, (i, id) => {
                    if ($.inArray(id, uniqueFirstActorList) === -1) { uniqueFirstActorList.push(id) };
                });

                // goes through the second actors supporting cast list and removes any duplicates
                $.each(secondActorList, (i, id) => {
                    if ($.inArray(id, uniqueSecondActorList) === -1) { uniqueSecondActorList.push(id) };
                });

                //goes through the first actors supporting cast list and converts the actors id's to actor names then appends it to a dynamic html list unless name equals search name
                for (i = 0; i < uniqueFirstActorList.length; i++) {
                    var newFirstActor = actors.find(actor => actor.actorId === uniqueFirstActorList[i]).name;
                    if (newFirstActor.toLowerCase() !== firstActorName.toLowerCase()){
                    $("#firstActorList").append("<li>" + newFirstActor + "</li>")
                    firstActorNames.push(newFirstActor);
                    };
                }

                //goes through the second actors supporting cast list and converts the actors id's to actor names then appends it to a dynamic html list unless name equals search name
                for (i = 0; i < uniqueSecondActorList.length; i++) {
                    var newSecondActor = actors.find(actor => actor.actorId === uniqueSecondActorList[i]).name;
                    if(newSecondActor.toLowerCase() !== secondActorName.toLowerCase()){
                        $("#secondActorList").append("<li>" + newSecondActor + "</li>");
                        secondActorNames.push(newSecondActor);
                    };
          
                }

                // compares first actor supporting cast with second actor's supporting cast and pushes the names that appear in both into an array
                $.each(firstActorNames, (i, name) => {
                    if ($.inArray(name, secondActorNames) !== -1) {
                        actorsInBoth.push(name);
                        $("#actorsInBoth").append("<li>" + name + "</li>")
                    }
                });
                //sorts the actors list by alphabetical last names 
                actorsInBoth.sort((a, b) => {
                    // compare lastname part for sorting
                    return a.split(' ')[1].localeCompare(b.split(' ')[1]);
                })
                // object to be used for valiadation
                let obj = [];
                //loops through actors who played in both, finds movie titles they played with, sets it to an object array
                for (i = 0; i < actorsInBoth.length; i++) {
                    //grabs specific actors ID from name to be used to search for movies they played in with NC or KR
                    let IdSearch = actors.find(actors => actors.name.toLowerCase() === actorsInBoth[i].toLowerCase()).actorId;
                    //filters out any movie data specific actor played with NC
                    let movieDataNC = $.grep(movieData, (movieData) => {
                        return (movieData.actors.includes(firstActorId) && movieData.actors.includes(IdSearch));
                    });
                    //filters out any movie data specific actor played with KR
                    let movieDataKR = $.grep(movieData, (movieData) => {
                        return (movieData.actors.includes(secondActorId) && movieData.actors.includes(IdSearch));
                    });
                    //pulls just the title out of the movieData, sets it to a variable
                    let movieListKR = $(movieDataKR).map((j) => {

                        return movieDataKR[j].title;
                    }).get();
                    let movieListNC = $(movieDataNC).map((j) => {

                        return movieDataNC[j].title;
                    }).get();

                    //sorts movie array lists alphabetically
                    movieListKR.sort();
                    movieListNC.sort();
                    // takes the names of supporting actors who worked with both and converts it into a JSON object to send back for validation. Adds in individual movie titles for each
                    let name = actorsInBoth[i];
                    template = {
                        'Name': name,
                        "KRMovies": movieListKR,
                        "NCMovies": movieListNC
                    };

                    obj.push(template);
                };
                console.log(obj);
                //makes the ajax post to chmuras server to check if the list of names is correct
                $.ajax({
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    type: 'POST',
                    url: validationQuery,
                    headers: { "x-chmura-cors": key },
                    data: JSON.stringify(obj),

                    success: (result, status, xhr) => {
                        console.log(result);
                        console.log(xhr);
                        console.log(status);
                    }
                });
                // closing brackets for second ajax call, list of movies
            });
            //closing brakects for first ajax call, list of actors
        });
        // sets the search inputs back to blank
        $("#firstActorSearch").val("");
        $("#secondActorSearch").val("");
        // closes onclick funtion
    });
    // closes document.ready
});