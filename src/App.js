import './App.css';
import React, {useEffect, useState} from 'react';
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

/**
 * 렌더링은 자식 컴포넌트 먼저 그려지기 때문에, 부모 라우터 history를 알지 못한다.
 * 처음 렌더링 할 때 loading 상태값을 생성하여 부모 컴포넌트 먼저 그려주고 시간 차를 두고 
 * 자식 컴포넌트를 그려주면 부모의 Router (가장 가까이 있는) history를 넘겨받을 수 있다.
 */
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
