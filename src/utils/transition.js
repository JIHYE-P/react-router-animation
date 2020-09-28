import React, {createContext, useContext, useState, useEffect, useRef} from 'react';
import {useHistory} from 'react-router-dom';
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

const checkImages = async(imgs) => {
  return imgs.map(img => new Promise((resolve) => {
    img.onload = () => resolve(true); // onload는 최초 한번만 실행
    img.onerror = err => resolve(err);
    img.complete && resolve(true);
  }));
};
// setState: (obj) => setState({...state, ...obj}),
// setState: (obj) => setState(Object.assign(state, obj)),
export const TransitionContext = createContext();
const {Provider, Consumer} = TransitionContext;
export const TransitionProvider = (props) => {
  const [state, setState] = useState({
    history: {
      browser: null,
      memory: null,
    },
    targets: {}
  });
  const [images, setImages] = useState(new Set);
  return <Provider {...props} 
    value={{
      state,
      setState: (obj) => setState(state => Object.assign(state, obj)),
      images,
      setImages: el => setImages(images.add(el))
    }}
  />
}

let lock = false;
export const Link = ({to, seed, ...props}) => {
  return <Consumer>
    {({state, images}) => {
      const {browser, memory} = state.history;
      const gotoPage = async() => {
        if(lock) return;
        lock = true;
        memory.push(to);
        await sleep(0);
        await Promise.all(await checkImages([...images]));
        await gotoTransitionPage({to, state, seed});
        images.clear();
        browser.push(to);
        lock = false;
      }
      return <a {...props} onClick={gotoPage}></a>
    }}
  </Consumer>
};

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

const groupStore = new Map;
const RefCompFactory = p1Cache(tagName => {
  const Make = ({to, name, group, preload, children, ...props}) => {
    const {state, setState, setImages} = useContext(TransitionContext);
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
        switch(el.current.tagName){
        case 'IMG': preload && setImages(el.current); 
        break;
        case 'VIDEO': return;
        }
      }
    }, [el]);
    const clickHander = to && ((ev) => {
      const {targets} = state;
      if(group){
        const [groupName, groupIndex] = group;
        const targetGroup = groupStore.get(groupName);
        const target = targetGroup.get(groupIndex);
        const result = {};
        for(let [name, el] of target){
          Object.assign(result, {[name]: {...targets[name], browser: el}});
        }
        console.log(result)
      }
    });
    return React.createElement(tagName, {ref: el, onClick: clickHander, ...props}, children);
  }
  return Make;
});

const RefComp = RefCompFactory('section');
export const Ref = new Proxy(RefComp, {
  get: (target, property) => RefCompFactory(property.toLowerCase())
});

const gotoTransitionPage = async({to, state, seed}) => {
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
  if(seed === 'postAnime'){}
}
