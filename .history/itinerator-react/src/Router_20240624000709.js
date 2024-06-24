// Router.js

import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Home from './pages/Home';
import Quiz from './pages/Quiz';

const RouterComponent = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/quiz" component={Quiz} />
      </Switch>
    </Router>
  );
};

export default RouterComponent;