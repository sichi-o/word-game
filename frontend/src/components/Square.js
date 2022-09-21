import React from 'react';
let score = 7;

class Square extends React.Component {

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
      isClose: false,
      subVal: "",
      hitVal: "",
      missVal: "",
      oppMissVal: "",
      pickedVal: "",
      closeVal: "",
      isClicked: false
    } 

    this.pick = this.pick.bind(this);
    this.attack = this.attack.bind(this);
  }

  // Picks a user's ship at the beginning
  pick(){ 
    let socketio = this.props.socket;

    // Emits a signal to the backend to pick a ship at a location
    socketio.emit("pick_to_server", { user: this.state.username, this_game: this.state.current_game, position: this.props.position})
  }

  // Attacks another user's ship
  attack(){
    let socketio = this.props.socket;
    let victim_index;

    // Caluclates the index of the victim
    if(this.state.current_game.userlist[0].name == this.state.username.name){
      victim_index = 1;
    }
    else{
      victim_index = 0;
    }
    
    // Emits a signal to the backend to attack a server
    socketio.emit("attack_to_server", { user: this.state.username, victim_index: victim_index, this_game: this.state.current_game, position: this.props.position});
    
  }

  render() {
    const isLabel = this.props.isLabel;
    let socketio = this.props.socket;
    const isPicked = this.state.isPicked;
    const current_game = this.state.current_game;
    const isHit = this.state.isHit;
    const isMiss = this.state.isMiss;
    const isOppMiss = this.state.isOppMiss;
    const isSub = this.state.isSub;
    const isClose = this.state.isClose;
    const isClicked = this.state.isClicked;
    const username = this.state.username;
    
    // // This is executes when a user picks the location for their ship
    // socketio.removeAllListeners("pick_to_client");
    // socketio.on("pick_to_client", (data) => {
    //   let pi = this.state.isPicked;
    //   console.log("position picked: " + data.position);
    //   console.log("is picked " + pi);
    //   this.setState({
    //     isPicked: true,
    //     pickedVal: data.position,
    //     current_game: data.this_game,
    //     username: data.username
    //   }) 
    //   console.log("changed " + pi);
    // });

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
    if(isLabel === "false"){ 
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

      // When the game starts, it allows you to attack
      if(this.props.start){
  
        return (
          <div className="square" id={this.props.position} key={this.props.position}>
            {this.props.value}
          </div>
        );
      }

      // Otherwise, allow the user to pick a ship
      else{
        return (
          <div className="square" id={this.props.position} key={this.props.position}>
            {this.props.value}
          </div>
        );
      }
    }
    
    // If is a lable then display a label
    else {
      return (   
        <div className="label" key={this.props.position + "_label"}>
          <p className='label_val'>
            {this.props.value}
          </p>
        </div>
      );
    }
  }
}
export default Square;
export { score };