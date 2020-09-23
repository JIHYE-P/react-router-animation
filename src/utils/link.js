import React from 'react';
import {useLocation} from 'react-router-dom';
import {gotoTransitionPage} from './contextComp';
import {TransitionRouterConsumer} from './transitionContext';
import {sleep} from '.';

const checkImages = async(imgs) => {
  // onload는 최초 한번만 실행
  return imgs.map(img => new Promise((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = err => resolve(err);
    img.complete && resolve(true);
  }));
};

let lock = false;
const Link = ({to, ...props}) => {
  return <TransitionRouterConsumer>
    {({state, refs, images}) => {
      const gotoHandler = async(ev) => {
        if(lock) return;
        lock = true;
        state.vHistory.push(to);
        await sleep(0);
        await Promise.all(await checkImages([...images]));
        await gotoTransitionPage({to, refs});
        state.history.push(to);
        images.clear();
        lock = false;
      }
      return <a {...props} onClick={gotoHandler} style={{color: 'red', fontSize: '20px', cursor: 'pointer'}} />
    }}
  </TransitionRouterConsumer>
}

export default Link;