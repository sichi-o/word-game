const fetch = require('node-fetch');

const http = require("http"),
    fs = require("fs");

const express = require('express');
const app = express();
const cors = require('cors');
const { count, Console } = require("console");
const { callbackify } = require('util');

app.use(express.json());
app.use(cors())

const server = app.listen(3001)

// Import Socket.IO and pass our HTTP server object to it.
const socketio = require("socket.io")(http, {
    wsEngine: 'ws'
});

const io = socketio.listen(server);

const max_letters = 5;

// Here define the Gameroom object
function Gameroom(owner, name, answer){
    this.name = name;
    this.owner = owner;
    this.userlist = [];


    //contains the moves list as a list of postiions
    this.movelist = [];
    this.easy = false;
    this.answer = answer.toUpperCase();
    console.log("yooo " + this.answer)

}



function User(name){
    this.name = name;
    this.movelist = [];
    this.guesses = [];
    this.guess = "";


    this.current_row = "A";
    this.current_col = 1;

    //n
    this.correct_letters = [];
    this.score = 0;
    this.ready = false;
    this.socket = "";
}

function check(guess, callback) {
    // let xhttp = new XMLHttpRequest();
    // xhttp.onreadystatechange = function () {
    //     if (xhttp.readyState === 4 && xhttp.status === 200) { // request is done
    //         callback(xhttp.responseText); // we're calling our method
    //     }
    // };
    // xhttp.open('GET', "https://thatwordleapi.azurewebsites.net/ask/?word="+ guess);
    // xhttp.send();
    let word = guess.toLowerCase();
    // fetch('https://thatwordleapi.azurewebsites.net/ask/?word=' + word)
    // .then(response => response.json())
    // .then(data => callback(data.Response))
    // .catch(err => console.error('Error:', err));   
    fs.readFile("./backend/bank.txt", function (err, data) {
        if (err) throw err;
        if(data.includes(word)){
            console.log("YYEYYE")
            callback(true);
        }
        else{
            console.log("no");
            callback(false);
        }
    });
}

function randomWord(callback){
    fs.readFile("./backend/bank.txt", function (err, data) {
        if (err){
            throw err;
        } 
        let array = data.toString().split("\n");
        randomIndex = Math.floor(Math.random() * array.length);
        callback(true, array[randomIndex]);
    });
}

// The array of gamerooms
let gamerooms = [];

// The array of allowed users
let allowed_users = [];

//TODO: FIGURE OUT SENDING DATA WITH REQ AND REQ STUFF
app.post('/login', (req, res) => {

    let user = req.body.username;

    if(user == ""){
        let msg = "User can't be blank!";
        res.json({ message: msg });
        return;
    }

    //console.log("THIS IS THE USERNAME " + user);
    let new_user = new User(user);
    //current_user = new_user;
   // console.log("the surrent user has been set to: " + current_user.name);

    if(!allowed_users.includes(new_user.name)){
        allowed_users.push(new_user.name);

        res.json({ message: "success" , game_list: gamerooms, username: new_user });
    }

    else{
        let msg = "User already exists!";
        res.json({ message: msg });
    }
})


