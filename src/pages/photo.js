import { styler, tween, easing } from 'popmotion';
import React, {useEffect, useReducer, useRef} from 'react';
import {Ref} from '../utils/transition';
import {fixed} from '../utils/transition';
function elastic(x, timeFraction) {
  return Math.pow(2, 10 * (timeFraction - 1)) * Math.cos(20 * Math.PI * x / 3 * timeFraction)
}
const getBoundingElementRect = el => el.getBoundingClientRect();
const createPromise = () => {
  let resolve, reject;
  return [new Promise((res, rej) => [resolve, reject] = [res, rej]), resolve, reject];
};  
// return {start: (f) => new Promise(res => tween({
//     from: {x: 0, y: 0, width: fromRect.width, height: fromRect.height},
//     to:  {x: toRect.x - fromRect.left, y: toRect.y - fromRect.top, width: toRect.width, height: toRect.height},
//     duration: 2000,
//     ease: v => { return elastic(1.5, v); }
//   }).start({
//     update: f,
//     complete: res
//   }))
// };

// replaceChild(prev, next)
const movingImage = ({from, to}) => {
  // toelement getBoundingElementRect(to) 현재 위치 기억해두고
  // 애니메이션 시작 전에 to의 스타일 포지션과 트렌스폼을 풀어줘야한다.
  // 애니메이션이 끝나면 to의 포지션 스타일와 트렌스폼을 다시 적용시켜줘야한다.
  const fromRect = from instanceof DOMRect ? from : getBoundingElementRect(from);
  const toRect = to instanceof DOMRect ? to : getBoundingElementRect(to);
  fixed.append(to);
  fixed.show();
  tween({ 
    from: {opacity: 1, x: 0, y: 0},
    to:  {opacity: 0, x: 0, y: 0},
    duration: 2000 
  }).start(v => styler(from).set(v));

  tween({ 
    from: {opacity: 0, width: fromRect.width, height: fromRect.height, x: 0, y: 0},
    to:  {opacity: 1, width: toRect.width, height: toRect.height, x: 0, y: 0},
    duration: 2000 
  }).start(v => styler(to).set(v));
  // return {start: (f) => new Promise(res => tween({
  //     from: {x: 0, y: 0, scale: 1, opacity: 1},
  //     to:  {x: wrapRect.width-targetRect.width, y: wrapRect.height-targetRect.height, scale: 0, opacity: 0},
  //     duration: 1000,
  //     ease: easing.linear
  //   }).start({
  //     update: f,
  //     complete: res
  //   }))
  // };
}

const Photo = () => {
  const wrap = useRef();
  const fromImg = useRef();
  const toImg = useRef();
  
  const handler = async () => {
    // await movingImage(fromImg.current, toImg.current).start(v => styler(fromImg.current).set(v));
    movingImage({from: fromImg.current, to: toImg.current});
  }

  return <Ref.section name='photo'>
    <br/>
    <button onClick={handler}>start !!!</button>
    <div ref={wrap} style={{width: '800px', height: '400px', background: '#eee', position: 'relative', margin: '20px auto'}}>
      <div ref={fromImg} style={{position: 'absolute', left: '0', top: '0', zIndex: 1}}>
        <img src='https://picsum.photos/100/100?1' style={{width: '100%'}} />
      </div>
      <div ref={toImg} style={{position: 'absolute'}}>
        <img src='https://picsum.photos/150/150' style={{width: '100%'}} />
      </div>
    </div>
  </Ref.section>
}

export default Photo;