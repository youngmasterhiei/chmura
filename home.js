$(document).ready(function () {


    var actors = [];
    var movieList = [];
    var uniqueFirstActorList = [];
    var uniqueSecondActorList = [];
    var firstActorNames = [];
    var secondActorNames = [];
    var actorsInBoth = [];

    var firstActorId = "";
    var secondActorId = "";


    //click function for actor name submit
    $("#actorSubmit").on("click", function () {
        event.preventDefault();
        //grabs first and second actor name from user
        var firstActorName = $("#firstActorSearch").val().trim();
        var secondActorName = $("#secondActorSearch").val().trim();
        // query links
        var actorQuery = "http://ceamovies.azurewebsites.net/api/actors";
        var movieQuery = "http://ceamovies.azurewebsites.net/api/movies";
        var validationQuery = "http://ceamovies.azurewebsites.net/api/validation";
        //logs name entered
        console.log(firstActorName);
        //ajax call to grab list of actors names
        $.ajax({

            type: "GET",
            headers: {
                "x-chmura-cors": '71AF6778-1F0C-48DF-B54B-0413EE269626',
            },
            url: actorQuery,
        }).done(function (data) {
            // sets data from api call to local variable to be reused
            actors = data;

            //finds first and second actors ID using name entered by user
            firstActorId = actors.find(actors => actors.name.toLowerCase() === firstActorName.toLowerCase()).actorId;
            secondActorId = actors.find(actors => actors.name.toLowerCase() === secondActorName.toLowerCase()).actorId;
            //console.logs both id's
            console.log(firstActorId);
            console.log(secondActorId);

            // second ajax call for movie titles and acting cast
            $.ajax({

                type: "GET",
                headers: {
                    "x-chmura-cors": '71AF6778-1F0C-48DF-B54B-0413EE269626',
                },
                url: movieQuery,
            }).done(function (data) {
                //sets data to moviedata to be reused
                var movieData = data
                // searches movie data for all movies that had first actor in it. sets it to the variable
                var firstActorResults = $.grep(movieData, function (n, i) {
                    return (n.actors.includes(firstActorId));
                });

                // searches movie data for all movies that had second actor in it and sets it to the variable secondActorResults
                var secondActorResults = $.grep(movieData, function (n, i) {
                    return (n.actors.includes(secondActorId));
                });
                console.log(movieData);
                console.log(firstActorResults);
                console.log("firstActorResults");
                console.log(secondActorResults);
                console.log("secondActorResults");
                console.log(actors);
                console.log("actors");
                // grabs all actors that played with first searched actor, stores it to an array
                var firstActorList = $(firstActorResults).map(function (i) {

                    return firstActorResults[i].actors;
                }).get();
                // grabs all actors that played with second searched actor, stores it to an array
                var secondActorList = $(secondActorResults).map(function (i) {

                    return secondActorResults[i].actors;
                }).get();

                console.log(secondActorList);

                // goes through the first actors supporting cast list and removes any duplicates
                $.each(firstActorList, function (i, el) {
                    if ($.inArray(el, uniqueFirstActorList) === -1) { uniqueFirstActorList.push(el) };
                });

                // goes through the second actors supporting cast list and removes any duplicates
                $.each(secondActorList, function (i, el) {
                    if ($.inArray(el, uniqueSecondActorList) === -1) { uniqueSecondActorList.push(el) };
                });

                // console logs both new lists with no duplicates
                console.log(uniqueFirstActorList);
                console.log(uniqueSecondActorList);

                //goes through the first actors supporting cast list and converts the actors id's to actor names then appends it to a dynamic html list
                for (i = 0; i < uniqueFirstActorList.length; i++) {
                    var newFirstActor = actors.find(actors => actors.actorId === uniqueFirstActorList[i]).name;
                    $("#firstActorList").append("<li>" + newFirstActor + "</li>")
                    firstActorNames.push(newFirstActor);
                }

                //goes through the second actors supporting cast list and converts the actors id's to actor names then appends it to a dynamic html list
                for (i = 0; i < uniqueSecondActorList.length; i++) {
                    var newSecondActor = actors.find(actors => actors.actorId === uniqueSecondActorList[i]).name;
                    $("#secondActorList").append("<li>" + newSecondActor + "</li>")
                    secondActorNames.push(newSecondActor);
                }
                // logs all the names for each actors supporting cast
                console.log(firstActorNames);
                console.log("firstActors names");
                console.log(secondActorNames);
                console.log("secondActors Names");

                // compares first actor supporting cast with second actor's supporting cast and pushes the names that appear in both into an array
                $.each(firstActorNames, function (i, el) {
                    if ($.inArray(el, secondActorNames) !== -1) {
                        actorsInBoth.push(el);
                        $("#actorsInBoth").append("<li>" + el + "</li>")
                    }

                });

                // takes the names of supporting actors who worked with both and converts it into a JSON object to send back for validation. has to be a JSON object.



                actorsInBoth.sort(function (a, b) {
                    // compare lastname part for sorting
                    return a.split(' ')[1].localeCompare(b.split(' ')[1]);
                })


                var obj = [];
                for (i = 0; i < actorsInBoth.length; i++) {
                    var IdSearch = actors.find(actors => actors.name.toLowerCase() === actorsInBoth[i].toLowerCase()).actorId;

                    // var movieTitleNC = movieData.find(movieData => movieData.actors.includes(IdSearch) && movieData.actors.includes(firstActorId)).title;
                    // var movieTitleKR = movieData.find(movieData => movieData.actors.includes(IdSearch) && movieData.actors.includes(secondActorId)).title;

                    var movieTitleNC = $.grep(movieData, function (n, i) {
                        return (n.actors.includes(firstActorId) && n.actors.includes(IdSearch));
                    });

                    var movieTitleKR = $.grep(movieData, function (n, i) {
                        return (n.actors.includes(secondActorId) && n.actors.includes(IdSearch));
                    });

                    var movieListKR = $(movieTitleKR).map(function (j) {

                        return movieTitleKR[j].title;
                    }).get();

                    var movieListNC = $(movieTitleNC).map(function (j) {

                        return movieTitleNC[j].title;
                    }).get();

                    movieListKR.sort();
                    movieListNC.sort();

                    console.log(IdSearch)
                    console.log(movieTitleNC);
                    console.log(movieTitleKR);

                    var name = actorsInBoth[i];
                    tmp = {
                        'Name': name,
                        "KRMovies": movieListKR,
                        "NCMovies": movieListNC
                    };

                    obj.push(tmp);
                }
                console.log(obj);
                //makes the ajax post to chmuras server to check if the list of names is correct

                $.ajax({
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    method: 'POST',
                    url: validationQuery,
                    headers: {"x-chmura-cors": '71AF6778-1F0C-48DF-B54B-0413EE269626'},
                    data: JSON.stringify(obj),
                    processData: false,

                    success: function(data){
                        console.log(data)
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