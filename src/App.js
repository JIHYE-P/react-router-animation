import './App.css';
import React from 'react';
import {BrowserRouter, MemoryRouter, useHistory} from 'react-router-dom';
import Pages from './Pages';

import {VirtualRouterProvider} from './utils/VirtualRouterContext';
import {HistoryObserver} from './utils/VirtualRouter';

const VHistoryWrapper = () => {
  return <BrowserRouter>
    <HistoryObserver vHistory={useHistory()}>
      <Pages name="browser" />
    </HistoryObserver>
  </BrowserRouter>
}

function App() {
  return <VirtualRouterProvider>
    <MemoryRouter>
      <VHistoryWrapper />
      <Pages name="memory" />
    </MemoryRouter>
  </VirtualRouterProvider>
}

export default App;
