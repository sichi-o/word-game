import React from 'react';

let score = 7;

class Key extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isPicked: false,
            gamerooms: this.props.game_list,
            current_game: this.props.current_game,
            username: this.props.username,
            isHit: false,
            isMiss: false,
            isOppMiss: false,
            isSub: false,
            isEntered: false,
            isClose: false,
            subVal: "",
            hitVal: "",
            missVal: "",
            oppMissVal: "",
            pickedVal: "",
            letterVal: "",
            closeVal: "",
            rowVal: "",
            correct_answers: [],
            almost_answers: [],
            isClicked: false
        }

        //this.myRef = React.createRef();
        this.pick = this.pick.bind(this);
        this.enter = this.enter.bind(this);
        this.attack = this.attack.bind(this);
    }

    // Picks a user's ship at the beginning
    pick() {
        let socketio = this.props.socket;

        // Emits a signal to the backend to pick a ship at a location
        socketio.emit("pick_to_server", { user: this.state.username, this_game: this.state.current_game, letter: this.props.letter })
    }

    enter() {
        let socketio = this.props.socket;

        // Emits a signal to the backend to pick a ship at a location
        socketio.emit("enter_to_server", { user: this.state.username, this_game: this.state.current_game, letter: this.props.letter })
    }

    // Attacks another user's ship
    attack() {
        let socketio = this.props.socket;
        let victim_index;

        // Caluclates the index of the victim
        if (this.state.current_game.userlist[0].name == this.state.username.name) {
            victim_index = 1;
        }
        else {
            victim_index = 0;
        }

        // Emits a signal to the backend to attack a server
        socketio.emit("attack_to_server", { user: this.state.username, victim_index: victim_index, this_game: this.state.current_game, letter: this.props.letter });

    }

    render() {
        //const isLabel = this.props.isLabel;
        let socketio = this.props.socket;
        const isPicked = this.state.isPicked;
        //const current_game = this.state.current_game;
        const isEntered = this.state.isEntered;
        // const username = this.state.username;

        // // This is executes when a user picks the location for their ship
        // socketio.removeAllListeners("pick_to_client");
        // socketio.on("pick_to_client", (data) => {
        //   let pi = this.state.isPicked;
        //   console.log("letter picked: " + data.letter);
        //   console.log("is picked " + pi);
        //   this.setState({
        //     isPicked: true,
        //     letterVal: data.letter,
        //     correct_answers: [],
        //     almost_answers: [],
        //     pickedVal: data.position,
        //     current_game: data.this_game,
        //     username: data.username
        //   }) 
        //   console.log("changed " + pi);
        // });

        // // This is executes when a user picks the location for their ship
        // socketio.removeAllListeners("enter_to_client");
        // socketio.on("enter_to_client", (data) => {
        //   this.setState({
        //     isEntered: true,
        //     isPicked: false,
        //     rowVal: data.row,
        //     correct_answers: data.correct,
        //     almost_answers: data.almost,
        //     current_game: data.this_game,
        //     username: data.username
        //   }) 
        // });

        // // This is executes when a succesful hit is detected
        // socketio.on("hit_to_client", (data) => {
        //   this.setState({
        //     isClicked: true,
        //     isHit: true,
        //     hitVal: data.letter,
        //     current_game: data.this_game,
        //     username: data.username
        //   }) 
        // });

        // // This is executes when a miss is detected
        // socketio.removeAllListeners("miss_to_client");
        // socketio.on("miss_to_client", (data) => {
        //   this.setState({
        //     isClicked: true,
        //     isMiss: true,
        //     missVal: data.letter,
        //     current_game: data.this_game,
        //     username: data.username
        //   }) 
        // })

        // // This is executes when a close hit is detected
        // socketio.removeAllListeners("close_to_client");
        // socketio.on("close_to_client", (data) => {
        //   this.setState({
        //     isClicked: true,
        //     isClose: true,
        //     closeVal: data.letter,
        //     current_game: data.this_game,
        //     username: data.username
        //   }) 
        // })

        // // This is displays what the victim gets on their screen
        // socketio.on("sub_to_client", (data) => {
        //   this.setState({
        //     isClicked: true,
        //     isSub: true,
        //     subVal: data.letter,
        //     current_game: data.this_game
        //   }) 
        // })

        // // This is displays what the opponent missed on the player's screen
        // socketio.on("opponent_miss_to_client", (data) => {
        //   this.setState({
        //     isClicked: true,
        //     isOppMiss: true,
        //     oppMissVal: data.letter,
        //     current_game: data.this_game
        //   }) 
        // })
        // Determine if the current key is a label

        // if(isPicked){ 
        //     //console.log(this.state.letterVal);
        //     document.getElementById(this.state.pickedVal).innerText = this.state.letterVal; 
        //     // using an animation to bulg it out
        //     this.myRef.current =    gsap.timeline()
        //                                 .to("#" + this.state.pickedVal, { duration: 0.1, scale: 1.5 })
        //                                 .to("#" + this.state.pickedVal, { duration: 0.2, scale: 1 });
        // }


        // //trying tofigureout why the correctness systemsisnotupdating all the time
        // if(isEntered){ 
        //     //console.log(this.state.letterVal);
        //     // for(let i = 1; i < 6; i++){
        //     //     let position = "" + this.state.rowVal + i;
        //     //     document.getElementById(position).style.backgroundColor = "gray"; 
        //     // }


        //     if(this.state.correct_answers.length > 0){
        //         for(let i = 0; i < this.state.correct_answers.length; i++){
        //             let position = "" + this.state.rowVal + this.state.correct_answers[i];
        //             document.getElementById(position).style.backgroundColor = "green"; 
        //         }
        //     }

        //     if(this.state.almost_answers.length > 0){
        //         for(let i = 0; i < this.state.almost_answers.length; i++){
        //             let position = "" + this.state.rowVal + this.state.almost_answers[i];
        //             document.getElementById(position).style.backgroundColor = "yellow"; 
        //         }
        //     }

        // }

        // if(isHit){ 
        //   document.getElementById(this.state.hitVal).style.backgroundColor = "#7bc100";  
        // }

        // if(isClose){
        //   document.getElementById(this.state.closeVal).style.backgroundColor = "#f3dc04"; 
        // }

        // if(isMiss){
        //   document.getElementById(this.state.missVal).style.backgroundColor = "rgb(255 0 55)"; 
        // }

        // if(isSub){
        //   document.getElementById(this.state.subVal).style.backgroundColor = "gray";
        // }
        // if(isOppMiss){
        //   document.getElementById(this.state.oppMissVal).style.backgroundColor = "#ffcccb";
        // }

        // When the game starts, it allows you to attack
        if (this.props.letter == "ENTER") {

            return (
                <button className="key" id={this.props.letter} key={this.props.letter} onClick={() => this.enter()}>
                    {this.props.letter}
                </button>
            );
        }

        // Otherwise, allow the user to pick a ship
        else {
            return (
                <button className="key" id={this.props.letter} key={this.props.letter} onClick={() => this.pick()} ref={this.myRef}>
                    {this.props.letter}
                </button>
            );
        }


    }
}
export default Key;
