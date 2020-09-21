import './App.css';
import React, {useEffect, useState, useContext} from 'react';
import {BrowserRouter, MemoryRouter, useHistory, Route} from 'react-router-dom';
import {VirtualRouterProvider, VirtualRouterContext} from './utils/virtualContext';
import {Hidden} from './utils/contextComp';
import Main from './pages/main';
import Post from './pages/post';

const HistoryObserver = ({vHistory, children}) => {
  const {setState} = useContext(VirtualRouterContext);
  const history = useHistory(); 
  useEffect(() => {
    setState({history, vHistory});
  }, []);
  return <>{children}</>
}

const VHistoryWrapper = ({children}) => {
  return <BrowserRouter>
    <HistoryObserver vHistory={useHistory()}>
      {children}
    </HistoryObserver>
  </BrowserRouter>
}

const PageRoute = ({component, ...props}) => <Route {...props} render={_ => <div>{component}</div>} />

const Pages = () => {
  return <>
    <PageRoute exact path='/' component={<Main />} />
    <PageRoute path='/post' component={<Post />} />
  </>
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
      {isRender && <Hidden><Pages /></Hidden>}
    </MemoryRouter>
  </VirtualRouterProvider>
}

export default App;
