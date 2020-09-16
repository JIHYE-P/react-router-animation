import './App.css';
import React, {useEffect, useState } from 'react';
import {BrowserRouter, MemoryRouter, useHistory} from 'react-router-dom';
import Pages from './Pages';

import {VirtualRouterProvider} from './utils/VirtualRouterContext';
import {HistoryObserver} from './utils/VirtualRouter';

const VHistoryWrapper = ({children}) => {
  return <BrowserRouter>
    <HistoryObserver vHistory={useHistory()}>
      {children}
    </HistoryObserver>
  </BrowserRouter>
}

function App() {
  const [isRender, setIsRender] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsRender(true));
  }, []);
  return <VirtualRouterProvider>
    <MemoryRouter>
      <VHistoryWrapper>
        {isRender && <Pages />}  
      </VHistoryWrapper>
      {isRender && <Pages />}
    </MemoryRouter>
  </VirtualRouterProvider>
}

export default App;
