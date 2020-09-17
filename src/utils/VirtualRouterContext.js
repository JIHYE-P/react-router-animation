import React, {createContext, useState} from 'react';

export const VirtualRouterContext = createContext();
const {Provider, Consumer: VirtualRouterConsumer} = VirtualRouterContext;

const VirtualRouterProvider = (props) => {
  const [vHistory, setVHistory] = useState({});
  const [history, setHistory] = useState({});
  const [refs, setRefs] = useState({});

  return <Provider {...props} 
    value={{
      vHistory,
      setVHistory: vh => setVHistory(vh),
      history,
      setHistory: h => setHistory(h),
      refs,
      setRef: (name, ref) => setRefs(Object.assign(refs, {[name]: ref}))
    }}
  />
}

export {
  VirtualRouterProvider,
  VirtualRouterConsumer
}
