import { useEffect, useState } from "react";
import "./App.css";

const api_url =
  "https://raw.githubusercontent.com/tabatkins/wordle-list/main/words";

const NUM_GUESSES = 6;
const WORD_LENGTH = 5;
const color_code = {
  1: "incorrect",
  2: "misplaced",
  3: "correct",
};

function App() {
  const [answer, setAnswer] = useState("");
  const [guesses, setGuesses] = useState(new Array(NUM_GUESSES).fill(null));
  const [currentGuess, setCurrentGuess] = useState("");
  const [wordsList, setWords] = useState([]);
  const [alphabet, setAlphabet] = useState([{}]);
  const [isGameOver, setGameOver] = useState(undefined);

  useEffect(() => {
    const createAlphabet = () => {
      const a = Array.from(Array(26)).map((e, i) => i + 65);
      const b = a.map((e) => String.fromCharCode(e).toLowerCase());
      const alphabet = b.reduce((acc, e) => {
        acc[e] = 0;
        return acc;
      }, []);
      setAlphabet(alphabet);
    };

    const fetchWord = async () => {
      const response = await fetch(api_url);
      const data = await response.text();
      const words = data.split(/\r?\n/);
      const word = words[Math.floor(Math.random(0, 1) * words.length)];

      setWords(words);
      setAnswer(word);
    };

    fetchWord();
    createAlphabet();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const updateKeyboard = (guess) => {
        const letters = guess.split("");
        letters.map((letter, i) => {
          let val = 1;
          if (letter === answer[i] || alphabet[letter] === 3) {
            val = 3;
          } else if (answer.includes(letter) || alphabet[letter] === 2) {
            val = 2;
          }

          setAlphabet((cur) => ({
            ...cur,
            [letter]: val,
          }));
          return 0;
        });
      };

      if (!isGameOver) {
        if (e.key === "Enter") {
          const index = guesses.findIndex((val) => val === null);
          if (currentGuess.length < 5 || !wordsList.includes(currentGuess)) {
            const id = "guess_" + index;
            const guess = document.getElementById(id);
            guess.classList.add("invalid");
            return;
          }

          updateKeyboard(currentGuess);

          const gs = [...guesses];
          gs[index] = currentGuess;
          setGuesses(gs);
          setCurrentGuess("");
          if (answer === currentGuess) {
            setGameOver("You win!");
          } else if (index === NUM_GUESSES - 1) {
            setGameOver("You lose!");
          }
        }

        if (e.key === "Backspace") {
          setCurrentGuess(currentGuess.slice(0, -1));
          return;
        }

        if (currentGuess.length < 5 && e.keyCode >= 65 && e.keyCode <= 90) {
          setCurrentGuess((prevGuess) => prevGuess + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      const id = "guess_" + guesses.findIndex((val) => val === null);
      const guessList = document.getElementById(id).classList;
      if (guessList.contains("invalid")) {
        guessList.remove("invalid");
      }
    };
  }, [currentGuess, guesses, wordsList, answer, isGameOver, alphabet]);

  return (
    <div className="board">
      <h1>Wordle</h1>
      {guesses.map((g, i) => {
        const currentIndex = guesses.findIndex((val) => val === null);
        const isCurrentGuess = i === currentIndex;
        const id = "guess_" + i;
        return (
          <Guess
            id={id}
            key={i}
            guess={isCurrentGuess ? currentGuess : g ?? ""}
            answer={answer}
            over={currentIndex > i || currentIndex === -1}
            isCurrentGuess={isCurrentGuess}
          />
        );
      })}
      <KeyBoard letterList={alphabet} answer={answer} />
      <h3>
        {isGameOver}{" "}
        {answer && isGameOver ? "The word was " + answer + "." : ""}
      </h3>
    </div>
  );
}

function Guess({ id, guess, answer, over, isCurrentGuess }) {
  let tiles = [];

  let className = "letter";
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (over) {
      if (answer[i] === guess[i]) {
        className += " correct";
      } else if (answer.includes(guess[i])) {
        className += " misplaced";
      } else {
        className += " incorrect";
      }
    }

    tiles.push(
      <div key={i} className={className}>
        {guess[i]}
      </div>
    );
    className = "letter";
  }

  return (
    <div id={id} className="guess">
      {tiles}
    </div>
  );
}

function KeyBoard({ letterList }) {
  return (
    <div className="alphabet">
      {Object.keys(letterList).map((letter, i) => {
        const className = "lettering " + color_code[letterList[letter]];
        return (
          <div key={i} className={className}>
            {letter}
          </div>
        );
      })}
    </div>
  );
}

export default App;
