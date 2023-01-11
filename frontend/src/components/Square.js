import React from 'react';
import { gsap } from "gsap";
let score = 7;

class Square extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
      isPicked: false,
      isDeleted: false,
      gamerooms: this.props.game_list,
      current_game: this.props.current_game,
      username: this.props.username,
      isEntered: false,
      isWrong: false,
      pickedVal: "",
      letterVal: "",
      closeVal: "",
      rowVal: "",
      correct_answers: [],
      almost_answers: []
    } 

    this.myRef = React.createRef();
  }

  render() {
    //const isLabel = this.props.isLabel;
    let socketio = this.props.socket;
    const isPicked = this.state.isPicked;
    const isDeleted = this.state.isDeleted;
    //const current_game = this.state.current_game;
    //const username = this.state.username;
    const isEntered = this.state.isEntered;
   // const isWrong = this.state.isWrong;
    
    // This is executes when a user picks the location for their ship
    socketio.removeAllListeners("pick_to_client");
    socketio.on("pick_to_client", (data) => {
      let pi = this.state.isPicked;
      console.log("letter picked: " + data.letter);
      console.log("is picked " + pi);
      this.setState({
        isPicked: true,
        isDeleted: false,
        isEntered: false,
        isWrong: false,
        letterVal: data.letter,
        correct_answers: [],
        almost_answers: [],
        pickedVal: data.position,
        current_game: data.this_game,
        username: data.username
      }) 
      console.log("changed " + pi);
    });

    // This is executes when a user picks the location for their ship
    socketio.removeAllListeners("delete_to_client");
    socketio.on("delete_to_client", (data) => {
      let pi = this.state.isPicked;
      console.log("letter deleted: " + data.letter);
      console.log("is deleted " + pi);
      this.setState({
        isDeleted: true,
        isPicked: false,
        isEntered: false,
        isWrong: false,
        letterVal: data.letter,
        correct_answers: [],
        almost_answers: [],
        pickedVal: data.position,
        current_game: data.this_game,
        username: data.username
      }) 
      console.log("changed " + pi);
    });

    // This is executes when a user picks the location for their ship
    socketio.removeAllListeners("enter_to_client");
    socketio.on("enter_to_client", (data) => {
      this.setState({
        isEntered: true,
        isPicked: false,
        isWrong: false,
        rowVal: data.row,
        correct_answers: data.correct,
        almost_answers: data.almost,
        current_game: data.this_game,
        username: data.username
      }) 
    });

    // This is executes when a user picks the location for their ship
    socketio.removeAllListeners("wrong_to_client");
    socketio.on("wrong_to_client", (data) => {
      alert("this word is wrong");
      // this.setState({
      //   isEntered: false,
      //   isPicked: false,
      //   isWrong: true,
      //   rowVal: data.row
      // }) 

      for (let i = 1; i < 6; i++) {
        let position = "" + data.row + i;
        document.getElementById(position).innerText = "";
      }

      //document.getElementById(this.state.pickedVal).innerText = this.state.letterVal;

    });

    // // This is executes when a succesful hit is detected
    // socketio.on("hit_to_client", (data) => {
    //   this.setState({
    //     isClicked: true,
    //     isHit: true,
    //     hitVal: data.position,
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
    //     missVal: data.position,
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
    //     closeVal: data.position,
    //     current_game: data.this_game,
    //     username: data.username
    //   }) 
    // })

    // // This is displays what the victim gets on their screen
    // socketio.on("sub_to_client", (data) => {
    //   this.setState({
    //     isClicked: true,
    //     isSub: true,
    //     subVal: data.position,
    //     current_game: data.this_game
    //   }) 
    // })

    // // This is displays what the opponent missed on the player's screen
    // socketio.on("opponent_miss_to_client", (data) => {
    //   this.setState({
    //     isClicked: true,
    //     isOppMiss: true,
    //     oppMissVal: data.position,
    //     current_game: data.this_game
    //   }) 
    // })
    // Determine if the current square is a label
    
    // if(isPicked){ 
    //   document.getElementById(this.state.pickedVal).style.backgroundColor = "#074bff"; 
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

    if(isPicked) {
      //console.log(this.state.letterVal);
      document.getElementById(this.state.pickedVal).innerText = this.state.letterVal;
      // using an animation to bulg it out
      this.myRef.current = gsap.timeline()
        .to("#" + this.state.pickedVal, { duration: 0.05, scale: 1.5 })
        .to("#" + this.state.pickedVal, { duration: 0.1, scale: 1 });
    }

    if(isDeleted) {
      //console.log(this.state.letterVal);
      document.getElementById(this.state.pickedVal).innerText = "";
      // using an animation to bulg it out
      this.myRef.current = gsap.timeline()
        .to("#" + this.state.pickedVal, { duration: 0.05, scale: 1.5 })
        .to("#" + this.state.pickedVal, { duration: 0.1, scale: 1 });
    }




    //trying tofigureout why the correctness systemsisnotupdating all the time
    if(isEntered) {
      if (this.state.correct_answers.length > 0) {
        //let delay = 0;
        for (let i = 0; i < this.state.correct_answers.length; i++) {
          let position = "" + this.state.rowVal + this.state.correct_answers[i];

          // this.myRef.current = gsap.timeline()
          //   .to("#" + position, { duration: 0.5, backgroundColor: "green", delay: delay})
          document.getElementById(position).style.backgroundColor = "green";

           //delay+=0.1;
        }

        // if there only correct answers, then anything not in correct answers should be gray
        if (this.state.almost_answers.length === 0) {

          //delay = 0;
          for (let i = 1; i < 6; i++) {
            if (!this.state.correct_answers.includes(i)) {
              console.log("something_almo");
              let position = "" + this.state.rowVal + i;
              document.getElementById(position).style.backgroundColor = "gray";

              // this.myRef.current = gsap.timeline()
              //   .to("#" + position, { duration: 0.5, backgroundColor: "gray" , delay: delay})

              //delay+=0.1;
            }
          }
        }
      }

      if (this.state.almost_answers.length > 0) {
        //let delay = 0;
        for (let i = 0; i < this.state.almost_answers.length; i++) {
          let position = "" + this.state.rowVal + this.state.almost_answers[i];
          document.getElementById(position).style.backgroundColor = "yellow";

        //   this.myRef.current = gsap.timeline()
        //         .to("#" + position, { duration: 0.5, backgroundColor: "yellow" , delay: delay})

        // delay+=0.1;
        }

        //delay = 0;
        // if there are almost answers and something is notin the almost answers or the correct answers, then it should be gray
        for (let i = 1; i < 6; i++) {
          if (!this.state.almost_answers.includes(i) && !this.state.correct_answers.includes(i)) {
            console.log("something_almo");
            let position = "" + this.state.rowVal + i;

            // this.myRef.current = gsap.timeline()
            //     .to("#" + position, { duration: 0.5, backgroundColor: "gray" , delay: delay})

            //delay+=0.1;
            document.getElementById(position).style.backgroundColor = "gray";
          }
        }
      }

      ///let possible_values = [1,2,3,4,5];
      // if there areno correct answersor no almost answers then everything is gray
      if (this.state.almost_answers.length === 0 && this.state.correct_answers.length === 0) {
        //let delay = 0;
        for (let i = 1; i < 6; i++) {
          console.log("allwrong");
          let position = "" + this.state.rowVal + i;
          document.getElementById(position).style.backgroundColor = "gray";

          // this.myRef.current = gsap.timeline()
          //       .to("#" + position, { duration: 0.5, backgroundColor: "gray" , delay: delay})
          // delay+=0.1;
        }
      }

    }

    // if(isWrong) {
    //   for (let i = 1; i < 6; i++) {
    //     let position = "" + this.state.rowVal + i;
    //     document.getElementById(position).innerText = "";
    //   }
    // }
    
    // When the game starts, it allows you to attack
    if(this.props.start) {

      return (
        <div className="square" id={this.props.position} key={this.props.position}>
          {this.props.value}
        </div>
      );
    }

    // Otherwise, allow the user to pick a ship
    else {
      return (
        <div className="square" id={this.props.position} key={this.props.position}>
          {this.props.value}
        </div>
      );
    }

  }
}
export default Square;
export { score };