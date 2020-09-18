import './App.css';
import React, {useEffect, useState} from 'react';
import {BrowserRouter, MemoryRouter, useHistory} from 'react-router-dom';
import Pages from './Pages';

import {VirtualRouterProvider} from './utils/VirtualRouterContext';
import {HistoryObserver} from './utils/VirtualRouter';

//애니메이션이 작동할 함수를 등록하고 그 함수는 Link에서 호출한다
//애니메이션 함수에는 대상자 (name으로 구분)와 현재위치 다음위치을 인자값으로 받아서 대상자마다 애니메이션의 구현을 다 다르게 할수 있다.
const fixed = (() => {
  const el = Object.assign(document.createElement('div'), {style: `position: fixed; top:0; left:0; width:100%; height:100%; z-index:10; display: none`});
  document.body.prepend(el);
  return {
    show: () => el.style.display = 'block',
    hide: () => el.style.display = 'none',
    append: (child) => el.appendChild(child),
    remove: (child) => el.removeChild(child),
    async trans(f){
      this.show();
      await f();
      this.hide();
    }
  }
})();

const VHistoryWrapper = ({children}) => {
  return <BrowserRouter>
    <HistoryObserver vHistory={useHistory()}>
      {children}
    </HistoryObserver>
  </BrowserRouter>
}
const Hidden = ({children}) => {
  return <div style={{
    width: 0,
    height: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
    overflow: 'hidden'
  }}>{children}</div>
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
