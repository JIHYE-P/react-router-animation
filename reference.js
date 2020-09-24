import React, {useEffect, createContext, useContext, useState, useRef} from 'react';
import {BrowserRouter as BRouter, MemoryRouter as MRouter, useHistory, Route as RouteRaw} from 'react-router-dom';

const sleep = ms => new Promise(res => setTimeout(res, ms));
const each = (obj, f) => {for (const key in obj) f(obj[key], key, obj);};
const p1Cache = f => {
  const store = new Map;
  return a => store.has(a) ? store.get(a) : store.set(a, f(a)).get(a);
};
const p2Cache = f => {
  const store = new Map;
  
  return (a, b) => {
    console.log(a, b, store);
    return store.has(a) 
    ? store.get(a).has(b) 
      ? store.get(a).get(b) 
      : store.get(a).set(b, f(a, b)).get(b)
    : store.set(a, new Map).get(a).set(b, f(a, b)).get(b);
  };
};
const p3Cache = f => {
  const store = new Map;
  return (a, b, c) => {
    console.log(store);
    return store.has(a)
    ? store.get(a).has(b)
      ? store.get(a).get(b).has(c)
        ? store.get(a).get(b).get(c)
        : store.get(a).get(b).set(c, f(a, b, c)).get(c)
      : store.get(b).set(b, new Map).get(b).set(c, f(a,b,c))
    : store.set(a, new Map).get(a).set(b, new Map).get(b).set(c, f(a, b, c)).get(c);
  };
};
const pNCache = f => {
  const store = new Map;
  return (...p) => {
    const len = p.length;
    console.log(store);
    const cp = [...p];
    let chn = store.has(len) ? store.get(len) : store.set(len, new Map).get(len);
    let prop = cp.shift();
    do {
      chn = chn.has(prop) ? chn.get(prop) : chn.set(prop, cp.length ? new Map : f(...p)).get(prop);
    } while (prop = cp.shift());
    return chn;
  };
};

const initValues = {
  history: {
    memory: null,
    browser: null,
  },
  targets: {},
  preload: new Set,
  prerect: new Set,
  locked: false,
};

const tagPreloader = {
  IMG(el) {
    return new Promise(res => el.complete ? res() : el.onload = el.onerror = res);
  },
  VIDEO(el) {
    return new Promise(res => {
      const muted = el.muted;
      el.muted = true;
      const videoPlay = el.play();
      videoPlay && videoPlay.then(() => {
        el.pause();
        el.currentTime = 0;
      })
      el.oncanplay = res;
      el.onerror = res;
    })
  }
};

let transition = null;
export const setTransition = f => {
  if (transition !== null) throw 'initialized!';
  transition = f;
}

const RefContext = createContext();
export const RefProvider = ({children}) => {
  const [state, setState] = useState(initValues);
  const value = {
    state,
    setState: val => setState(data => Object.assign(data, val)), // 기존 객체를 사용하여 rerendering 방지
  };
  return <RefContext.Provider value={value} children={children} />
};

export const MHistorySender = ({children}) => <BRouter>
  <HistoryObserver mHistory={useHistory()} children={children} />
</BRouter>;

const HistoryObserver = ({mHistory, children}) => {
  const {setState} = useContext(RefContext);
  const history = useHistory();

  useEffect(() => {
    setState({history: {
      browser: history,
      memory: mHistory,
    }});
  }, []);

  return <>{children}</>
};

export class Tuple extends Array {
  static create(...args) {return new this(...args);}
  constructor(...args) {
    super(...args);
    Object.freeze(this);
  }
  equals(tuple) {
    if (this.length !== tuple.length) return false;
    return this.every((item, i) => item === tuple[i]);
  }
  toString(separator = ',') {
    return this.join(separator);
  }
}

function pushNext(state, setState, to, seed) {
  return async () => {
    // console.log('transition2', seed)
    const { history: { browser, memory }, locked } = state;
    if (locked) return;
    setState({ locked: true });
    memory.push(to);
    await sleep(0);
    await Promise.all([...state.preload].map(el => tagPreloader[el.tagName](el)));
    const rectMap = new Map([...state.prerect].map(el => [el, { el, ...el.getBoundingClientRect().toJSON() }]));
    const getRectByEl = el => rectMap.get(el);
    await transition(seed, new Tuple(browser.location.pathname, to), state.targets, getRectByEl);
    state.preload.clear();
    each(state.targets, item => item.memory.parentNode && item.memory.parentNode.removeChild(item.memory));
    browser.push(to);
    setState({ locked: false });
  };
}

