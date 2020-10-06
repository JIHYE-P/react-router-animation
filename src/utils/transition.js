import React, {createContext, useContext, useState, useEffect, useRef, memo} from 'react';
import {useHistory} from 'react-router-dom';
import {styler, tween} from 'popmotion';
import {sleep} from '.';

export const Hidden = ({children}) => {
  return <div style={{
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
    overflow: 'hidden',
    visibility: 'hidden',
    opacity: 0.0001 // IE에서 visibility hidden 처리하면 width/height 0/0 으로 잡힘
  }}>{children}</div>
}

export const fixed = (() => {
  const el = Object.assign(document.createElement('div'), {
    style: `position:fixed; top:0; left:0; width:100%; height:100%; z-index:10; display:none `
  });
  document.body.prepend(el);
  return {
    show: () => el.style.display = 'block',
    hide: () => el.style.display = 'none',
    append: (child) => el.appendChild(child),
    remove: (child) => el.removeChild(child),
    replace: (prev, next) => el.replaceChild(prev, next),
    async trans(f){
      this.show();
      await f();
      this.hide();
    }
  }
})();

const p1Cache = f => { 
  const store = new Map; //네이티브 객체
  // console.log(store);
  return arg => store.has(arg) ? store.get(arg) : store.set(arg, f(arg)).get(arg);
}

export const checkPreload = (el) => {
  switch(el.tagName){
    case 'IMG': return new Promise(res => el.complete ? res() : el.onload = () => res());
  }
};

export const TransitionContext = createContext();
const {Provider, Consumer} = TransitionContext;
export const TransitionProvider = (props) => {
  const [state, setState] = useState({
    history: {
      browser: null,
      memory: null,
    },
    targets: {},
    preload: new Set
  });
  return <Provider {...props} 
    value={{ state, setState: (obj) => setState(state => Object.assign(state, obj)) }}
  />
}

export const HistoryObserver = ({vHistory, children}) => {
  const {setState} = useContext(TransitionContext);
  const history = useHistory(); 
  useEffect(() => {
    setState({history: {
      browser: history,
      memory: vHistory
    }});
  }, []);
  return <>{children}</>
}

let lock = false;
export const Link = ({to, seed, ...props}) => {
  return <Consumer>
    {({state}) => {
      const {browser, memory} = state.history;
      const gotoPage = async() => {
        if(lock) return;
        lock = true;
        memory.push(to);
        await sleep(0);
        await Promise.all([...state.preload].map(el => checkPreload(el)));
        await gotoTransitionPage(to, state, seed);
        state.preload.clear();
        browser.push(to);
        lock = false;
      }
      return <a {...props} onClick={gotoPage}></a>
    }}
  </Consumer>
};

const groupStore = new Map;
const RefCompFactory = p1Cache(tagName => {
  const Make = ({to, name, group, preload, children, ...props}) => {
    const {state, setState} = useContext(TransitionContext);
    const {history: {browser, memory}} = state;
    const el = useRef(null);
    const history = useHistory();
    useEffect(() => {
      if(!el) return;
      const {targets} = state;
      if(history === browser){
        name && setState({targets: {...targets, [name]: {...targets[name], browser: el.current}}});  
        if(group){
          const [groupName, groupIndex] = group;
          const groupMap = !groupStore.has(groupName) ? groupStore.set(groupName, new Map).get(groupName) : groupStore.get(groupName);
          const targetMap = !groupMap.has(groupIndex) ? groupMap.set(groupIndex, new Map).get(groupIndex) : groupMap.get(groupIndex);
          targetMap.set(name, el.current)
        }
      }else if(history === memory){
        name && setState({targets: { ...targets, [name]: {...targets[name], memory: el.current}}});
        preload && state.preload.add(el.current);
      }
    }, [el]);
    const clickHander = to && (async() => {
      const {targets} = state;
      if(lock) return;
      lock = true;
      if(group){
        const [groupName, groupIndex] = group;
        const targetGroup = groupStore.get(groupName);
        const target = targetGroup.get(groupIndex);
        const result = {};
        for(let [name, el] of target){
          Object.assign(result, {[name]: {...targets[name], browser: el}});
        }
        memory.push(to);
        await sleep(0);
        await Promise.all([...state.preload].map(el => checkPreload(el)));
        await gotoPostDetail({from: result.img.browser, to: state.targets.postImg.memory});
        state.preload.clear();
        // browser.push(to);
      }
      lock = false;
    });
    return React.createElement(tagName, {ref: el, onClick: clickHander, ...props}, children);
  }
  return Make;
});

export const gotoPostDetail = async({from, to}) => {
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  console.log(fromRect, toRect)
  const {width, height, left, top} = toRect;
  Object.assign(from.style, {transformOrigin: 'left top'});
  // const placeholder = Object.assign(document.createElement('div'), {style: `
  //   position: absolute;
  //   width: ${toRect.width}px;
  //   height: ${toRect.height}px;
  //   right: 0;
  //   bottom: 0;
  // `});
  // to.parentNode.replaceChild(placeholder, to);
  // Object.assign(to.style, {
  //   position: 'absolute',
  //   width: width+'px',
  //   height: height+'px',
  //   left: left+'px',
  //   top: top+'px',
  //   opacity: 0
  // });
  // fixed.append(to);
  // fixed.show();
  tween({
    from: { x: 0, y: 0, width: fromRect.width, height: fromRect.height, opacity: 1 },
    to: { x: toRect.x-fromRect.x, y: toRect.y-fromRect.y, width: toRect.width, height: toRect.height, opacity: 1 },
    duration: 1000
  }).start(v => styler(from).set(v));
  // tween({
  //   from: { x: 0, y: 0, width: fromRect.width, height: fromRect.height, opacity: 0 },
  //   to: { x: toRect.x-fromRect.x, y: toRect.y-fromRect.y, width: toRect.width, height: toRect.height, opacity: 1 },
  //   duration: 2000
  // }).start({
  //   update: v => {
  //     styler(to).set(v)
  //   },
  //   complete: () => {
  //     setTimeout(() => {
  //       Object.assign(to.style, { //렌더링 될 때 저장했던 toImage의 스타일로 다시 초기화 시켜주기
  //         width, height, position, transform, right, bottom, top, left
  //       });
  //       placeholder.parentNode.replaceChild(to, placeholder);
  //       fixed.hide();
  //     }, 0);
  //   }
  // });
}

const gotoTransitionPage = async(to, state, seed) => {
  let nextRef = null;
  let currentRef = null;
  const {targets} = state;
  if(seed === 'fadeInOut'){
    switch(to){
    case '/': 
      nextRef = targets.main.memory;
      currentRef = targets.post.browser;
    break;
    case '/post':
      nextRef = targets.post.memory;
      currentRef = targets.main.browser;
    break
    }
    fixed.append(nextRef);
    tween({duration: 1000}).start(v => {
      styler(currentRef).set('opacity', 1-v);
      styler(nextRef).set('opacity', v)
    });
    fixed.show();
    await sleep(1000);
    fixed.remove(nextRef);
    fixed.hide();
  }
}

let groupUid = 0;
export const groupRef = (groupUid, index) => refName => ({group: [groupUid, index], name: refName});
export const groupRefMap = (array, f) => {
  const current = 'group-uid-'+groupUid++;
  return array.map((item, i) => f(item, i, groupRef(current, i)));
}

const RefComp = RefCompFactory('section');
export const Ref = new Proxy(RefComp, {
  get: (target, property) => RefCompFactory(property.toLowerCase())
});

