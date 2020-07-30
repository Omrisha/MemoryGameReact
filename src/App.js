//Import React frameworks, CSS and NodeJS_server
import React from 'react';

import './assets/font-awesome-4.7.0/css/font-awesome.css';
import './assets/css/bootstrap.css';

//Creat react component
class App extends React.Component
{
  
  //Creating state which will hold sole values
  constructor(props) {
    super(props);
    this.state = {
      modal:'',
      card:'',
      cards:'',
      deck:'',
      moves:0,
      counter:0,
      stars:'',
      matchedCard:'',
      starsList:'',
      closeicon:'',
      openedCards:[],
      ID:0,
      P1Name:'P1Name_PlaceHolder',
      P2Name:'P2Name_PlaceHolder',
      Ended:0
    }
   
    //Binding events to the functions with APP context
    this.saveNames = this.saveNames.bind(this);
    this.startGame = this.startGame.bind(this);
    this.cardOpen = this.cardOpen.bind(this);
    this.matched = this.matched.bind(this);
    this.unmatched = this.unmatched.bind(this);
    this.disable = this.disable.bind(this);
    this.enable = this.enable.bind(this);
    this.moveCounter = this.moveCounter.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.congratulations = this.congratulations.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.playAgain = this.playAgain.bind(this);
  }
 
  //This function runs when the elements are attached to the html document in browser. 
  //This function will assign values to states.
  componentDidMount() {

    this.fetchUsers();

    //getting cards layout
    this.state.card = document.getElementsByClassName("card");
    this.state.cards = [...this.state.card];

    //getting cards deck layout
    this.state.deck = document.getElementById("card-deck");

    //initizlizing moves which determines how many moves have been made
    //counter is the move counter layout in html
    this.state.moves = 0;
    this.state.counter = document.getElementsByClassName("moves");

    //getting stars layout in html
    this.state.stars = document.querySelectorAll(".fa-star");

    //getting matched cards
    this.state.matchedCard = document.getElementsByClassName("match");

    //getting stars list
    this.state.starsList = document.querySelectorAll(".stars li");

    //getting result modal(popup) close button layout
    this.state.closeicon = document.querySelector(".close");

    //getting result modal(popup) layout
    this.state.modal = document.getElementById("popup1");
   
    //array to store opened cards
    this.state.openedCards = [];

    //initializing variables for timer 
    this.finalTime = 0;
     this.second = 0;
      this.minute = 0;
    this.hour = 0;
    this.timer = document.querySelector(".timer");
    this.interval = 0;
   
    //assigning events to the 1. card display, 2. card open. 3.result modal(popup)
    for (var i = 0; i < this.state.cards.length; i++)
    {
      this.state.card = this.state.cards[i];
      this.state.card.addEventListener("click", this.displayCard);
      this.state.card.addEventListener("click", this.cardOpen,this);
      this.state.card.addEventListener("click", this.congratulations);
    }

    //start game
    document.body.onload = this.startGame();

  }
  
