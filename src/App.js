import React from "react";
import pl from "tau-prolog";
import logo from "./logo.svg";

import "./App.css";

function App() {
  const session = pl.create();
  session.consult(
    `
    likes(sam, salad).
    likes(dean, pie).
    likes(sam, apples).
    likes(dean, whiskey).
`,
    {
      success: function (data) {
        console.log("data", data);
      },
      error: function (err) {
        /* Error parsing program */
      },
    }
  );
  session.query("likes(sam, X).", {
    success: function (data) {
      console.log("data", data);
    },
    error: function (err) {
      /* Error parsing program */
    },
  });
  session.answer({
    success: function(answer) {
        console.log(answer); // X = salad ;
        session.answer({
            success: function(answer) {
                console.log(answer); // X = apples ;
            },
            // ...
        });
    },
    fail: function() { /* No more answers */ },
    error: function(err) { /* Uncaught exception */ },
    limit: function() { /* Limit exceeded */ }
});
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
