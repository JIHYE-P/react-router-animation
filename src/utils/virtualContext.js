import React, {createContext, useState} from 'react';
import styled from 'styled-components';
import {gotoTransitionPage} from './contextComp';

export const VirtualRouterContext = createContext();
const {Provider, Consumer} = VirtualRouterContext;

export const VirtualRouterProvider = (props) => {
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

let lock = false;
const StyledLink = styled.a`
  color: red;
  font-size: 20px;
  cursor: pointer;
`;
export const Link = ({to, current, next, ...props}) => {
  return <Consumer>
    {({state, refs}) => {
      const gotoHandler = () => async(ev) => {
        if(lock) return;
        lock = true;
        // Set 이미지,비디오 로딩완료하고 페이지전환함수 실행
        await gotoTransitionPage({
          to,
          current,
          next,
          refs,
          state
        });
        lock = false;
      }
      return <StyledLink onClick={gotoHandler()} {...props} />
    }}
  </Consumer>
}