  //function to shuffel the array ofcards passed as a parameter
  shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
  }
  
  //Get users names from NodeJS API server
  //`http://localhost:4000/` + queryString
  //`JsonTest.json`
  fetchUsers() {

    const queryString = new URLSearchParams(window.location.search).get('username');
    //const fetchString = `http://localhost:4000/` + queryString;
    const fetchString = `https://memorygameserver.herokuapp.com/` + queryString;
    //console.log(fetchString);

    fetch(fetchString, {
      mode: 'cors',
      //credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {

        console.log('Success:', data);
                
        this.setState({
          ID:data[0].id,
          P1Name:data[0].player1_username,
          P2Name:data[0].player2_username,
          Ended:data[0].ended
        });

      })
      .catch(error => this.setState({ error, isLoading: false }));
  }

  //function to start the game
  startGame() {

    let CONTEXT = this;
    this.state.openedCards = [];

    // shuffle deck
    this.state.cards = this.shuffle(this.state.cards);

    // remove all exisiting classes from each card
    for (var i = 0; i < this.state.cards.length; i++) {
        this.state.deck.innerHTML = "";
        [].forEach.call(this.state.cards, function (item) {
          CONTEXT.state.deck.appendChild(item);
        });
        this.state.cards[i].classList.remove("show", "open", "match", "disabled");
    }

    // reset moves
    this.state.moves = 0;
    this.state.counter.innerHTML = this.state.moves;

    //reset timer
    this.second = 0;
    this.minute = 0;
    this.hour = 0;
    var timer = document.getElementsByClassName("timer");
    timer.innerHTML = "0 mins 0 secs";
    clearInterval(this.interval);
}

  //display cards function
  displayCard = function () {
    this.classList.toggle("open");
    this.classList.toggle("show");
    this.classList.toggle("disabled");
  };

  //invoked when card is opened
  cardOpen(element) {
    
    //store the opened card in a state "openedCards". 
    //If 2 cards are opened we check if they are matched or not
    this.state.openedCards.push(element.target);
    var len = this.state.openedCards.length;
    if (len === 2) {
        this.moveCounter();

        //set current player name color
        if (this.state.moves%2==0){
          document.getElementById("p1name").style.backgroundColor="#ffc107";
          document.getElementById("p2name").style.backgroundColor="white";
        }
        if (this.state.moves%2==1){
          document.getElementById("p1name").style.backgroundColor="white";
          document.getElementById("p2name").style.backgroundColor="#ffc107";
        }

        if (this.state.openedCards[0].type === this.state.openedCards[1].type) {
            //when cards are matched invoke this function
            this.matched();
        } else {
            //when cards do not match invoke this function
            this.unmatched();
        }
    }

};

  //when 2 cards are matched this function is invoked
  matched() {
    
    //marking cards as matched
    this.state.openedCards[0].classList.add("match", "disabled");
    this.state.openedCards[1].classList.add("match", "disabled");
    this.state.openedCards[0].classList.remove("show", "open", "no-event");
    this.state.openedCards[1].classList.remove("show", "open", "no-event");
    this.state.openedCards = [];

    if (this.state.moves%2==0) {
        document.getElementById("s2").value = parseInt(document.getElementById("s2").value)+1;
    } else {
        document.getElementById("s1").value = parseInt(document.getElementById("s1").value)+1;
    } 
    
}

  //when 2 cards are not matched this function is invoked
  unmatched() {
    //marking cards as unmatched
    let CONTEXT = this;
    this.state.openedCards[0].classList.add("unmatched");
    this.state.openedCards[1].classList.add("unmatched");
    this.disable();
    setTimeout(function () {
      CONTEXT.state.openedCards[0].classList.remove("show", "open", "no-event", "unmatched");
      CONTEXT.state.openedCards[1].classList.remove("show", "open", "no-event", "unmatched");
      CONTEXT.enable();
      CONTEXT.state.openedCards = [];
    }, 1100);
}

  disable() {
    //disabling the cards
    Array.prototype.filter.call(this.state.cards, function (card) {
        card.classList.add('disabled');
    });
}

  enable() {
    //enabeling the cards
    let CONTEXT = this;
    Array.prototype.filter.call(this.state.cards, function (card) {
        card.classList.remove('disabled');
        for (var i = 0; i < CONTEXT.state.matchedCard.length; i++) {
          CONTEXT.state.matchedCard[i].classList.add("disabled");
        }
    });
}

  //When a move is made this function is invoked
  moveCounter() {
    //we increment the move state by 1
    this.state.moves++;
    //show the total moves on the html document
    this.state.counter[0].innerHTML = this.state.moves;

    //if the first move is made start the timer
    if (this.state.moves == 1) {
        this.second = 0;
        this.minute = 0;
        this.hour = 0;
        this.startTimer();
    }

}

  //this function is used to start the
  startTimer() {
    let CONTEXT = this;
    this.interval = setInterval(function () {
      CONTEXT.timer.innerHTML = CONTEXT.minute + "mins " + CONTEXT.second + "secs";
      CONTEXT.second++;
        if (CONTEXT.second == 60) {
          CONTEXT.minute++;
          CONTEXT.second = 0;
        }
        if (CONTEXT.minute == 60) {
          CONTEXT.hour++;
          CONTEXT.minute = 0;
        }
    }, 1000); //incrementing the timer every 1sec
}

//this function is used to show the result modal(popup). It is invoked when all cards are matched
congratulations() {
    if (this.state.matchedCard.length == 16) {

        //stop timer
        clearInterval(this.interval);
        this.finalTime = this.timer.innerHTML;

        //Showing the stats in the popup
        this.state.modal.classList.add("show");
        document.getElementById("finalMove").innerHTML = this.state.moves;
        document.getElementById("totalTime").innerHTML = this.finalTime;

        //if player 1 score is greater than 2
        if (parseInt(document.getElementById("s1").value)>parseInt(document.getElementById("s2").value)){
            document.getElementById("winnersname").innerHTML = this.state.P1Name + " is in the lead!";
        } 
        
        //if player 2 score is greater than 1
        if (parseInt(document.getElementById("s1").value)<parseInt(document.getElementById("s2").value)){
            document.getElementById("winnersname").innerHTML = this.state.P2Name + " is in the lead!";
        }

        //if both players have save score
        if (parseInt(document.getElementById("s1").value) == parseInt(document.getElementById("s2").value)){
            document.getElementById("winnersname").innerHTML = "You both have the same score!";
        }

        //closeicon on modal
        this.closeModal();
    };
}

