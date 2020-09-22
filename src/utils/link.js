import { set } from 'animejs';
import React from 'react';
import {sleep} from '.';
import {gotoTransitionPage} from './contextComp';
import {TransitionRouterConsumer} from './transitionContext';

const checkImages = async(imgs) => {
  return imgs.map(img => new Promise((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = err => resolve(err);
  }));
};

let lock = false;
const Link = ({to, current, next, ...props}) => {
  return <TransitionRouterConsumer>
    {({state, refs, images}) => {
      const gotoHandler = async(ev) => {
        if(lock) return;
        lock = true;
        state.vHistory.push(to);
        await sleep(0);
      
        const checked = await checkImages([...images]);
        await Promise.all(checked);
        await gotoTransitionPage({
          to,
          refs,
          state,
          images
        });
        images.clear();
        lock = false;
      }
      return <a {...props} onClick={gotoHandler} style={{color: 'red', fontSize: '20px', cursor: 'pointer'}} />
    }}
  </TransitionRouterConsumer>
}

export default Link;