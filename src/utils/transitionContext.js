import React, {createContext, useState} from 'react';

export const TransitionContext = createContext();
const {Provider, Consumer: TransitionRouterConsumer} = TransitionContext;

const TransitionRouterProvider = (props) => {
  const [state, setState] = useState({});
  const [refs, setRefs] = useState({});
  return <Provider {...props} 
    value={{
      state,
      setState: (obj) => setState(Object.assign(state, obj)),
      refs, 
      setRefs: (obj) => setRefs(Object.assign(refs, obj)),
    }}
  />
}

export {
  TransitionRouterProvider,
  TransitionRouterConsumer
}


