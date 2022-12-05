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
    keycode == 32 || keycode == 13 || // spacebar & return key(s) (if you want to allow carriage returns)
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

const TyperContext = React.createContext();

// Root component for the typing test
const Typer = () => {
  const [input, setInput] = React.useState([]);
  const [isGameInProgress, setIsGameInProgress] = React.useState(false);
  const [startTime, setStartTime] = React.useState();
  const [endTime, setEndTime] = React.useState();
  const [quote, setQuote] = React.useState("");
  const [allQuotes, setAllQuotes] = React.useState([]);
  const [quoteModified, setQuoteModified] = React.useState(false);
  const containerRef = React.useRef();

  React.useEffect(() => {
    console.log("fetching");
    fetch("https://type.fit/api/quotes")
      .then((res) => res.json())
      .then((data) => setAllQuotes(data));
  }, [setAllQuotes]);

  React.useEffect(() => {
    if (allQuotes.length) getQuote(allQuotes, setQuote);
  }, [allQuotes]);

  return (
    <div className="typer" ref={containerRef}>
      <TyperContext.Provider
        value={{
          input,
          setInput,
          isGameInProgress,
          setIsGameInProgress,
          startTime,
          setStartTime,
          endTime,
          setEndTime,
          quote,
          setQuote,
          allQuotes,
          quoteModified,
          setQuoteModified,
          containerRef
        }}
      >
        <Wrapper />
      </TyperContext.Provider>
    </div>
  );
};

/**
 * Wraps the main components. This is necessary to memoize since it is the direct child of the Context Provider
 */
const Wrapper = React.memo(() => {
  return (
    <div className="wrapper">
      <Paragraph />
      <Overlay />
    </div>
  );
});

const Caret = () => {
  const ctx = React.useContext(TyperContext);
  const caretRef = React.useRef();

  React.useEffect(() => {
    const currentLetter = ctx.containerRef.current.querySelector(
      `.letter-${ctx.input.length}`
    );
    if (currentLetter) {
      const paragraph = ctx.containerRef.current.querySelector(".paragraph");
      const letterRect = currentLetter.getBoundingClientRect();
      const paragraphRect = paragraph.getBoundingClientRect();
      if (currentLetter) {
        caretRef.current.style.left = `${Math.max(
          letterRect.left - paragraphRect.left - 1,
          0
        )}px`;
        caretRef.current.style.top = `${letterRect.top - paragraphRect.top + 3
          }px`;
      }
      currentLetter.scrollIntoView();
    }
  }, [ctx]);

  return <span className="caret" ref={caretRef} />;
};

const HiddenInput = () => {
  const ctx = React.useContext(TyperContext);
  const ref = React.useRef();

  React.useEffect(() => {
    if (ctx.isGameInProgress && ctx.input.length === ctx.quote.length) {
      ctx.setIsGameInProgress(false);
      ctx.setEndTime(Date.now());
    }
  }, [ctx]);

  const onKeyDown = (e) => {
    if (e.key === "Backspace" && ctx.isGameInProgress) {
      if (ctx.input.length) {
        const newInput = [...ctx.input];
        newInput.pop();
        ctx.setInput(newInput);
      }
    } else if (e.key === "Escape" && ctx.isGameInProgress) {
      ctx.setIsGameInProgress(false);
    } else if (e.code === "Space" && !ctx.isGameInProgress) {
      ctx.setIsGameInProgress(true);
      if (ctx.input.length) {
        ctx.setInput([]);
        getQuote(ctx.allQuotes, ctx.setQuote);
      }
      ctx.setStartTime(Date.now());
      ctx.setEndTime();
    }
    else if (isKeyPrintable(e)) {
      if (ctx.isGameInProgress && ctx.input.length < ctx.quote.length) {
        ctx.setInput([...ctx.input, e.key]);
      }
    }
  };

  const onFocus = () => {
    if (!ctx.isGameInProgress && ctx.input.length < ctx.quote.length) {
      ctx.setIsGameInProgress(true);
    }
  };

  return (
    <input
      readOnly
      className="hidden-input"
      type="text"
      value=""
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      ref={ref}
    />
  );
};

const Paragraph = () => {
  const ctx = React.useContext(TyperContext);

  return (
    <div className={"paragraph"}>
      <div className={!ctx.isGameInProgress ? "letters blur" : "letters"}>
        {[...ctx.quote].map((t, i) => (
          <Letter
            key={`${t}-${i}`}
            value={t}
            index={i}
            typedValue={ctx.input[i]}
          />
        ))}
      </div>
      <Caret />
      <HiddenInput />
      {ctx.isGameInProgress ? (
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
  let differentChars = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) {
      differentChars++;
    }
  }

  return (((str1.length - differentChars) / str1.length) * 100).toPrecision(3);
}

const Overlay = () => {
  const ctx = React.useContext(TyperContext);

  const onClick = () => {
    ctx.setIsGameInProgress(true);
    if (ctx.input.length) {
      ctx.setInput([]);
      getQuote(ctx.allQuotes, ctx.setQuote);
    }
    ctx.setStartTime(Date.now());
    ctx.setEndTime();
    document.querySelector(".hidden-input").focus();
  };

  const numWords = ctx.quote.split(" ").length;
  const timeSeconds = (ctx.endTime - ctx.startTime) / 1000;
  const wpm = ((numWords / timeSeconds) * 60).toPrecision(3);

  return ctx.isGameInProgress ? null : (
    <div className="overlay" onClick={onClick}>
      <div className="overlay-inner">
        <h2>click to start</h2>
        {timeSeconds && !ctx.isGameInProgress ? (
          <>
            <div>WPM: {wpm}</div>
            <div>Accuracy: {getAccuracy(ctx.input, ctx.quote)}%</div>
            <div className="time-label">
              Time: {Math.floor((Date.now() - ctx.startTime) / 1000)}s
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

const Letter = ({ value, index, typedValue }) => {
  let colorVal = "";
  if (typedValue) {
    if (typedValue !== value) {
      colorVal = value === " " ? "incorrect-whitespace" : "incorrect-letter";
    } else {
      colorVal = "correct-letter";
    }
  }
  return <span className={`letter letter-${index} ${colorVal}`}>{value}</span>;
};

const TimeLabel = () => {
  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(time + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time, setTime]);

  return <label className="time-label">Time: {time}s</label>;
};

function App() {
  return (
    <div className="app">
      <Typer />
    </div>
  );
}

export default App;
