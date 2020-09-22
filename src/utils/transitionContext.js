import { set } from 'animejs';
import React, {createContext, useState} from 'react';

export const TransitionContext = createContext();
const {Provider, Consumer: TransitionRouterConsumer} = TransitionContext;

const TransitionRouterProvider = (props) => {
  const [state, setState] = useState({});
  const [refs, setRefs] = useState({});
  const [images, setImages] = useState(new Set);
  return <Provider {...props} 
    value={{
      state,
      // setState: (obj) => setState({...state, ...obj}),
      // setState: (obj) => setState(Object.assign(state, obj)),
      setState: (obj) => setState(state => Object.assign(state, obj)),
      refs, 
      // setRefs: (obj) => setRefs({...refs, ...obj}),
      // setRefs: (obj) => setRefs(Object.assign(refs, obj)),
      setRefs: (obj) => setRefs(refs => Object.assign(refs, obj)),
      images,
      setImages: el => setImages(images.add(el))
    }}
  />
}

export {
  TransitionRouterProvider,
  TransitionRouterConsumer
}

// 리엑트 렌더링되는 조건

