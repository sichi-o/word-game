import React from 'react';
import Board from './Board';
import Keyboard from './Keyboard';
import Lobby from './Lobby';
import Scoreboard from './Scoreboard';

class Game extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      gamerooms: this.props.game_list,
      leftroom: false,
      start: false,
      leaveAll: false,
      hasWon: false,
      winner: "",
      loser: "",
      justWon: false,
      hasLost: false
    };
  }


  render() {
    let socketio = this.props.socket;
    const leftroom = this.state.leftroom;
    const leaveAll = this.state.leaveAll;
    const start = this.state.start;

    const hasWon = this.state.hasWon;
    const hasLost = this.state.hasLost;
  
  
    // Executes when someone leaves a room
    socketio.removeAllListeners("leave_room_to_client");
    socketio.on("leave_room_to_client", (data) => {

      this.setState({
        gamerooms: data.game_list,
        leftroom: true
      })
    })

    // Executes when both players are ready to begin the game
    socketio.removeAllListeners("ready_to_client");
    socketio.on("ready_to_client", (data) => {
     console.log("START GAME");
      this.setState({
        start: true
      })
    });

    console.log("leftroom: " + leftroom + " leaveall: " + leaveAll);

    socketio.removeAllListeners("win_to_client");
    socketio.on("win_to_client", (data) => {
        this.setState({
            hasWon: true,
            winner: data.winner,
            justWon: true,
            gamerooms: data.game_list
        })
    })

    socketio.removeAllListeners("lose_to_client");
    socketio.on("lose_to_client", (data) => {
        this.setState({
            hasLost: true,
            loser: data.loser,
            gamerooms: data.game_list
        })
    })

    if(hasWon){
      alert(this.state.winner + " won the game!")
      console.log("slskskskks")
      return (
        <Lobby username={this.props.username} game_list={this.state.gamerooms} socket={socketio} />
      )
    }

    if(hasLost){
      alert(this.state.loser + " lost the game!")
      console.log("slskskskks")
      return (
        <Lobby username={this.props.username} game_list={this.state.gamerooms} socket={socketio} />
      )
    }

    // If a user left the room, then display the list of rooms
    if(leftroom){
      return (
        <Lobby username={this.props.username} game_list={this.state.gamerooms} socket={socketio} />
      )
    }

    else{
      const results = [];
      const users = [];

      for(let i = 0; i < this.props.current_game.userlist.length; i++){
        users.push(
          <div className="users" key={this.props.current_game.userlist[i].name}>{this.props.current_game.userlist[i].name}</div>
        )
      }

      
    
      // If the game has started, then display the game and scoreboard
      if(start){
        results.push(
          <div id="game-info" key={"game_info"}>
            <div id="leaver">
              <button className="leave_button" onClick={() => socketio.emit("leave_room_to_server", { this_game: this.props.current_game, user: this.props.username }) }>Leave Game</button>
            </div>
            <div id="userlist" key={"userlist"}>
              User List:
              {users}
            </div>
          </div>
        )
        results.push(
          <div className="game" key={"game"}>
                <p>The game has started!</p>
                <Scoreboard start={true} socket={socketio}/>
                <div className="container">
                  <div className="game-board">
                    <Board username={this.props.username} current_game={this.props.current_game} socket={socketio} start={true}/>
                  </div>
                  <Keyboard username={this.props.username} current_game={this.props.current_game} socket={socketio} start={true}/>
                </div>
          </div>
        )
      }

      // Otherwise prompt the user to pick their ships
      else{
        results.push(
          <div id="game-info" key={"game_info"}>
            <div id="leaver">
              <p id="time"></p>
              <button className="leave_button" onClick={() => socketio.emit("leave_room_to_server", { this_game: this.props.current_game, user: this.props.username }) }>Leave Game</button>
            </div>
            <div id="userlist" key={"userlist"}>
              User List:
              {users}
            </div>
          </div>
        )
        results.push(
          <div className="game" key={"game"}>
                <p className="ready">Select the positions of 7 ships by clicking 7 squares. Your opponent is getting ready.</p>
                <Scoreboard start={false} socket={socketio}/>
                <div className="container">
                  <div className="game-board">
                    <Board username={this.props.username} current_game={this.props.current_game} socket={socketio} start={false}/>
                  </div>
                </div>
                <div className="keyboard-container">
                  <Keyboard username={this.props.username} current_game={this.props.current_game} socket={socketio} start={false}/>
                </div>
                
          </div>
        )
      }

      return results;
    }   
  }
}

export default Game;