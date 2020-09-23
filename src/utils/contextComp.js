import React, {useContext, useEffect, useRef} from 'react';
import {useHistory} from 'react-router-dom';
import {TransitionContext} from './transitionContext';
import {styler, tween} from 'popmotion';
import {sleep} from '.';

export const Hidden = ({children}) => {
  return <div style={{
    width: 0,
    height: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
    overflow: 'hidden'
  }}>{children}</div>
}

const fixed = (() => {
  const el = Object.assign(document.createElement('div'), {
    style: `position:fixed; top:0; left:0; width:100%; height:100%; z-index:10; display:none `
  });
  document.body.prepend(el);
  return {
    show: () => el.style.display = 'block',
    hide: () => el.style.display = 'none',
    append: (child) => el.appendChild(child),
    remove: (child) => el.removeChild(child),
    async trans(f){
      this.show();
      await f();
      this.hide();
    }
  }
})();

const p1Cache = f => { 
  const store = new Map; //네이티브 객체
  console.log(store);
  return arg => store.has(arg) ? store.get(arg) : store.set(arg, f(arg)).get(arg);
}

const RefCompFactory = p1Cache(tagName => {
  const Make = ({name, children, preload, ...props}) => {
    const {state, setRefs, setImages} = useContext(TransitionContext);
    const el = useRef(null);
    const history = useHistory();
    useEffect(() => {
      if(!el) return;
      if(history === state.history){
        name && setRefs({[`browser.${name}`]: el.current});
      }else if(history === state.vHistory){
        name && setRefs({[`memory.${name}`]: el.current});
        if(preload && el.current.tagName==='IMG') setImages(el.current)
      }
    }, [el]);
    return React.createElement(tagName, {ref: el, ...props}, children);
  }
  return Make;
});

const RefComp = RefCompFactory('section');
export const Ref = new Proxy(RefComp, {
  get: (target, property) => {
    return RefCompFactory(property.toLowerCase())
  }
});

export const gotoTransitionPage = async({to, refs}) => {
  const duration = {duration: 1000}
  let nextPage = null;
  let currentPage = null;
  if(to === '/'){
    nextPage = refs[`memory.main`];
    currentPage = refs[`browser.post`];
  }
  if(to === '/post'){
    nextPage = refs[`memory.post`];
    currentPage = refs[`browser.main`];
  }
  fixed.append(nextPage);
  tween(duration).start(v => {
    styler(currentPage).set('opacity', 1-v);
    styler(nextPage).set('opacity', v)
  });
  fixed.show();
  await sleep(1000);
  fixed.remove(nextPage);
  fixed.hide();
}

// 포스트 그리드형태에서 클릭한 포스트 하나의 wrapper ref(엘리먼트)를 가져오는 기능의 함수 만들기
// 클릭했을 때 refs에 저장되어 있는데 wrapper 여야함
