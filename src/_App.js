import './App.css';
import React, {useEffect} from 'react';
import {BrowserRouter as Router, Route, MemoryRouter, useLocation, useHistory} from 'react-router-dom';
import {createMemoryHistory} from 'history';

import Main from './pages/main';
import Detail from './pages/detail';

const Pages = () => <>
  <Route exact path='/' render={_=><Main />} />
  <Route path='/post/:id' render={_=><Detail />} />
</>

const HistoryObserver = ({vHistory, children}) => {
  const location = useLocation();
  const history = useHistory(); // BrowserRouter history
  useEffect(() => {
    console.log(vHistory, location.pathname) // MemoryRouter history
    vHistory.push('/');
  }, [location.pathname, vHistory]);
  return <>{children}</>
}

const VHistoryWrapper = () => {
  return <Router>
    <HistoryObserver vHistory={useHistory()}> 
      <Pages  />
    </HistoryObserver>
  </Router>
}

/**
 * MemoryRouter = 브라우저 주소와는 관계 없는 라우터
 * Router = BrowserRouter
 *
 * Pages 안에서 history를 정의하면 MemoryRouter 인지, BrowserRoter인지 구분이 안된다.
 * useHistory()는 실제 컴포넌트의 부모 라우터 히스토리를 받아옴 (컴포넌트를 감싸고 있는 부모의 라우터 히스토리)
 * HistoryObserver 컴포넌트를 만든 이유는 
 * MemoryRouter history를 받기 위해서는 부모 자식 계층이여야 받아 올 수 있다...?
 * 
 */

function App() {
  return <MemoryRouter>
    <VHistoryWrapper />
    <Pages />
  </MemoryRouter>
}

// function App() {
//   return <MemoryRouter>
//     <BrowserRouter>
//       <History history={useHistory()}>
//         <Route  />
//         <Route  />
//       </History>
//     </BrowserRouter>

//     <Route  />
//     <Route  />
//   </MemoryRouter>
// }

export default App;
