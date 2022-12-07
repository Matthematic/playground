import React from "react";
import "./App.css";

function getQuote(quotes, cb) {
  const randomNumber = Math.floor(Math.random() * quotes.length);
  const text = quotes[randomNumber].text;
  cb(text);
}

function isKeyPrintable(e) {
  let keycode = e.keyCode;

  let valid =
    (keycode > 47 && keycode < 58) || // number keys
    keycode === 32 || keycode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
    (keycode > 64 && keycode < 91) || // letter keys
    (keycode > 95 && keycode < 112) || // numpad keys
    (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
    (keycode > 218 && keycode < 223);   // [\]' (in order)

  return valid;
}

/**
 * If str1 is a source of truth, compare with str2 to determine if str2 is currently inside of a word.
 * e.g. "This is a sentence." => "This is a senten"
 * @param {*} str1 
 * @param {*} str2 
 */
function withinWord(str1, str2) {
  // Get the first char froms str1 thats after the end of str2, if it is NOT a space, then we are within a word
  return str1[str2.length] === ' ' ? false : true;
}

const TyperStateContext = React.createContext();
const TyperSetterContext = React.createContext();

// Root component for the typing test
const Typer = () => {
  const [input, setInput] = React.useState([]); // array of words
  const [isGameInProgress, setIsGameInProgress] = React.useState(false);
  const [isGameFocused, setIsGameFocused] = React.useState(false);
  const [timings, setTimings] = React.useState({ start: undefined, end: undefined });
  const [position, setPosition] = React.useState({ wordIdx: 0, letterIdx: 0 });
  const [quote, setQuote] = React.useState([]); // array of words
  const [allQuotes, setAllQuotes] = React.useState([]);
  const [quoteModified, setQuoteModified] = React.useState(false);
  const containerRef = React.useRef();

  React.useEffect(() => {
    fetch("https://type.fit/api/quotes")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Response is not OK');
      })
      .then((data) => setAllQuotes(data))
      .catch(e => {
        const message = "This message means that the web server supplying the quotes is down. Please refresh or try again later."
        setAllQuotes([{ text: message }]);
        console.error(e);
      })
  }, [setAllQuotes, setQuote]);

  React.useEffect(() => {
    // split into words
    if (allQuotes.length) getQuote(allQuotes, (q) => setQuote(q.split(' ')));
  }, [allQuotes]);

  return (
    <div className="typer" ref={containerRef}>
      <TyperSetterContext.Provider
        value={{
          setInput,
          setIsGameInProgress,
          setQuote,
          setQuoteModified,
          setIsGameFocused,
          setTimings,
          setPosition,
        }}
      >
        <TyperStateContext.Provider
          value={{
            input,
            isGameInProgress,
            quote,
            allQuotes,
            quoteModified,
            isGameFocused,
            timings,
            position,
            containerRef
          }}
        >
          <Wrapper />
        </TyperStateContext.Provider>
      </TyperSetterContext.Provider>
    </div>
  );
};

/**
 * Wraps the main components. This is necessary to memoize since it is the direct child of the Context Provider
 */
const Wrapper = React.memo(() => {
  return (
    <div className="wrapper">
      <Quote />
      <Overlay />
    </div>
  );
});

function moveToLetter(wordIdx, letterIdx, containerRef, caretRef, side = "left") {
  const letter = containerRef.current.querySelector(
    `.word-${wordIdx} .letter-${letterIdx}`
  );

  if (letter) {
    const quote = containerRef.current.querySelector(".quote");
    const letterRect = letter.getBoundingClientRect();
    const quoteRect = quote.getBoundingClientRect();

    caretRef.current.style.left = `${Math.max(
      side === "left" ? letterRect.left - quoteRect.left - 1 : letterRect.right - quoteRect.left - 1,
      0
    )}px`;
    caretRef.current.style.top = `${letterRect.top - quoteRect.top + 3}px`;
    letter.scrollIntoView();
  }
  else if (letterIdx > 0) { // move to the right side of the previous letter
    moveToLetter(wordIdx, letterIdx - 1, containerRef, caretRef, "right");
  }
}

const Caret = () => {
  const stateCtx = React.useContext(TyperStateContext);
  const caretRef = React.useRef();

  React.useEffect(() => {
    moveToLetter(stateCtx.position.wordIdx, stateCtx.position.letterIdx, stateCtx.containerRef, caretRef);
  }, [stateCtx]);

  return <span className={`caret ${stateCtx.isGameInProgress ? '' : 'blur'}`} ref={caretRef} />;
};

