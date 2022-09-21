import React from 'react';
import Square from './Square';


class Board extends React.Component {
  constructor(props) {
    super(props);

    this.renderSquare = this.renderSquare.bind(this);
    this.renderLabel = this.renderLabel.bind(this);
  }

  renderSquare(label, position) {
    return <Square username={this.props.username} isLabel="false" value={label} 
                   position={position} current_game={this.props.current_game} 
                   socket={this.props.socket} start={this.props.start}/>;
  }

  renderLabel(label) {
    return <Square isLabel="true" value={label} socket={this.props.socket}/>;
  }

  // Renders the board as a grid with multiple 
  // Inspiration on how to do this was gotten from this website (the react manual):
  // https://reactjs.org/tutorial/tutorial.html

  render() {
    const results = [];
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  
    for(let i = 0; i < 5; i++){
      
      results.push(
        <div className="board-row" key={"board_" + i}>
          {this.renderSquare(" ", letters[0] + (i+1))}
          {this.renderSquare(" ", letters[1] + (i+1))}
          {this.renderSquare(" ", letters[2] + (i+1))}
          {this.renderSquare(" ", letters[3] + (i+1))}
          {this.renderSquare(" ", letters[4] + (i+1))}
          {this.renderSquare(" ", letters[5] + (i+1))}
        </div>
      )
    }

    return results;
  }
}

export default Board;