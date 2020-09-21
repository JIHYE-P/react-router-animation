import React, {useContext, useEffect, useRef} from 'react';
import {useHistory} from 'react-router-dom';
import {sleep} from '.';
import {VirtualRouterContext} from './virtualContext';
import {styler, tween} from 'popmotion';

const p1Cache = f => { 
  const store = new Map; //네이티브 객체
  console.log(store);
  return arg => store.has(arg) ? store.get(arg) : store.set(arg, f(arg)).get(arg);
}

const RefCompFactory = p1Cache(tagName => {
  const Make = ({name, children, preload, ...props}) => {
    //2. 이미지, 비디오 엘리먼트가 있는지 확인 후 loading이 필요한 엘리먼트를 모아둔 Set 객체를 미리 준비하기 (context)
    const {state, setRefs} = useContext(VirtualRouterContext);
    const el = useRef(null);
    const history = useHistory();
    useEffect(() => {
      if(!el) return;
      if(history === state.history){
        setRefs({[`browser.${name}`]: el.current});
      }else if(history === state.vHistory){
        setRefs({[`memory.${name}`]: el.current});
        //3. preload가 true인것만 Set에 추가
        // new Set => [...set] 배열 풀어써야만 데이터를 사용할 수 있다.
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
  const el = Object.assign(document.createElement('div'), {style: `position:fixed; top:0; left:0; width:100%; height:100%; z-index:10; display:none`});
  document.body.prepend(el);
  return {
    el,
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

const refLoaderComplete = async(wrapper) => {
  if(!wrapper) return;
  const imgs = Array.from(wrapper.childNodes).map(img => img);
  return imgs.map(img => new Promise((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = err => resolve(err);
  }));
}

export const gotoTransitionPage = async({
  to,
  current,
  next,
  refs,
  state
  // 로딩이 필요한 엘리먼트 Set
}) => {
  // browser, memory
  const {vHistory, history} = state;
  const duration = {duration: 1000}
  // console.log(refs)
  vHistory.push(to);
  await sleep(0);
  const nextPage = refs[`memory.${next}`];
  const currentPage = refs[`browser.${current}`];
  fixed.append(nextPage);

  // gotoTransitionPage 스코스 내에서만 할 수 있는 방법
  // 1. context refs object에서 Object.values(refs) => 이미지, 비디오가 있는지 확인 가능
  // const imgLoader = await refLoaderComplete(refs[`memory.images`])
  // await Promise.all(imgLoader);
  tween(duration).start(v => {
    styler(currentPage).set('opacity', 1-v);
    styler(nextPage).set('opacity', v)
  });
  fixed.show();
  await sleep(1000);
  fixed.remove(nextPage);
  fixed.hide();
  history.push(to);
  // 이미지랑 비디오 엘리먼트는 로딩이 끝난 후 트렌지션 애니메이션이 걸려야한다.
  // Ref컴포넌트로 img ref를 가져와서 

  // animejs 사용 할 때 
  // fixed.append(nextPage);
  // await anime({
  //   targets: currentPage,
  //   opacity: [1, 0],
  //   duration: 1500
  // });
  // fixed.show();
  // await anime({
  //   targets: nextPage,
  //   opacity: [0, 1],
  //   duration: 1500
  // });
  // await sleep(500);
  // fixed.remove(nextPage);
  // fixed.hide();
  // history.push(to);
}
