import React, {useEffect, useRef} from 'react';
import {styler, tween, easing} from 'popmotion';
import {Ref, fixed, checkPreload} from '../utils/transition';

function elastic(x, timeFraction) {
  return Math.pow(2, 10 * (timeFraction - 1)) * Math.cos(20 * Math.PI * x / 3 * timeFraction)
}

const animateInitial = async(from, to) => {
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  const {width, height, position, transform, right, bottom, top, left} = to.style; //렌더링 처음 되었을 때 toImage의 스타일 속성들 저장
  const placeholder = Object.assign(document.createElement('div'), {style: `
    position: absolute;
    width: ${toRect.width}px;
    height: ${toRect.height}px;
    right: 0;
    bottom: 0;
  `});
  to.parentNode.replaceChild(placeholder, to);
  Object.assign(to.style, {
    right: 'initial',
    bottom: 'initial',
    left: `${fromRect.x}px`,
    top: `${fromRect.y}px`,
  });
  fixed.append(to);
  fixed.show();
  tween({ from: { x: 0, y: 0, width: fromRect.width, height: fromRect.height, opacity: 1 },
    to: { x: toRect.x-fromRect.x, y: toRect.y-fromRect.y, width: toRect.width, height: toRect.height, opacity: 0 },
    duration: 2000
  }).start(v => styler(from).set(v));
  tween({
    from: { x: 0, y: 0, width: fromRect.width, height: fromRect.height, opacity: 0 },
    to: { x: toRect.x-fromRect.x, y: toRect.y-fromRect.y, width: toRect.width, height: toRect.height, opacity: 1 },
    duration: 2000
  }).start({
    update: v => {
      styler(to).set(v)
    },
    complete: () => {
      setTimeout(() => {
        Object.assign(to.style, { //렌더링 될 때 저장했던 toImage의 스타일로 다시 초기화 시켜주기
          width, height, position, transform, right, bottom, top, left
        });
        placeholder.parentNode.replaceChild(to, placeholder);
        fixed.hide();
      }, 0);
    }
  });
}

const Photo = () => {
  const fromImg = useRef();
  const toImg = useRef();
  
  useEffect(() => {
    if(toImg.current) toImg.current.style.opacity = 0;
    (async() => {
      await Promise.all([fromImg.current, toImg.current].map(el => checkPreload(el)));
      await animateInitial(fromImg.current, toImg.current);
    })()
  }, []);

  return <Ref.section name='photo'>
    <div style={{width: '800px', height: '500px', background: '#eee', position: 'relative', margin: '20px auto'}}>
      <img ref={fromImg} src='https://picsum.photos/150/100?1' style={{position: 'absolute', left: '0', top: '0', objectFit: 'cover'}} />
      <img ref={toImg} src='https://picsum.photos/250/200' style={{position: 'absolute', right: '0', bottom: "0", objectFit: 'cover'}} />
    </div>
  </Ref.section>
}

export default Photo;