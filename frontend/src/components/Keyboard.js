import React from 'react';
import Key from './Key';

class Keyboard extends React.Component {
  constructor(props) {
    super(props);

  
    this.renderKey = this.renderKey.bind(this);
  }

  renderKey(letter) {
    return <Key username={this.props.username}
                letter={letter} current_game={this.props.current_game} 
                socket={this.props.socket} start={this.props.start}/>;
  }

  // Renders the board as a grid with multiple 
  // Inspiration on how to do this was gotten from this website (the react manual):
  // https://reactjs.org/tutorial/tutorial.html

  render() {
    const results = [];
    const letters = "QWERTYUIOPASDFGHJKLZXCVBNM";

  
    // for(let i = 0; i < 26; i+=9){
    //   results.push(
    //     <div className="key-board-row" key={"keyboard_" + i}>
    //       {this.renderKey(letters[i])}
    //       {this.renderKey(letters[i+1])}
    //       {this.renderKey(letters[i+2])}
    //       {this.renderKey(letters[i+3])}
    //       {this.renderKey(letters[i+4])}
    //       {this.renderKey(letters[i+5])}
    //       {this.renderKey(letters[i+6])}
    //       {this.renderKey(letters[i+7])}
    //       {this.renderKey(letters[i+8])}
    //     </div>
    //   )
    // }

    
    results.push(
      <div className="key-board-row" key={"keyboard_" + 1} id="keyboard_1">
        {this.renderKey(letters[0])}
        {this.renderKey(letters[1])}
        {this.renderKey(letters[2])}
        {this.renderKey(letters[3])}
        {this.renderKey(letters[4])}
        {this.renderKey(letters[5])}
        {this.renderKey(letters[6])}
        {this.renderKey(letters[7])}
        {this.renderKey(letters[8])}
        {this.renderKey(letters[9])}
      </div>
    )

    results.push(
      <div className="key-board-row" id="keyboard_2" key={"keyboard_" + 2}>
        {this.renderKey(letters[10])}
        {this.renderKey(letters[11])}
        {this.renderKey(letters[12])}
        {this.renderKey(letters[13])}
        {this.renderKey(letters[14])}
        {this.renderKey(letters[15])}
        {this.renderKey(letters[16])}
        {this.renderKey(letters[17])}
        {this.renderKey(letters[18])}
      </div>
    )

    results.push(
      <div className="key-board-row" id="keyboard_3" key={"keyboard_" + 3}>
        {this.renderKey("ENTER")}
        {this.renderKey(letters[19])}
        {this.renderKey(letters[20])}
        {this.renderKey(letters[21])}
        {this.renderKey(letters[22])}
        {this.renderKey(letters[23])}
        {this.renderKey(letters[24])}
        {this.renderKey(letters[25])}
        {this.renderKey("<-")}
      </div>
    )
    

    return results;
  }
}

export default Keyboard;