io.sockets.on("connection", function (socket) {
    console.log("connected");

    let userId = socket.id;
    //console.log("this is the user id " + userId);
    socket.join(userId);
    socket.join("not_in_a_game");

    // When it gets this message, it inserts a new room to the added to the gameroom
    socket.on('insert_room_to_server', function (data) {
        //socket.join("not_in_a_game");


        if(data["game_name"] == ""){
            let msg = "Game Room can't be blank!";
            io.sockets.to(userId).emit("error_to_client", { message: msg });
            return;
        }

        console.log("insert room of: " + data["user"].name + " with the name: " + data["game_name"]);

        randomWord(function (result, answer){
            //if getting a rando word is successful
            if(result){
                //Creates a game room
                let default_gameroom = new Gameroom(data["user"], data["game_name"], answer);

                //Sets the password to the specified password variable
                default_gameroom.password = data["password"];

                // Iterate through the list of gamerooms and if it already exists then alert the user of that
                let match = false;
                for(let i = 0; i < gamerooms.length; i++){
                    if(gamerooms[i].name == default_gameroom.name){
                        match = true;
                    }
                }

                // If the chatroom exists, then alert the user
                if(match){
                    let msg = "Game Room with that name already exists!";
                    io.sockets.to(userId).emit("error_to_client", { message: msg });
                }
                else{
                    // Adds to list of gamerooms
                    gamerooms.push(default_gameroom);

                    // Emit this mesage to everyone not currently in a game
                    io.sockets.to("not_in_a_game").emit("insert_room_to_client", { game_list: gamerooms, username: data["user"]}); // broadcast the message to other users
                }
            }
        })

        
    });

    // Joins the room ands displays the user list
    socket.on('join_room_to_server', function (data) {
       
        socket.join(`${data["this_game"].name}`);

        // Calculating the final index to use to find the specific game
        let index = 0;
        let final = -1;

        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                final = index;
                return;
            }
            index++;
        })
      
        //  Clears the shiplist
        data["user"].letters = [];
        data["user"].socket = userId;


        // If it's not currently in the user list then add it
        if(!gamerooms[final].userlist.includes(data["user"]) && gamerooms[final].userlist.length < 2){
             // When a user joins a room they are not in a game
            socket.leave("not_in_a_game");
            gamerooms[final].userlist.push(data["user"]);
            io.sockets.to(data["this_game"].name).emit("join_room_to_client", { this_game: gamerooms[final], 
                game_list: gamerooms, username: data["user"]});
        }
        else{
            let msg = "The limit for users in a game has already been met";
            io.sockets.to(userId).emit("error_to_client", { message: msg });
        }
    });


    // When it gets this message, it delets the user from the gameroom's userlist
    socket.on('leave_room_to_server', function(data) {

        //console.log("this user: " + data["user"] + " is leaving this game: " + data["this_game"].name)
        socket.join("not_in_a_game");

        let index_game = 0;
        let index_user = 0;
        let index_user_second = 0;

        let game_index = -1;
        let user_index = -1;

        let forfeit = false;

        //Gets the index of the game that we want to delete the user from
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game_index = index_game;
                return;
            }
            index_game++;
        })

        //Gets the index of the user we wnat to delete for the userlist in the specific gameroom
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game.userlist.forEach(function(user){
                    if(user.name == data["user"].name){
                        user_index = index_user_second;
                        return;
                    }
                    index_user_second++;
                })     
            }
            index_user++;
        })

        if(gamerooms[game_index].userlist.length == 2){
            forfeit = true;
        }

        //console.log("the state of forfeit is : " + forfeit);

        if(game_index != -1 || user_index != -1 ){
            gamerooms[game_index].userlist.splice(user_index, 1); // remove number using index
        }


        socket.leave(`${data["this_game"].name}`);

        // People still in the game would rejoin as if nothing ahnges
        io.sockets.to(`${data["this_game"].name}`).emit("join_room_to_client", { this_game: gamerooms[game_index], 
            game_list: gamerooms, isForfeit: forfeit, forfeiter: data["user"].name }); // broadcast the message to other users

        // the specific user has to leave
        io.sockets.to(userId).emit("leave_room_to_client", { game_list: gamerooms, isForfeit: forfeit, forfeiter: data["user"].name }); // broadcast the message to other users
    });

    // When it gets this message, it delets the user from the gameroom's userlist
    socket.on('leave_all_to_server', function(data) {

        console.log("leave allll")

        socket.join("not_in_a_game");

        let index_game = 0;

        let game_index = -1;

        //Gets the index of the game that we want to delete the user from
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game_index = index_game;
                return;
            }
            index_game++;
        })

        gamerooms[game_index].userlist = [];

        console.log("current game: " + data["this_game"].name);
        console.log("the user list: " + gamerooms[game_index].userlist[0]);

        //gamerooms.splice(game_index, 1);
        
        // the specific user has to leave
        io.sockets.to(`${data["this_game"].name}`).emit("leave_all_to_client", { game_list: gamerooms }); // broadcast the message to other users
       // socket.leave(`${data["this_game"].name}`);
    });


    socket.on('pick_to_server', function(data) {

        let index_game = 0;
        let index_user = 0;
        let index_user_second = 0;

        let game_index = -1;
        let user_index = -1;

        //Gets the index of the game that we want to delete the user from
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game_index = index_game;
                return;
            }
            index_game++;
        })

        //Gets the index of the user we wnat to delete for the userlist in the specific chatroom
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game.userlist.forEach(function(user){
                    if(user.name == data["user"].name){
                        user_index = index_user_second;
                        return;
                    }
                    index_user_second++;
                })     
            }
            index_user++;
        })

        // Checks if the limit of letters picked is reached
        let isLimitReached = false;
        console.log("this is the name of the user when picked: " + data["user"].name + " and their letter " + data["letter"]);

        //if a row is full, then don't do anything more
        if(gamerooms[game_index].userlist[user_index].current_col > 5){
            return;
            // gamerooms[game_index].userlist[user_index].current_col = 1;
            // gamerooms[game_index].userlist[user_index].current_row = String.fromCharCode(gamerooms[game_index].userlist[user_index].current_row.charCodeAt(0) + 1);
        }

        //have to build a guess
        gamerooms[game_index].userlist[user_index].guess += data["letter"];
        console.log("the guess is " + gamerooms[game_index].userlist[user_index].guess);

        //the position of the guess
        position = "" + gamerooms[game_index].userlist[user_index].current_row + gamerooms[game_index].userlist[user_index].current_col;
        console.log(position + " is this position");
        gamerooms[game_index].userlist[user_index].current_col++;
       
        // //console.log("the value of isLimitReached: " + isLimitReached);
    
        // send out the updated list of the game and the list of gamerooms
        io.sockets.to(userId).emit("pick_to_client", { username: gamerooms[game_index].userlist[user_index], 
            this_game: gamerooms[game_index], position: position, letter: data["letter"], status: isLimitReached });
    
    });

    // function check_validity(guess){
    //     let valid;
        
    //     fetch('https://thatwordleapi.azurewebsites.net/ask/?word='+ guess)
    //     .then(response => response.json())
    //     .then(data => function(){return data.Response})
    //     .catch(err => console.error('Error:', err));   


    //     //return valid;
    // }

    
    

    socket.on('validate_to_server', function(data) {

       let index_game = 0;
        let index_user = 0;
        let index_user_second = 0;

        let game_index = -1;
        let user_index = -1;

        let correct_answers_positions = [];
        let correct_answers_val = [];
        let almost_answers = [];

        //Gets the index of the game that we want to delete the user from
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game_index = index_game;
                return;
            }
            index_game++;
        })

        //Gets the index of the user we wnat to delete for the userlist in the specific chatroom
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game.userlist.forEach(function(user){
                    if(user.name == data["user"].name){
                        user_index = index_user_second;
                        return;
                    }
                    index_user_second++;
                })     
            }
            index_user++;
        })

        let guess = gamerooms[game_index].userlist[user_index].guess;
      
        //can't guess if the length is less than 5
        if(guess.length < 5){
            return;
        }

        check(guess, function (result) {
            //if it is a valid word
            if(result){
                console.log("hmmm");
                enter(data);
            }

            //if it's not a valid word
            else{
                console.log("novalied")
                let message = "Not a valid word";

                //reset the col number
                gamerooms[game_index].userlist[user_index].current_col = 1;

                //clears the guess
                gamerooms[game_index].userlist[user_index].guess = "";

                let current_row =  gamerooms[game_index].userlist[user_index].current_row;
                // send out the updated list of the game and the list of gamerooms
                io.sockets.to(userId).emit("wrong_to_client", { username: gamerooms[game_index].userlist[user_index], 
                    this_game: gamerooms[game_index], row: current_row, message: message });

            }
        })

       // console.log(valid);
    })

    function enter(data) {

        let index_game = 0;
        let index_user = 0;
        let index_user_second = 0;

        let game_index = -1;
        let user_index = -1;

        let correct_answers_positions = [];
        let correct_answers_val = [];
        let almost_answers = [];

        //Gets the index of the game that we want to delete the user from
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game_index = index_game;
                return;
            }
            index_game++;
        })

        //Gets the index of the user we wnat to delete for the userlist in the specific chatroom
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game.userlist.forEach(function(user){
                    if(user.name == data["user"].name){
                        user_index = index_user_second;
                        return;
                    }
                    index_user_second++;
                })     
            }
            index_user++;
        })

        let guess = gamerooms[game_index].userlist[user_index].guess;
        let answer = gamerooms[game_index].answer;

        
        // Checks if the limit of letters picked is reached
        let isLimitReached = false;
        console.log("this is the name of the user when picked: " + data["user"].name + " and their letter " + data["letter"]);

        gamerooms[game_index].userlist[user_index].current_col = 1;
        let prev_row =  gamerooms[game_index].userlist[user_index].current_row;
        gamerooms[game_index].userlist[user_index].current_row = String.fromCharCode(gamerooms[game_index].userlist[user_index].current_row.charCodeAt(0) + 1);

        console.log("the answer is " +  answer);
        console.log("the guess is " + gamerooms[game_index].userlist[user_index].guess);
        
        //checks for the correctanswer in the correct position
        for(let i = 0; i < answer.length; i++){
            if(guess[i] == answer[i]){
                correct_answers_positions.push(i+1); //offest by 1 start from 1.. to 5
                correct_answers_val.push(guess[i]);
            }
        }

        const guess_map = new Map();

        const answer_map = new Map();

        // setting map values of the answer to get the freqeuncey of each letter in the answer
        for(let i = 0; i < answer.length; i++){
            if(!answer_map.has(answer[i])){
                answer_map.set(answer[i], 1);
            }
            else{
                answer_map.set(answer[i], answer_map.get(answer[i]) + 1);
            }
        }
       

        //makes sure that we only add the ones that aren't correctly guessed to the almost
        // makes sure that the maximum we can have ofalmost isthe mac number of duplicates in the letter
        for(let i = 0; i < answer.length; i++){
 
            if(!guess_map.has(guess[i])){
                guess_map.set(guess[i], 1);
                if(answer.includes(guess[i])){
                    almost_answers.push(i+1); //offest by 1 start from 1.. to 5
                    console.log("(first) the entries of " + guess[i] + guess_map.get(guess[i]));
                }
            }
    
            //if a dupe exists then make sure it's below the number of allowed dupes
            else{
                guess_map.set(guess[i], guess_map.get(guess[i]) + 1);
                if(guess_map.get(guess[i]) <= answer_map.get(guess[i])){
                    console.log("entered first if")
                        if(answer.includes(guess[i])){
                            almost_answers.push(i+1); //offest by 1 start from 1.. to 5
                            console.log("the entries of " + guess[i] + guess_map.get(guess[i]));
                        }
                }
            }
        }


        console.log("the almost before contains " + almost_answers);
        console.log("the correct before contains " + correct_answers_positions);

        //remove duplicates in the almost answers if we've met the cap on dupes already
        for(let i = 0; i < correct_answers_positions.length; i++){
            if(almost_answers.includes(correct_answers_positions[i])){
                almost_answers.splice(almost_answers.indexOf(correct_answers_positions[i]), 1);
            }

            if(guess_map.get(guess[i]) > answer_map.get(guess[i])){
                console.log("we deleted " + correct_answers_positions[i]);
                almost_answers.splice(almost_answers.indexOf(correct_answers_positions[i]), 1);
            }
        }
        
        console.log("the almost now contains " + almost_answers);
        console.log("the correct now contains " + correct_answers_positions);

        //clears the guess
        gamerooms[game_index].userlist[user_index].guess = "";

        // //the position of the guess
        // position = "" + gamerooms[game_index].userlist[user_index].current_row + gamerooms[game_index].userlist[user_index].current_col;
        // console.log(position + " is this position of the guess");

        // //console.log("the value of isLimitReached: " + isLimitReached);
    
        // send out the updated list of the game and the list of gamerooms
        io.sockets.to(userId).emit("enter_to_client", { username: gamerooms[game_index].userlist[user_index], 
            this_game: gamerooms[game_index], row: prev_row, correct: correct_answers_positions, almost: almost_answers, letter: data["letter"], status: isLimitReached });
    
    };

    socket.on('enter_to_server', function(data) {

        let index_game = 0;
        let index_user = 0;
        let index_user_second = 0;

        let game_index = -1;
        let user_index = -1;

        let correct_answers_positions = [];
        let correct_answers_val = [];
        let almost_answers = [];

        //Gets the index of the game that we want to delete the user from
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game_index = index_game;
                return;
            }
            index_game++;
        })

        //Gets the index of the user we wnat to delete for the userlist in the specific chatroom
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game.userlist.forEach(function(user){
                    if(user.name == data["user"].name){
                        user_index = index_user_second;
                        return;
                    }
                    index_user_second++;
                })     
            }
            index_user++;
        })

        let guess = gamerooms[game_index].userlist[user_index].guess;
        let answer = gamerooms[game_index].answer;

        
        // Checks if the limit of letters picked is reached
        let isLimitReached = false;
        console.log("this is the name of the user when picked: " + data["user"].name + " and their letter " + data["letter"]);

        gamerooms[game_index].userlist[user_index].current_col = 1;
        let prev_row =  gamerooms[game_index].userlist[user_index].current_row;
        gamerooms[game_index].userlist[user_index].current_row = String.fromCharCode(gamerooms[game_index].userlist[user_index].current_row.charCodeAt(0) + 1);

        console.log("the answer is " +  answer);
        console.log("the guess is " + gamerooms[game_index].userlist[user_index].guess);
        
        //checks for the correctanswer in the correct position
        for(let i = 0; i < answer.length; i++){
            if(guess[i] == answer[i]){
                correct_answers_positions.push(i+1); //offest by 1 start from 1.. to 5
                correct_answers_val.push(guess[i]);
            }
        }

        const guess_map = new Map();

        const answer_map = new Map();

        // setting map values of the answer to get the freqeuncey of each letter in the answer
        for(let i = 0; i < answer.length; i++){
            if(!answer_map.has(answer[i])){
                answer_map.set(answer[i], 1);
            }
            else{
                answer_map.set(answer[i], answer_map.get(answer[i]) + 1);
            }
        }
       

        //makes sure that we only add the ones that aren't correctly guessed to the almost
        // makes sure that the maximum we can have ofalmost isthe mac number of duplicates in the letter
        for(let i = 0; i < answer.length; i++){
 
            if(!guess_map.has(guess[i])){
                guess_map.set(guess[i], 1);
                if(answer.includes(guess[i])){
                    almost_answers.push(i+1); //offest by 1 start from 1.. to 5
                    console.log("(first) the entries of " + guess[i] + guess_map.get(guess[i]));
                }
            }
    
            //if a dupe exists then make sure it's below the number of allowed dupes
            else{
                guess_map.set(guess[i], guess_map.get(guess[i]) + 1);
                if(guess_map.get(guess[i]) <= answer_map.get(guess[i])){
                    console.log("entered first if")
                        if(answer.includes(guess[i])){
                            almost_answers.push(i+1); //offest by 1 start from 1.. to 5
                            console.log("the entries of " + guess[i] + guess_map.get(guess[i]));
                        }
                }
            }
        }


        console.log("the almost before contains " + almost_answers);
        console.log("the correct before contains " + correct_answers_positions);

        //remove duplicates in the almost answers if we've met the cap on dupes already
        for(let i = 0; i < correct_answers_positions.length; i++){
            if(almost_answers.includes(correct_answers_positions[i])){
                almost_answers.splice(almost_answers.indexOf(correct_answers_positions[i]), 1);
            }

            if(guess_map.get(guess[i]) > answer_map.get(guess[i])){
                console.log("we deleted " + correct_answers_positions[i]);
                almost_answers.splice(almost_answers.indexOf(correct_answers_positions[i]), 1);
            }
        }
        
        console.log("the almost now contains " + almost_answers);
        console.log("the correct now contains " + correct_answers_positions);

        //clears the guess
        gamerooms[game_index].userlist[user_index].guess = "";

        // //the position of the guess
        // position = "" + gamerooms[game_index].userlist[user_index].current_row + gamerooms[game_index].userlist[user_index].current_col;
        // console.log(position + " is this position of the guess");

        // //console.log("the value of isLimitReached: " + isLimitReached);
    
        // send out the updated list of the game and the list of gamerooms
        io.sockets.to(userId).emit("enter_to_client", { username: gamerooms[game_index].userlist[user_index], 
            this_game: gamerooms[game_index], row: prev_row, correct: correct_answers_positions, almost: almost_answers, letter: data["letter"], status: isLimitReached });
    
    });

    socket.on('attack_to_server', function(data) {

        let index_game = 0;
        let index_user = 0;
        let index_user_second = 0;

        let game_index = -1;
        let user_index = -1;

        let winner = "";
        let hasWon = false;

        //Gets the index of the game that we want to delete the user from
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game_index = index_game;
                return;
            }
            index_game++;
        })

        //Gets the index of the user we wnat to delete for the userlist in the specific chatroom
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game.userlist.forEach(function(user){
                    if(user.name == data["user"].name){
                        user_index = index_user_second;
                        return;
                    }
                    index_user_second++;
                })     
            }
            index_user++;
        })

        //console.log("this is the name of the user when picked: " + data["user"].name);

        let victim_index = data["victim_index"];

        for(let i = 0; i < gamerooms[game_index].userlist[victim_index].letters.length; i++){
            if(gamerooms[game_index].userlist[victim_index].letters[i] == data["position"]){

                
                if(!gamerooms[game_index].userlist[user_index].correct_letters.includes(data["position"])){
                    gamerooms[game_index].userlist[user_index].correct_letters.push(data["position"]);
                    gamerooms[game_index].userlist[user_index].score++;
                }
                
                if(gamerooms[game_index].userlist[user_index].score == 7){
                    winner = gamerooms[game_index].userlist[user_index].name;
                    hasWon = true;

                    console.log("WE HAVE A WINNER: " + winner);
                }

                
                //gamerooms[game_index].userlist[victim_index].letters.splice(i, 1); // remove number using index
                
                let victimId = gamerooms[game_index].userlist[victim_index].socket;

                io.sockets.to(userId).emit("hit_to_client", { username: gamerooms[game_index].userlist[user_index], 
                    this_game: gamerooms[game_index], position: data["position"]});
                io.sockets.to(victimId).emit("sub_to_client", { username: gamerooms[game_index].userlist[user_index], 
                    this_game: gamerooms[game_index], position: data["position"]});

                if(hasWon){
                    gamerooms[game_index].userlist[user_index].letters = [];
                    gamerooms[game_index].userlist[user_index].correct_letters = [];
                    gamerooms[game_index].userlist[user_index].ready = false;
                    gamerooms[game_index].userlist[user_index].score = 0;
                    gamerooms[game_index].userlist[user_index].movelist = [];
                    
                    gamerooms.splice(game_index, 1);

                    
                    io.in(`${data["this_game"].name}`).socketsJoin("not_in_a_game");
                    io.sockets.to(`${data["this_game"].name}`).emit("win_to_client", { winner: winner, game_list: gamerooms });
                    io.in(`${data["this_game"].name}`).socketsLeave(`${data["this_game"].name}`);
                }

                return;
            }
        }

        
        let position_letter = data["position"][0];
        let index = 0;
        //Citation for ascii conversion: https://www.techiedelight.com/character-to-ascii-code-javascript/
        let ascii = position_letter.charCodeAt(index);
        console.log("position_letter is: " + position_letter + ". the character val is: " + ascii);

        let position = data["position"];
        //Citation for regex: https://stackoverflow.com/questions/10003683/how-can-i-extract-a-number-from-a-string-in-javascript
        let position_num = position.replace(/\D/g, "");
        console.log("this is position_num: " + position_num); 

        for(let i = 0; i < gamerooms[game_index].userlist[victim_index].letters.length; i++){ 
            
            let ship_position = gamerooms[game_index].userlist[victim_index].letters[i];
            let ship_position_num = ship_position.replace(/\D/g, "");

            let ship_position_letter = gamerooms[game_index].userlist[victim_index].letters[i][0]
            let ship_index = 0;
            let ship_ascii = ship_position_letter.charCodeAt(ship_index);

            if(ship_position_letter == position_letter){
                if(Math.abs(position_num - ship_position_num) == 1){
                    console.log("this is 1 off and should be yellow for horizontal");
                    // send out the updated list of the game and the list of gamerooms
                    io.sockets.to(userId).emit("close_to_client", { username: gamerooms[game_index].userlist[user_index], 
                        this_game: gamerooms[game_index], position: data["position"]});
                    return;
                }
            }

            else if(ship_position_num == position_num){
                if(Math.abs(ship_ascii - ascii) == 1){
                    console.log("this is 1 off and should be yellow for vertical");
                    // send out the updated list of the game and the list of gamerooms
                    io.sockets.to(userId).emit("close_to_client", { username: gamerooms[game_index].userlist[user_index], 
                        this_game: gamerooms[game_index], position: data["position"]});
                    return;
                }
            }
        }
        let victimId = gamerooms[game_index].userlist[victim_index].socket;
        // send out the updated list of the game and the list of gamerooms
        io.sockets.to(userId).emit("miss_to_client", { username: gamerooms[game_index].userlist[user_index], 
            this_game: gamerooms[game_index], position: data["position"]});
        io.sockets.to(victimId).emit("opponent_miss_to_client", { username: gamerooms[game_index].userlist[user_index], 
            this_game: gamerooms[game_index], position: data["position"]});
    });

});