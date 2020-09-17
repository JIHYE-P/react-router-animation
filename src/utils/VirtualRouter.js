import React, {useContext, useEffect, useRef} from 'react';
import {useHistory} from 'react-router-dom';
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

// forwordRef는 부모컴포넌트가 자식컴포넌트 ref의 접근할 때 자식컴포넌트에서 사용
export const Ref = ({name, ...props}) => {
  const context = useContext(VirtualRouterContext);
  const history = useHistory();
  const comp = useRef();
  useEffect(() => {
    let key; 
    if(history === context.vHistory){
      key = 'memory';
    }else if(history === context.history){
      key = 'browser'
    }
    context.setRef(`${key}-${name}`, comp.current);
  }, []);
  return <div ref={comp} {...props} />
}

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
        //애니메이션 작동
      }
      return <a className={className} onClick={gotoHandler(to)}>{children}</a>
    }}
  </VirtualRouterConsumer>
}

const p1Cache = f => {
  const store = new Map;
  console.log(store);
  return arg => store.has(arg) ? store.get(arg) : store.set(arg, f(arg)).get(arg);
}

const RefCompFactory = p1Cache(tagName => {
  const Make = ({name, children, ...props}) => {
    const context = useContext(VirtualRouterContext);
    const el = useRef(null);
    const history = useHistory();

    useEffect(() => {
      if(!el) return;
      if(history === context.history){
        context.setRef(`browser.${name}`, el.current);
      }else if(history === context.vHistory){
        context.setRef(`memory.${name}`, el.current);
      }
      // console.log(context.refs)
    }, [el]);
    return React.createElement(tagName, {ref: el, ...props}, children);
  }
  return Make;
});

const RefComp = RefCompFactory('section');
export const Ref = new Proxy(RefComp, {
  get: (target, property) => {
    // target => Make 함수
    return RefCompFactory(property.toLowerCase())
  }
});