const HiddenInput = () => {
  const stateCtx = React.useContext(TyperStateContext);
  const setterCtx = React.useContext(TyperSetterContext);
  const ref = React.useRef();
  const combinedWords = combineWordArrays(stateCtx.input, stateCtx.quote);

  // Handle key inputs during the game
  const onKeyDown = (e) => {
    if (e.key === "Backspace" && stateCtx.isGameInProgress) {
      if (combinedWords[stateCtx.position.wordIdx][stateCtx.position.letterIdx - 1] !== undefined) { // go back a letter if we can
        setterCtx.setPosition({ wordIdx: stateCtx.position.wordIdx, letterIdx: stateCtx.position.letterIdx - 1 });
      }
      else if (combinedWords[stateCtx.position.wordIdx - 1] !== undefined) { // else go back a word if we can
        setterCtx.setPosition({ wordIdx: stateCtx.position.wordIdx - 1, letterIdx: combinedWords[stateCtx.position.wordIdx - 1].length });
      }

      // If there is input and one letter back exists, 
      if (stateCtx.input.length && stateCtx.position.letterIdx > 0 && stateCtx.input[stateCtx.position.wordIdx][stateCtx.position.letterIdx - 1]) {
        const newInput = [...stateCtx.input];
        newInput[stateCtx.position.wordIdx] = newInput[stateCtx.position.wordIdx].slice(0, -1);
        setterCtx.setInput(newInput.filter(Boolean));
      }
    } else if (e.key === "Escape" && stateCtx.isGameInProgress) {
      setterCtx.setIsGameInProgress(false);
      setterCtx.setTimings({ start: stateCtx.timings.start, end: Date.now() });
      setterCtx.setPosition({ wordIdx: 0, letterIdx: 0 });
    } else if (e.code === "Space" && !stateCtx.isGameInProgress) {
      setterCtx.setIsGameInProgress(true);
      if (stateCtx.input.length) {
        setterCtx.setInput([]);
        getQuote(stateCtx.allQuotes, (q) => setterCtx.setQuote(q.split(' ')));
      }
      setterCtx.setTimings({ start: Date.now(), end: undefined });
    }
    if (e.code === "Space" && stateCtx.isGameInProgress) { // Move to next word
      // If there is no next word to jump to, end the game
      if (stateCtx.quote[stateCtx.position.wordIdx + 1] === undefined) {
        setterCtx.setIsGameInProgress(false);
        setterCtx.setTimings({ start: stateCtx.timings.start, end: Date.now() });
        setterCtx.setPosition({ wordIdx: 0, letterIdx: 0 });
      }
      else if (stateCtx.input[stateCtx.position.wordIdx]) { // increment wordIdx and add a new blank word to input array
        setterCtx.setPosition({ wordIdx: stateCtx.position.wordIdx + 1, letterIdx: 0 });
      }
    }
    else if (isKeyPrintable(e)) {
      if (stateCtx.isGameInProgress) { // tack typed key onto end of last word
        const copy = [...stateCtx.input];
        if (copy[stateCtx.position.wordIdx]) {
          copy[stateCtx.position.wordIdx] += e.key;
        }
        else {
          copy.push(e.key);
        }

        setterCtx.setInput(copy);

        // If there is no next letter OR word to jump to, end the game
        if (stateCtx.quote[stateCtx.position.wordIdx][stateCtx.position.letterIdx + 1] === undefined
          && stateCtx.quote[stateCtx.position.wordIdx + 1] === undefined) {
          setterCtx.setIsGameInProgress(false);
          setterCtx.setTimings({ start: stateCtx.timings.start, end: Date.now() });
          setterCtx.setPosition({ wordIdx: 0, letterIdx: 0 });
        }
        else {
          setterCtx.setPosition({ wordIdx: stateCtx.position.wordIdx, letterIdx: stateCtx.position.letterIdx + 1 }); // increment letterIdx
        }
      }
    }
  };

  // Start the game when the user clicks on the input
  const onClick = () => {
    if (!stateCtx.isGameInProgress && combinedWords.join('').length >= stateCtx.quote.length) {
      setterCtx.setIsGameInProgress(true);
    }
  };

  // Pause the game when the game loses focus.
  const onBlur = () => {
    setterCtx.setIsGameFocused(false);
  }

  return (
    <input
      readOnly
      className="hidden-input"
      type="text"
      value=""
      onKeyDown={onKeyDown}
      onClick={onClick}
      onBlur={onBlur}
      ref={ref}
    />
  );
};

function combineWordArrays(inputArr, quoteArr) {
  if (!quoteArr || !quoteArr.length || !inputArr) {
    return [];
  }
  const combinedWords = quoteArr.map((quoteWord, quoteWordIdx) => {
    // if user has extra chars on the end of this word then grab them and add them to quoteWord
    if (inputArr[quoteWordIdx] && inputArr[quoteWordIdx].length > quoteWord.length) {
      return quoteWord + inputArr[quoteWordIdx].substring(quoteWord.length);
    }
    return quoteWord;
  });
  return combinedWords;
}

