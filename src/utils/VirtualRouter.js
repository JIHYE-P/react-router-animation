import React, {useContext, useEffect, useRef, useState} from 'react';
import {useLocation, useHistory} from 'react-router-dom';
import {VirtualRouterContext, VirtualRouterConsumer} from './VirtualRouterContext';
import {sleep} from './';

// const Observer = ({setVHistory, vHistory, setHistory, history, children}) => {
//   useEffect(() => {
//     setHistory(history)
//     setVHistory(vHistory)
//   }, [])
//   return <>{children}</>
// }
// const HistoryObserver = ({vHistory, children}) => {
//   const history = useHistory(); 
//   return <VirtualRouterConsumer>
//     {({setVHistory, setHistory}) => (
//       <Observer setVHistory={setVHistory} vHistory={vHistory} setHistory={setHistory} history={history}>{children}</Observer>
//     )}
//   </VirtualRouterConsumer>
// }

export const HistoryObserver = ({vHistory, children}) => {
  const context = useContext(VirtualRouterContext);
  const history = useHistory(); 
  useEffect(() => {
    context.setVHistory(vHistory);
    context.setHistory(history);
  }, []);
  return <>{children}</>
}
// 맨처음에 렌더링 할 때 Loading 컴포넌트로 시간 차를 두고 그 사이에 렌더링이 되고 history를 사용 할 수 있게
// 처음 렌더링 될 때는 history를 알지 못한다.
export const Link = ({to, children, className}) => {
  return <VirtualRouterConsumer>
    {({vHistory, history}) => {
      const gotoHandler = (pathName) => async(ev) => {
        vHistory.push(pathName);
        await sleep(2000);
        history.push(pathName);
        //애니메이션 작동
      }
      return <a className={className} onClick={gotoHandler(to)}>{children}</a>
    }}
  </VirtualRouterConsumer>
}

export const Ref = ({name, ...props}) => {
  const context = useContext(VirtualRouterContext);
  const history = useHistory(); // <Pages /> 컴포넌트의 history
  const comp = useRef();
  useEffect(() => {
    let key; 
    if(history === context.vHistory){
      key = 'memory';
    }else if(history === context.history){
      key = 'browser'
    }
    context.setRef(`${key}-${name}`, comp.current);
    console.log(context.refs)
  }, []);
  return <div ref={comp} {...props} />
}

