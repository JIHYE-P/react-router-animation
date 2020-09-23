import './App.css';
import React, {useEffect, useState} from 'react';
import {BrowserRouter, MemoryRouter, useHistory, Route as RouteRaw} from 'react-router-dom';
import {TransitionProvider} from './utils/transition';
import {HistoryObserver, Hidden} from './utils/transition';
import Main from './pages/main';
import Post from './pages/post';

const VHistoryWrapper = ({children}) => {
  return <BrowserRouter>
    <HistoryObserver vHistory={useHistory()}>
      {children}
    </HistoryObserver>
  </BrowserRouter>
}

const Route = ({component, ...props}) => <RouteRaw {...props} render={_ => <div>{component}</div>} />

const Pages = () => {
  return <>
    <Route exact path='/' component={<Main />} />
    <Route path='/post' component={<Post />} />
  </>
} 

function App() {
  const [isRender, setIsRender] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsRender(true));
  }, []);
  return <TransitionProvider>
    <MemoryRouter>
      <VHistoryWrapper>
        {isRender && <Pages />}  
      </VHistoryWrapper>
      {isRender && <Hidden><Pages /></Hidden>}
    </MemoryRouter>
  </TransitionProvider>
}

export default App;