const Quote = () => {
  const stateCtx = React.useContext(TyperStateContext);
  const combinedWords = combineWordArrays(stateCtx.input, stateCtx.quote) || [];

  return (
    <div className={"quote"}>
      <div className={!stateCtx.isGameInProgress || !stateCtx.isGameFocused ? "letters blur" : "letters"}>
        {combinedWords.map((t, i) => (
          <Word
            key={`word-${i}`}
            value={t}
            index={i}
          />
        ))}
      </div>
      <Caret />
      <HiddenInput />
      {stateCtx.isGameInProgress && stateCtx.isGameFocused ? (
        <>
          <hr />
          <TimeLabel />
        </>
      ) : null}
    </div>
  );
};

// This function assumes the strings are of equal length
function getAccuracy(str1, str2) {
  if (!str1.length) {
    return 0;
  }
  let differentChars = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) {
      differentChars++;
    }
  }

  return (((str1.length - differentChars) / str1.length) * 100).toPrecision(3);
}

const Overlay = () => {
  const stateCtx = React.useContext(TyperStateContext);
  const setterCtx = React.useContext(TyperSetterContext);

  const onStart = () => {
    setterCtx.setIsGameInProgress(true);
    if (stateCtx.input.length) {
      setterCtx.setInput([]);
      getQuote(stateCtx.allQuotes, (q) => setterCtx.setQuote(q.split(' ')));
    }
    setterCtx.setTimings({ start: Date.now(), end: undefined });
    document.querySelector(".hidden-input").focus();
    setterCtx.setIsGameFocused(true);
  };

  if (!stateCtx.isGameInProgress) {
    const numCorrectWords = stateCtx.quote.reduce((accumulator, currentValue, i) => {
      if (stateCtx.input[i] === currentValue) {
        return accumulator + 1;
      }
      return accumulator;
    },
      0);
    const timeSeconds = (stateCtx.timings.end - stateCtx.timings.start) / 1000;
    const wpm = ((numCorrectWords / timeSeconds) * 60).toPrecision(3);

    return (
      <div className="overlay" onClick={onStart}>
        <div className="overlay-inner">
          <h2>{stateCtx.isGameFocused ? 'spacebar' : 'click'}  to begin</h2>
          {timeSeconds && !stateCtx.isGameInProgress ? (
            <>
              <div>{wpm} wpm | {getAccuracy(stateCtx.input, stateCtx.quote)}%</div>
            </>
          ) : null}
        </div>
      </div>
    )
  }

  const onResume = () => {
    setterCtx.setIsGameInProgress(true);
    document.querySelector(".hidden-input").focus();
    setterCtx.setIsGameFocused(true);
  }

  if (!stateCtx.isGameFocused) {
    return (
      <div className="overlay" onClick={onResume}>
        <div className="overlay-inner">
          <h2>click to resume</h2>
        </div>
      </div>
    );
  }
  else {
    return null;
  }


};

const Letter = React.memo(({ value, index, isCorrect }) => {
  let colorVal = "";
  switch (isCorrect) {
    case 1:
      colorVal = "correct-letter";
      break;
    case 0:
      colorVal = "extra-letter";
      break;
    case -1:
      colorVal = "incorrect-letter";
      break;
    default:
      colorVal = "";
  }

  return <span className={`letter letter-${index} ${colorVal}`}>{value}</span>;
});

const Word = ({ value, index }) => {
  const stateCtx = React.useContext(TyperStateContext);

  if (!value.length) {
    return null;
  }

  const isLetterCorrect = (wordIdx, letterIdx) => {
    if (wordIdx === undefined || letterIdx === undefined || !stateCtx.input.length || !stateCtx.quote.length || !stateCtx.input[wordIdx] || !stateCtx.input[wordIdx][letterIdx]) {
      return undefined;
    }
    else if (stateCtx.quote[wordIdx][letterIdx] === stateCtx.input[wordIdx][letterIdx]) {
      return 1;
    }
    else if (!stateCtx.quote[wordIdx][letterIdx]) {
      return 0
    }
    else if (stateCtx.quote[wordIdx][letterIdx] !== stateCtx.input[wordIdx][letterIdx]) {
      return -1;
    }

    return undefined;
  }

  return (
    <span className={`word word-${index}`}>
      {[...value].map((letter, i) => (
        <Letter
          key={`word-${index}-letter-${i}`}
          value={letter}
          index={i}
          isCorrect={isLetterCorrect(index, i)}
        />
      ))}
    </span>
  );
}

const TimeLabel = () => {
  const stateCtx = React.useContext(TyperStateContext);
  const [timeElapsed, setTimeElapsed] = React.useState(0);

  React.useEffect(() => {
    let timer;
    if (stateCtx.isGameFocused && stateCtx.isGameInProgress) {
      timer = setInterval(() => {
        setTimeElapsed(timeElapsed + 1);
      }, 1000)
    }
    else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [stateCtx.isGameFocused, stateCtx.isGameInProgress, timeElapsed, setTimeElapsed]);

  return <label className="time-label">{timeElapsed}</label>;
};

function App() {
  return (
    <div className="app">
      <Typer />
    </div>
  );
}

export default App;
