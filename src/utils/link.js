import React from 'react';
import styled from 'styled-components';
import {gotoTransitionPage} from './contextComp';
import {TransitionRouterConsumer} from './transitionContext';

let lock = false;
const Link = ({to, current, next, ...props}) => {
  return <TransitionRouterConsumer>
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
      return <a style={{color: 'red', fontSize: '20px', cursor: 'pointer'}} onClick={gotoHandler()} {...props} />
    }}
  </TransitionRouterConsumer>
}

export default Link;