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
export const TransitionProvider = (props) => {
  const [state, setState] = useState({});
  const [refs, setRefs] = useState({});
  const [images, setImages] = useState(new Set);
  return <TransitionContext.Provider {...props} 
    value={{
      state,
      setState: (obj) => setState(state => Object.assign(state, obj)),
      refs, 
      setRefs: (obj) => setRefs(refs => Object.assign(refs, obj)),
      images,
      setImages: el => setImages(images.add(el))
    }}
  />
}

let lock = false;
export const Link = ({to, seed, ...props}) => {
  return <TransitionContext.Consumer>
    {({state, refs, images}) => {
      const {history, vHistory} = state.history;
      const gotoPage = async() => {
        if(lock) return;
        lock = true;
        vHistory.push(to);
        await sleep(0);
        await Promise.all(await checkImages([...images]));
        await gotoTransitionPage({to, refs, seed});
        images.clear();
        history.push(to);
        lock = false;
      }
      return <a {...props} onClick={gotoPage}></a>
    }}
  </TransitionContext.Consumer>
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

const RefCompFactory = p1Cache(tagName => {
  const Make = ({to, name, preload, children, ...props}) => {
    const {state, setState, setImages} = useContext(TransitionContext);
    const {history: {browser, memory}} = state;
    const el = useRef(null);
    const history = useHistory();
    useEffect(() => {
      if(!el) return;
      //({history: [name]: el.current})
      // if(history === state.history){
      //   name && setRefs({[`browser.${name}`]: el.current});
      // }else if(history === state.vHistory){
      //   name && setRefs({[`memory.${name}`]: el.current});
      //   if(preload && el.current.tagName==='IMG') setImages(el.current);
      // }
      const {targets} = state;
      if(history === browser){
        // targets: {...targets, [name]: {...targets[name], browser: el.current}}
        name && setState({ targets: {...targets, [name]: {browser: el.current}} });
      }else if(history === memory){
        // name && setState({...state, target: {memory: {[name]: el.current}}});
        name && setState({ targets: {...targets, [name]: {memory: el.current}} });
      }
      console.log(state)
    }, [el]);

    const clickHander = to && (() => {
      console.log(to)
    })
    return React.createElement(tagName, {ref: el, onClick: clickHander, ...props}, children);
  }
  return Make;
});

const RefComp = RefCompFactory('section');
export const Ref = new Proxy(RefComp, {
  get: (target, property) => RefCompFactory(property.toLowerCase())
});

const gotoTransitionPage = async({to, refs, seed}) => {
  let nextRef = null;
  let currentRef = null;

  if(seed === 'fadeInOut'){
    switch(to){
    case '/': 
      nextRef = refs[`memory.main`];
      currentRef = refs[`browser.post`];
    break;
    case '/post':
      nextRef = refs[`memory.post`];
      currentRef = refs[`browser.main`];
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

// 포스트 그리드형태에서 클릭한 포스트 하나의 wrapper ref(엘리먼트)를 가져오는 기능의 함수 만들기
// 클릭했을 때 refs에 저장되어 있는데 wrapper 여야함
// wrapper의 childNodes 배열로 저장?