export const Link = ({to, children, seed}) => {
  const {state, setState} = useContext(RefContext);
  return <a onClick={pushNext(state, setState, to, seed)}>{children}</a>;
};

// export const clearMemoryTargets = targets => {
//   for (const name in targets) targets[name].memory.parentNode && targets[name].memory.parentNode.removeChild(targets[name].memory);
// };
const groupStore = new Map;
const RefCompFactory = p1Cache(tagName => {
  const Make = React.forwardRef(({name, as: Comp, preload, prerect, children, to, seed, group, ...props}, ref) => {
    const {state, setState} = useContext(RefContext);
    const {history: {browser, memory}} = state;
    const el = useRef(null);
    const history = useHistory();
    
    useEffect(() => {
      if (!el) return;
      const {targets} = state;
      if (history === browser) {// console.log('is BrowserHistory!', el.current);
        name && setState({
          targets: {...targets, [name]: {...targets[name], browser: el.current}}
        });
        if (group) {
          const [groupName, groupIndex] = group;
          const targetMap = !groupStore.has(groupName) ? groupStore.set(groupName, new Map).get(groupName) : groupStore.get(groupName);
          const groupMap = !targetMap.has(groupIndex) ? targetMap.set(groupIndex, new Map).get(groupIndex) : targetMap.get(groupIndex);
          groupMap.set(name, el.current);
        }
      } else if (history === memory) {// console.log('is MemoryHistory!', el.current);
        name && setState({
          targets: {...targets, [name]: {...targets[name], memory: el.current}}
        });
        if (preload) state.preload.add(el.current);
      }
      if (prerect) state.prerect.add(el.current);
    }, [el]);

    const clickHandler = to && (ev => {
      if (group) {
        const [groupName, groupIndex] = group;
        const namedGroup = groupStore.get(groupName);
        if (namedGroup) {
          const groupMap = namedGroup.get(groupIndex);
          // console.log(el.current, groupMap)
          const result = {};
          for (const [name, el] of groupMap) Object.assign(result, {[name]: {...state.targets[name], browser: el}});
          setState({
            targets: {
              ...state.targets,
              ...result,
            }
          });
        }
      } else {
        name && setState({
          targets: {...state.targets, [name]: {...state.targets[name], browser: el.current}}
        });
      }
      pushNext(state, setState, to, seed)(ev);
    });

    return Comp ? <Comp {...props} ref={el} children={children} onClick={clickHandler} />
      : React.createElement(tagName, {ref: ref || el, ...props, onClick: clickHandler}, children);
  });

  return Make;
});

export const Ref = new Proxy({}, {
  get(target, property) {
    return RefCompFactory(property.toLowerCase());
  }
});

export const Route = ({render: Page, ...props}) => <RouteRaw {...props} render={() => <div><Page /></div>} />;

const Hidden = ({children}) => <div style={{
  width: 0,
  height: 0,
  overflow: 'hidden',
  zIndex: -1,
}} children={children} />

export const Router = ({children}) => {
  const [isLoad, setIsLoad] = useState(false);
  useEffect(() => {
    setTimeout(setIsLoad, 0, true);
  }, []);
  return <RefProvider>
    <MRouter>  
      <MHistorySender>
        {isLoad && children}
      </MHistorySender>
        {isLoad && <Hidden>{children}</Hidden>}
    </MRouter>
  </RefProvider>;
};

export const fixed = (() => {
  const el = Object.assign(document.createElement('div'), {style: 'position: fixed; width: 100%; height: 100%; top: 0; left: 0; display: none'});
  document.body.prepend(el);
  return {
    on() {el.style.display = 'block';},
    off() {el.style.display = 'none';},
    async transition(f) {this.on();await f();this.off();},
    append(child) {el.appendChild(child);},
    remove(child) {el.removeChild(child);},
  }
})();


