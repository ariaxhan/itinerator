// App.js

import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import RouterComponent from './Router';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" component={RouterComponent} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;