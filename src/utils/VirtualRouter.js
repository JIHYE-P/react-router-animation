import React, {useContext, useEffect, useRef} from 'react';
import {useLocation, useHistory} from 'react-router-dom';
import {VirtualRouterContext, VirtualRouterConsumer} from './VirtualRouterContext';
import {sleep} from './';
import Pages from '../Pages';

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

export const Link = ({to, children, className}) => {
  return <VirtualRouterConsumer>
    {({vHistory, history}) => {
      const gotoHandler = (pathName) => async(ev) => {
        vHistory.push(pathName);
        await sleep(2000);
        history.push(pathName);
      }
      return <a className={className} onClick={gotoHandler(to)}>{children}</a>
    }}
  </VirtualRouterConsumer>
}

export const Ref = ({name, ...props}) => {
  const context = useContext(VirtualRouterContext);
  const comp = useRef();
  useEffect(() => {
    context.setRef(name, comp.current);
  }, []);
  return <div ref={comp} {...props} />
}