//this function closes the result modal (popup)
  closeModal() {
    let CONTEXT = this;
    this.state.closeicon.addEventListener("click", function (e) {
      CONTEXT.state.modal.classList.remove("show");
      CONTEXT.startGame();
    });
}

  //play again function to start the game again
  playAgain() {
    this.state.modal.classList.remove("show");
    this.startGame();
  }

  //saves the scores and play game
  saveNames()
  {
    //display game
    document.getElementById("main").style.visibility = "visible";

    //set p1name color
    document.getElementById("p1name").style.backgroundColor="#ffc107";
    document.getElementById("p2name").style.backgroundColor="white";

    this.playAgain();
  }

  //this is react function used to paint the display on the screen
  render()
  {
    return(   
        
    <div >    

      <nav className="navbar navbar-expand-lg navbar-dark" style={{backgroundColor: "#3b5998"}}>
       <a className="navbar-brand" href="index.php">FaceAfeka MemoryGame</a>
       <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
         <span className="navbar-toggler-icon"></span>
       </button>
     
       <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
       </div>
     </nav>

     <div className="header1">
       <br/>
       <div id="p1name">Player #1 name: {this.state.P1Name}</div>       
       <div><label for="s1">Score: </label>
       <input id="s1" name="s1" type="number" min="0" max="100" value="0" disabled />
       </div>
       <br/>
       <div id="p2name">Player #2 name: {this.state.P2Name}</div>
       <div>
       <label for="s2">Score: </label>
       <input id="s2" name="s2" type="number" min="0" max="100" value="0" disabled />
       </div>
       <br/>
       <input id="bt1" type="button" value="Start a game!" onClick={this.saveNames} />
   </div>

    <div id="main" className="header1" style={{visibility: "collapse"}}>

       <div style={{alignItems: "center"}}>

           <section className="score-panel">
   
               <span className="moves">0</span> Move(s)
   
               <div className="timer">
               </div>
   
           </section>
   
           <ul className="deck" id="card-deck">
               <li className="card" type="diamond">
                   <i className="fa fa-diamond"></i>
               </li>
               <li className="card" type="plane">
                   <i className="fa fa-paper-plane-o"></i>
               </li>
               <li className="card match" type="anchor">
                   <i className="fa fa-anchor"></i>
               </li>
               <li className="card" type="bolt">
                   <i className="fa fa-bolt"></i>
               </li>
               <li className="card" type="cube">
                   <i className="fa fa-cube"></i>
               </li>
               <li className="card match" type="anchor">
                   <i className="fa fa-anchor"></i>
               </li>
               <li className="card" type="leaf">
                   <i className="fa fa-leaf"></i>
               </li>
               <li className="card" type="bicycle">
                   <i className="fa fa-bicycle"></i>
               </li>
               <li className="card" type="diamond">
                   <i className="fa fa-diamond"></i>
               </li>
               <li className="card" type="bomb">
                   <i className="fa fa-bomb"></i>
               </li>
               <li className="card" type="leaf">
                   <i className="fa fa-leaf"></i>
               </li>
               <li className="card" type="bomb">
                   <i className="fa fa-bomb"></i>
               </li>
               <li className="card open show" type="bolt">
                   <i className="fa fa-bolt"></i>
               </li>
               <li className="card" type="bicycle">
                   <i className="fa fa-bicycle"></i>
               </li>
               <li className="card" type="plane">
                   <i className="fa fa-paper-plane-o"></i>
               </li>
               <li className="card" type="cube">
                   <i className="fa fa-cube"></i>
               </li>
           </ul>
           
           <div id="popup1" className="overlay">
               <div className="popup">
                   <span style={{pointer:"cursor"}} className="close" >X</span>
                   <div className="content-1">
                       That was a great game!
                   </div>
                   <div className="content-2">
                       <p>You guys used <span id="finalMove" > </span> moves </p>
                       <p>in <span id="totalTime" > </span> </p>
                   </div>
                   <div className="content-2">
                       <p id="winnersname"></p>
                   </div>
                   <button id="play-again" onClick={this.saveNames}>
                       <a>Save and Play again!</a>
                   </button>
               </div>
           </div>
   
       </div>
       
   </div>

    <div class="footer-copyright text-center py-3">
        © 2020 Copyright: <a href="#"> FaceAfeka - Made by [Omri Shapira & Barak Ben-Artzy]</a>
    </div>

   </div>);
  }

}     


//exporting the APP class 
export default App;
