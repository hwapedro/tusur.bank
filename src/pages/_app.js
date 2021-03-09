import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Container } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";

import { Banks } from "./banks";
import { Calc } from "./calc";
import { Login } from "./login";
import { theme } from "../assets/theme/theme";

import "../assets/css/app.css";

const DEFAULT_STATE = { user: JSON.parse(localStorage.getItem("user")) };
export const ContextState = React.createContext(DEFAULT_STATE);

export const App = () => {
  const [state, setState] = React.useState(DEFAULT_STATE);

  const Wrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
      <ContextState.Provider value={{ state, setState }}>
        <Container maxWidth="md">
          <Router>
            <Switch>{children}</Switch>
          </Router>
        </Container>
      </ContextState.Provider>
    </ThemeProvider>
  );

  if (!state.user) {
    return (
      <Wrapper>
        <Route path="/login">
          <Login />
        </Route>
        <Redirect to="/login" />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Route path="/banks">
        <Banks />
      </Route>
      <Route path="/calc/:bankId">
        <Calc />
      </Route>
    </Wrapper>
  );
};
