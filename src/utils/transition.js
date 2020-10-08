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
  const store = new Map;
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
    preload: new Set,
    locked: false
  });
  return <Provider {...props} value={{ state, setState: (obj) => setState(state => Object.assign(state, obj)) }} />
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

let locked = false;
export const pushNextPage = (to, seed, state) => {
  return async() => {
    const {history: {browser, memory}} = state;
    if(locked) return;
    locked = true
    memory.push(to);
    await sleep(0);
    await Promise.all([...state.preload].map(el => checkPreload(el)));
    await setTransition(to, state, seed);
    state.preload.clear();
    browser.push(to);
    locked = false
  }
}

export const Link = ({to, seed, ...props}) => {
  return <Consumer>
    {({state}) => <a {...props} onClick={pushNextPage(to, seed, state)}></a> }
  </Consumer>
};

const groupStore = new Map;
const RefCompFactory = p1Cache(tagName => {
  const Make = ({to, name, group, preload, seed, children, ...props}) => {
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
      if(group){
        const result = {};
        const [groupName, groupIndex] = group;
        const targetGroup = groupStore.get(groupName);
        const target = targetGroup.get(groupIndex);
        for(let [name, el] of target){
          Object.assign(result, {[name]: {...targets[name], browser: el}});
        }
        setState({targets: Object.assign(targets, result)});
        pushNextPage(to, seed, state)();
      }
    });
    return React.createElement(tagName, {ref: el, onClick: clickHander, ...props}, children);
  }
  return Make;
});

const setTransition = async(to, state, seed) => {
  if(seed === 'fadeInOut'){
    await gotoFadeInOutPage(to, state)
  }else if(seed === 'gotoPost'){
    await gotoPostDetail(state.targets)
  }
}

const gotoFadeInOutPage = async(to, state) => {
  let nextRef = null;
  let currentRef = null;
  const {targets} = state;
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

const gotoPostDetail = async(targets) => {
  const from = targets.img.browser;
  const to = targets.postImg.memory;
  const list = targets.postList.browser;
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  console.log(fromRect, toRect)
  const {width, height, left, top} = fromRect;
  const placeholder = Object.assign(document.createElement('div'), {style: `width: ${width}px; height: ${height}px; margin: 0 auto;`});
  from.parentNode.replaceChild(placeholder, from);
  Object.assign(from.style, {position: 'absolute', left: left+'px', top: top+'px', width: width+'px', height: height+'px'});
  fixed.append(from);
  fixed.show();
  return new Promise(res => {
    tween({
      from: {opacity: 1},
      to: {opacity: 0},
      duration: 800
    }).start(v => styler(list).set(v));
    tween({
      from: { x: 0, y: 0, width: fromRect.width, height: fromRect.height},
      to: { x: toRect.x-fromRect.x, y: toRect.y-fromRect.y, width: toRect.width, height: toRect.height},
      duration: 800
    }).start({
      update: v => styler(from).set(v),
      complete: () => {
        fixed.remove(from);
        fixed.hide();
        res();
      }
    });
  });
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

