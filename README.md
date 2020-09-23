### `Route transition animation`
```
1. 링크 클릭 시 바로 라우터가 넘어가면 안되고 멈춘 상태에서 전환 라우터가 현재 라우터 같은 위치에 보이지 않게 렌더링 하고, 
2. 두 라우터의 wrapper element를 찾은 후 현재 라우터 element에는 out-animation 작동하고 
3. 현재 라우터의 out-animation이 끝나기 전에 전환 페이지에 in-animation 작동한 다음
4. out-animation과 in-animation 끝나면 전환 라우터 링크로 이동
```
-----

### `1. memoryRouter, BrowserRouter`
현재 페이지와, 전환 페이지가 이어지는 트랜지션 애니메이션을 주기 위해선, 
같은 페이지에 위치해야 자연스러운 애니메이션이 작동한다. 

`react-router-dom`의 메모리 라우터(`MemoryRouter`)의 `history`를 이용하여 전환되는 페이지를 `push()`하여 메모리 라우터에는 전환 페이지가 렌더링 되고, 브라우저 라우터(`BrowserRouter`)는 현재 페이지로 유지하며 동시에 in, out 애니메이션이 작동되어야 한다.

```
MemoryRouter는 실제 주소와는 상관이 없다. 예를들어 주소가 http://localhost:3000/post로 이동되어도 메모리 라우터 안에서는 post페이지로 넘어가지 않는다.
```

```jsx
const App = () => {
  return <MemoryRouter>
    <BrowserRouter>
      <Route>
        <Main />
      </Route>
      <Route>
        <Post />
      </Route>
    </BrowserRouter>
    <Route>
      <Main />
    </Route>
    <Route>
      <Post />
    </Route>
  </MemoryRouter>
}
```
`Router의 구조`를 간단히 생각해보면, 메모리 라우터 안에, 브라우저 라우터와 페이지들이 위치하고, 페이지 이동은 되지 않지만 렌더링하기 위한 메모리 라우터 페이지들이 위치한다.

메모리 라우터를 이동시키기 위한 방법은 메모리 라우터의 `useHistory()` 사용하여 해당 페이지로 렌더링이 (`push()`)되어야 하는데, `useHistory()`는 실제 컴포넌트의 제일 가까이 있는 부모 라우터`Router`의 (컴포넌트가 아님) `history`를 가져오기 때문에, 메모리 라우터의 `history`를 받기 위해선 부모/자식 계층이여야(컴포넌트) 받아올 수 있다.

```js
// 메모리 라우터와 브라우저 라우터에 렌더링할 페이지가 필요하므로 컴포넌트화한다.
const Pages = () => <>
  <Route exact path='/main' render={_=><Main />} />
  <Route exact path='/post' render={_=><Post />} />
</>

// 부모 라우터로 부터 history를 받아 조작 할 수 있도록 컴포넌트를 만든다.
const HistoryObserver = ({memoryHistory, children}) => {
  const history = useHistory(); // BrowerRouter history
  useEffect(() => {
    console.log(memoryHistory) // MemoryRouter history
    memoryHistory.push('/post');
  }, []);
  return <>{children}</>
}

/**
 * BrowserRouterComp 컴포넌트를 만든 이유는 
 * 브라우저 페이지와, 메모리 페이지가 이동되기 위해선 상위 부모 라우터의 history가 필요한데
 * 부모 라우터의 history를 받을려면 컴포넌트로 만들어야한다.
 * 즉, HistoryObserver의 props `memoryHistory`는 메모리 라우터의 히스토리를 받기 위함이고,
 * HistoryObserver 내부의 history는 브라우저 라우터의 히스토리를 받기 위해서다.
 */
const BrowserRouterComp = () => {
  const history = useHistory();
  return <BrowserRouter>
    <HistoryObserver memoryHistory={history}>
      <Pages />
    </HistoryObserver>
  </BrowserRouter>
}

const App = () => {
  return <MemoryRouter>
    <BrowserRouterComp />
    <Pages />
  </MemoryRouter>
}
```

이렇게 전환 라우터와 현재 라우터가 같은 페이지에 위치 할 수 있도록 설계를 하였다.
`http://localhost:3000/main` 으로 접속하면, 브라우저 라우터는 `Main`페이지, 메모리 라우터는 `Post`페이지를 렌더링 하고있다.

-----

### `2. Context API (createContext)` 
페이지 이동 링크를 걸기 위해 `react-router-dom`의 `<Link />` 컴포넌트를 사용해야 하지만,
`Link` 사용 시 링크 페이지로 바로 넘어가기 때문에 애니메이션이 끊기고, 애니메이션이 들어갈 페이지의 컴포넌트에 브라우저 라우터 히스토리와, 메모리 라우터 히스토리를 `props`로 받아 핸들링 해야하는데, 페이지 컴포넌트가 많아질 수 록 반복적인 코드 작성을 해야한다. 

`Context API`를 사용하여 전역 데이터 상태를 생성하여 여러 컴포넌트를 거쳐 데이터를 전달하지 않고,
`Context`를 통해서 바로 원하는 데이터 값을 줄 수 있다.
전역으로 사용해야 할 데이터는 `1. 브라우저 라우터 히스토리, 2. 메모리 라우터 히스토리, 3. 브라우저 페이지 ref, 4. 메모리 페이지 ref`로 정리할 수 있다. `ref`는 나중에 정리하고 `history`부터 전역 상태로 관리해보자.

```jsx
const sleep = ms => new Promise(res => setTimeout(res, ms));
const PageTransitionContext = createContext(); // Context API 생성
const {Provider, Consumer: PageTransitionConsumer} = PageTransitionContext;
export const PageTransitionProvider = ({...props}) => {
  const [state, setState] = useState({});
  const [refs, setRefs] = useState({}); // 라우터 컴포넌트 ref (엘리먼트) 상태관리
  return <Provider {...props} value={{
    state, 
    setState: obj => setState(Object.assign(state, obj)),
    refs, 
    setRefs: obj => setRefs(Object.assign(refs, obj))
  }} />
}
```

```jsx
export const Link = ({to, children, className}) => {
  return <PageTransitionConsumer>
    {({state}) => {
      const gotoPage = () = async() => {
        state.memoryHistory.push(to);
        await sleep(2000);
        state.history.push(to);
      }
      return <a onClick={gotoPage()} className={className}>{children}</a>
    }}
  </PageTransitionConsumer>
}

// App 컴포넌트 수정
const App = () => {
  return <PageTransitionProvider>
    <MemoryRouter>
      <BrowserRouterComp />
      <Pages />
    </MemoryRouter>
  </PageTransitionProvider>
}
```

`Context API`로 만든 `Provider` 최상위 컴포넌트가 전역 상태를 관리하고, `react-router-dom <Link />`를 대신해서
context 상태값을 사용할 수 있는 또 다른 `Link` 컴포넌트를 만든다. `Context`의 `history, memoryHistory`의 상태값을 저장하기 위해 메모리 라우터과, 브라우저 라우터 히스토리를 모두 받아오는 `HistoryObserver` 컴포넌트에서 상태값을 저장해준다.
```jsx
const HistoryObserver = ({memoryHistory, children}) => {
  const context = useContext(PageTransitionContext); // Context.Provider value를 객체로 반환
  const history = useHistory();
  useEffect(() => {
    context.setState({history, memoryHistory});
  }, []);
  return <>{children}</>
}
```

링크를 연결해 줄 페이지 컴포넌트에서 `<Link to="post">Go to Post Page</Link>`를 사용하면 
메모리 라우터 `Post` 페이지가 렌더링 된 후 2초 뒤에 (sleep 함수) 브라우저 라우터 `history.push()`가 작동하면서
주소가 해당 링크로 이동되어 브라우저 라우터 `Post` 페이지가 렌더링된다.

-----

### `3. components Ref 얻어오기`
애니메이션을 주기 위해선 대상자의 `element(Ref)`를 알아야 애니메이션 `css`등 을 적용 할 수 있다. 대상자를 감싸는 wrapper jsx`<div>` 컴포넌트를 만들어서 `ref`를 얻을 수 있는 방법이 있다.
```jsx
const Ref = ({main, children}) => {
  const comp = useRef();
  useEffect(() => {
    console.log(main);
    comp.current // 애니메이션 대상자 wrapper Ref
  }, []);
  return <div ref={comp}>{children}</div>
}
const Main = () => {
  return <Ref name="main">
    <div>Main</div>
  </Ref>
}
```
이렇게 `Ref` 컴포넌트를 만들어서 애니메이션 대상자 ref를 얻을 수가 있다. 하지만 좀 더 좋은 방법이 있는지 생각해보면 `styled-components`의 사용방법을 보면 
```jsx
const btnStyled = styled.button`color: red;`
```
위 코드 처럼 `.button`으로 `button` 엘리먼트를 반환해주고, 다른 html태그를 사용해도 사용한 태그를 반환해준다. `Ref` 컴포넌트는 `div`태그로만 사용할 수 밖에 없고, 안에 자식컴포넌트나 jsx를 사용할 때 `<Ref>` 보단 사용한 태그 이름의 컴포넌트로 보여주는 것이 좋다. 
`section` 태그로 감쌀 땐 `<Section>`, `main`태그는 `<Main>`으로 등등 ..

javascript [new Proxy()](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
를 사용하여, 대상 객체의 `key`를 태그이름으로 사용하여 `jsx`가 아닌 `React.createElement()`를 반환하여 `jsx`를 그려준다.

[React.createElement() 내용참고](https://medium.com/react-native-seoul/react-%EB%A6%AC%EC%95%A1%ED%8A%B8%EB%A5%BC-%EC%B2%98%EC%9D%8C%EB%B6%80%ED%84%B0-%EB%B0%B0%EC%9B%8C%EB%B3%B4%EC%9E%90-02-react-createelement%EC%99%80-react-component-%EA%B7%B8%EB%A6%AC%EA%B3%A0-reactdom-render%EC%9D%98-%EB%8F%99%EC%9E%91-%EC%9B%90%EB%A6%AC-41bf8c6d3764)
```
각 JSX 엘리먼트는 단지 React.createElement()를 호출하는 편리한 문법에 불과하다.
즉, JSX 문법은 React.createElement() 를 호출하기 위한 하나의 방법일 뿐이고 Babel(Javascript 트랜스파일러)을 통해 파싱되고 트랜스 파일링된다.
```

먼저 `React.createElement()` 를 반환하는 함수를 만든다.
```js
const RefCompFactory = tagName => {
  return ({name, children, ...props}) => {
    const el = useRef();
    return React.createElement(tagName, {ref: el.current, ...props}, children)
  }
}
```

`RefCompFactory(section)`를 호출하면 `section` jsx를 그려주는 `React.createElement` 함수가 반환된다.
```js
// 반환 함수
({name, children, ...props}) => {
  const el = useRef();
  return React.createElement(tagName, {ref: el.current, ...props}, children)
}
```

함수도 객체이므로 `Proxy` target으로 `property` 값이 설정 될 때 `RefCompFactory` 함수를 반환하여 `jsx` 엘리먼트가 생성된다.

```js
const RefComp = RefCompFactory(section);
const Ref = new Proxy(RefComp, {
  get: (target, property) => RefCompFactory(property)
});
```

```
<Ref.div />, <Ref.span /> 등 
Proxy의 property가 RefCompFactory 함수 인수값으로 들어가서 React.createElement 함수가 실행되어 jsx가 그려진다.
```

좀 더 나아가서 컴포넌트마다 `<Ref.div>`을 여러번 사용하면 `React.createElement`을 반환하는 함수가 다 다른 메모리에 저장되서 사용되기 때문에
자바스크립트의 메모라이제이션 Memorization (로컬 캐시) 기술을 통해 메모리에 특정 정보를 저장 기록하여 필요할 때마다 정보를 가져와 활용하는 방법으로 많은 메모리는 낭비하지 않고 필요한 부분만 사용하여 성능적인 부분을 개선할 수 있다.
[메모라이제이션에 대해서](https://webisfree.com/2018-05-15/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%EB%A9%94%EB%AA%A8%EB%9D%BC%EC%9D%B4%EC%A0%9C%EC%9D%B4%EC%85%98(memorization)-%EC%98%88%EC%A0%9C%EB%B3%B4%EA%B8%B0)

```jsx
// 메모라이제이션 외부 스코프를 쓰지 않는(종속성 없는 함수) 순수함수이여야한다.
const pCached = f => {
  const store = new Map;
  return arg => store.has(arg) ? store.get(arg) : store.set(arg, f(arg)).get(arg);
}
```
`store` 배열에 함수 파라미터로 들어온 `key`가 있으면 해당 `key`의 함수를 실행하고, 없으면 `store`에 정보를 추가해준다.

```jsx
const RefCompFactory = pCached(tagName => {
  return ({name, children, ...props}) => {
    const el = useRef();
    return React.createElement(tagName, {ref: el.current, ...props}, children)
  }
});
```
`React.createElement` 함수를 `pCached` 인수값으로 넣어 `Ref`를 이용하여 동일한 jsx를 만들 때 불필요한 리소스를 줄일 수 있다.

이제 `React.createElement`의 ref을 `PageTransitionContext`의 메모리 라우터의 ref, 브라우저 라우터의 ref를 각각 저장한다.
```jsx
const RefCompFactory = pCached(tagName => {
  return ({name, children, ...props}) => {
    const history = useHistory();
    const {state, refs, setRefs} = useContext(PageTransitionContext);
    const el = useRef();
    useEffect(() => {
      if(!el) return;
      if(state.history === history){
        setRefs({ [`browser.${name}.ref`]: el.current });
      }else if(state.memoryHistory === history){
        setRefs({ [`memory.${name}.ref`]: el.current });
      }
      console.log(refs)
    }, [el]); 
    return React.createElement(tagName, {ref: el, ...props}, children)
  }
});
```

`context`의 `state` 값을 보면 페이지가 처음 렌더링 될 때 `ref`는 `undefined`로 들어오게 되는데, 그 이유는 렌더링이 될 떄 자식 컴포넌트가 먼저 그려지고 난 다음 부모 컴포넌트가 그려지게 되는데, 자식컴포넌트에서는 부모의 history를 넘겨받고 있는데 부모가 그려지기 전이라 자식 컴포넌트에서는 히스토리가 `undefined`로 나오는 것이다.

그래서 부모와 자식간의 렌더링 시간차를 두어서 부모의 히스토리를 받아올 수 도록 한다.
```jsx
const BrowserRouterComp = ({children}) => {
  const history = useHistory();
  return <BrowserRouter>
    <HistoryObserver memoryHistory={history}>
      {children}
    </HistoryObserver>
  </BrowserRouter>
}

const App = () => {
  const [isRender, setIsRender] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsRender(true);
    }, 1000)
  }, []);
  return <MemoryRouter>
    <BrowserRouterComp>
      {isRender && <Pages />}
    </BrowserRouterComp>
    {isRender && <Pages />}
  </MemoryRouter>
}
```
-----

### 4. transition
브라우저 라우터와 메모리 라우터의 `component ref`를 각각 저장했다.
메모리 라우터는 보여질 필요가 없으니 숨김 처리하고, 메모리 라우터에서 전환 될 컴포넌트 ref 엘리먼트를 `body`에 추가하여 현재 페이지와, 다음 페이지에 트렌지션 애니메이션을 동시에 준다.

먼저 메모리 라우터를 숨김처리 하기 위해 `Hidden` 컴포넌트를 만들어서 메모리 라우터를 감싼다.
```js
const Hidden = ({children}) => {
  return <div style={{
    width: 0;
    height: 0;
    position: 'absoulte';
    top: 0;
    left: 0;
    zIndex: -1;
    overflow: 'hidden'
  }}>{children}</div>
}

const App = () => {
  ...
  return <MemoryRouter>
    <BrowserRouterComp>
      {isRender && <Pages />}
    </BrowserRouterComp>
    {isRender && <Hidden><Pages /></Hidden>}
  </MemoryRouter>
}
```

그 다음, 다음 페이지의 `component ref` (메모리 라우터에 있는)을 가져와서 링크가 넘어가기 전 현재 페이지와 겹치면서 애니메이션이 동시에 작동 할 수 있도록, `body`에 고정된 엘리먼트 `wrapper`을 만들어 자식으로 `append`하고, 에니메이션이 끝나면 `remove` 되는 컴포넌트를 만든다.
```js
//즉시 함수호출
const fixed = (() => {
  const el = Object.assign(document.createElement('div'), {
    style: `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      display: none;
    `
  })
  document.body.prepend(el);
  return {
    show: () => el.style.display = 'block',
    hide: () => el.style.display = 'none',
    append: (child) => el.appendChild(child),
    remove: (child) => el.removeChild(child),
  }
})(); 
```

현재 페이지와, 다음 페이지의 `ref`를 메모리 라우터에서 얻어와 `fixed` 함수를 사용하여 트렌지션 애니메이션이
`링크 클릭 시` 작동해야하므로 `Link` 컴포넌트에서 `onClick` 함수에 애니메이션 로직을 추가해야한다.  
애니메이션 효과가 여러가지 일 수도 있고, 애니메이션이 걸리는 대상자 ref 엘리먼트도 다 다를 수 있기 때문에 `onCick` 함수에 풀어쓰는것 보단 애니메이션이 작동할 때 필요한 데이터를 매개변수로 받는 (ex pathName, 현재 위치 ref, 다음 위치 ref 등등) 함수를 만들어서 호출하는 것이 편리하다. 또한, `Link` 컴포넌트가 `context`의 상태값을 공유 받아 처리하고 있다.

현재 `Main` 컴포넌트와 `Post` 컴포넌트의 ref를 얻어올 수 있으니 두 페이지가 서로 전환 될 때 페이드 애니메이션을 적용해본다.  
`gotoPage` 에서 인자(매개변수)로 `1. 다음 페이지 ref key, 2. 현재 페이지 ref key, 3. 다음 페이지 링크 to`가 필요하다. 

```jsx
let lock = false;
// 전역변수 lock 은 `Link`의 onClick 함수가 짧은 시간동안 반복적으로 여러번 클릭 시에도 함수가 한 번 실행되도록 블로킹 처리를 해준다.
const Link = ({to, children, className}) => {
  return <PageTransitionConsumer>{({state, refs}) => {
      const gotoPage = () = async() => {
        if(lock) return;
        lock = true;
        gotoTransitionPage({to, state, refs});
        lock = false;
      }
      return <a onClick={gotoPage()} className={className}>{children}</a>
    }}
  </PageTransitionConsumer>
}
const gotoTransitionPage = ({to, state, refs}) => {
  const {history, memoryHistory} = state;
  memoryHistory.push(to);
  await sleep(0);
  let currentPage;
  let nextPage;
  if(pathname === '/'){
    nextPage = refs[`memory.post`];
    currentPage = refs[`browser.main`];
  }
  if(pathname === '/post'){
    nextPage = refs[`memory.main`];
    currentPage = refs[`browser.post`];
  }
  fixed.append(nextPage);
  tween({ duration: 1000 }).start((v) => {
    styler(currentPage).set("opacity", 1 - v);
    styler(nextPage).set("opacity", v);
  });
  fixed.show();
  await sleep(1000);
  fixed.remove(nextPage);
  fixed.hide();
  history.push(to);
}
```
여기서 주의할 점은 `Ref` 컴포넌트의 해당 `ref` 값을 생명주기 `useEffect`내에서 `context` 상태값에 저장하고 있다. `useEffect`는 `jsx`가 렌더링이 끝난 후 수행된다.  
`memoryHistory.push(to)`링크 이동 후 이동 된 페이지의 `Ref`컴포넌트의 `ref`엘리먼트 값이 `context.refs`에 렌더링이 끝난 후 저장되기 때문에 처음에 콘솔로 `refs`를 찍어보면 `undefined`로 저장된다.  
비동기 `sleep` 함수를 이용하여 `push()`후 `useEffect()`가 먼저 수행하고 나서 `context.refs`에서 해당 `ref` 엘리먼트을 얻어 올 수 있다.

또 하나의 문제점은 main -> post / post -> main으로 페이지 이동 될 때 아래와 같은 에러가 발생한다.  
그 이유는 React가 렌더링 한 DOM 노드가 (다른 라이브러리)에 의해 제거되면 React는 변경 사항을 알 수 없으므로 React가 생성한 DOM 부분을 조작하지 않아야 한다.    
예를 들어 제거한 DOM 노드를 React 컴포넌트가 다시 렌더링할 때 에러가 발행 할 수 있다.   
```Uncaught DOMException: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node. [react-dom.development.js:7601]```
[내용 참고](https://stackoverrun.com/ko/q/12098469)

현재 React `Ref` 컴포넌트로 DOM을 렌더링하여 해당 `ref`엘리먼트를 받아 `fixed`자바스크립트 네이티브 함수를 통해 강제로 다른 엘리먼트에 `appendChild, removeChild`를 하고 있다.  
`ref`엘리먼트가 있던 `root자리`에 없어서 다시 렌더링 될 때 에러가 발생하는 것이다.
이 에러를 해결하기 위해 `Ref`를 사용하여 렌더링하고 있는 컴포넌트를 jsx `<div>`로 한번 더 감싸주면 해결된다.

```jsx
const PageRoute = ({component, ...props}) => {
  return <Route {...props} render={() => <div>{component}</div>} />
}
const Pages = () => <>
  <PageRoute exact path='/main' component={<Main />} />
  <PageRoute exact path='/post' component={<Post />} />
</>
```
-----

### `5. image, video loading`
렌더링 될 때 로딩 시간이 걸리는 이미지, 비디오 등 엘리먼트가 다음 페이지 내애 있다고 가정하면 페이지가 전환될 때 페이드 애니메이션은 작동 하겠지만 애니메이션과 별개로 이미지나 비디오는 로딩이 끝난 후 렌더링 되기 때문에 뚝 끊기는 현상이 나타날 것이다.

이러한 현상을 보완하기 위해 이미지와 비디오 등 로딩이 필요한 엘리먼트가 로딩이 되었을 때 다음 페이지로 전환해주면 이미 로딩이 끝났기 때문에 렌더링만 해주면 로딩시간을 필요가 없어 뚝 끊기는 현상이 없어진다.   

여러가지 방법이 있다.  
**`gotoTransitionPage` 함수 스코프 내에서 할 수 있는 방법**   
이미지와 비디오를 `Ref` 컴포넌트로 엘리먼트를 만들어서 `context.refs`에서 다음 페이지에 있는 이미지와 비디오 엘리먼트를 얻어와 로딩이 다 되었을 때 애니메이션이 수행되는 방법   

**`Link onClick` 함수 스코프 내에서 할 수 있는 방법**  
1번 방법으로 하게되면 `<Ref.img>` 사용 시 `props name` 값을 필수로 지정해 줘야하고,
이미지가 한개 이상 일 때, 다른 트리 구조에 있는 이미지 일 때 `ref 엘리먼트`를 얻어오는데 어려움이 있다.   
엘리먼트를 알 수 있고 만들어지는 `RefCompFactory` 컴포넌트에서 이미지/비디오 엘리먼트가 생성되면 로딩 확인이 필요한 엘리먼트들을 `Set` 객체에 저장하여 
`Link`컴포넌트 `onClick` 함수 스코프내에서 `Set`객체에 있는 엘리먼트들의 로딩 완료를 먼저 확인 후 트렌지션 애니메이션 함수를 실행한다.  

먼저 로딩이 필요한 엘리먼트들의 집합 `Set`을 `context`에 생성해야 `Link`컴포넌트에서 상태를 공유받을 수 있다.
```jsx
const PageTransitionProvider = ({...props}) => {
  const [state, setState] = useState({});
  const [refs, setRefs] = useState({});
  const [images, setImages] = useState(new Set);
  return <Provider {...props} value={{
    ...
    images,
    setImages: el => setImages(images.add(el));
  }} />
}
```

또, 로딩 완료 상태 확인이 필요한 이미지와 그렇지 않은 이미지가 있을 수도 있으니 구분하기 위해 `Ref` 컴포넌트에 프로퍼티`preload`를 추가하여 `Set`에 저장한다. 그리고 `name`이 적용되어있는 엘리먼트만 `refs`에 저장되도록 `if`문을 수정한다.
```jsx
const RefCompFactory = pCached(tagName => {
  return ({name, preload, children, ...props}) => {
    ...
    useEffect(() => {
      if(!el) return;
      if(state.history === history){
        name && setRefs({ [`browser.${name}.ref`]: el.current });
      }else if(state.memoryHistory === history){
        name && setRefs({ [`memory.${name}.ref`]: el.current });
        if(preload && el.current.tagName === 'IMG') && setImages(el.current);
      }
    }, [el]); 
    ...
  }
});
```

이제 로딩완료 확인이 필요한 이미지들이 `context Set`에 저장되어있다. 저장 되어있는 이미지 엘리먼트들의 로딩 확인이 필요한 비동기 함수를 만든다.   
```js
const checkImages = async(imgs) => {
  return imgs.map(img => new Promise((resolve, reject) => {
    img.onload = () => resolve(true)
    img.onerror = (err) => reject(err)  
    // 이미지 onload, onerror는 최초 한 번만 실행 되기 때문에, 이미 로딩이 끝난 이미지를 onload로 체크하지 못한다.
    // 로딩확인이 끝난 이미지 complete 속성이 true로 바뀌는데, true인 이미지는 바로 완료처리를 해줘야한다.
    img.complete && resolve(true)
  }))
}
```

`Link` 컴포넌트에서 `context Set` 저장 되어있는 이미지들이 로딩이 끝난 후 트렌지션 애니메이션 함수가 수행되도록 로직 순서를 바꾼다. `gotoTransitionPage` 함수에서 `메모리라우터`의 있는 `ref`엘리먼트를 가져오기 위해 메모리라우터 링크가 이동되는 로직이 `checkImages` 함수보다 먼저 실행되어야 `Set`에 저장되어있는 데이터를 배열로 분해하여 사용할 수 있다.
```jsx
const Link = ({to, children, className}) => {
  return <PageTransitionConsumer>{({state, refs, images}) => {
      const gotoPage = async() => {
        if(lock) return;
        lock = true;
        state.vHistory.push(to);
        await sleep(0);
        await Promise.all(await checkImages([...images]));
        await gotoTransitionPage({to, refs});
        state.history.push(to);
        images.clear();
        lock = false;
      }
      return <a onClick={gotoPage} className={className}>{children}</a>
    }}
  </PageTransitionConsumer>
}

const gotoTransitionPage = async({to, refs}) => {
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
```

-----

### `참고. React rendering 리액트 렌더링 이해와 최적화 (함수형 컴포넌트)`
[내용참고](https://medium.com/vingle-tech-blog/react-%EB%A0%8C%EB%8D%94%EB%A7%81-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-f255d6569849)   
리액트에서 `jsx`(return 부분)을 렌더링을 실행하는 조건은
1. **props**가 변경되었을 때
2. **state**가 변경되었을 때
3. **부모 컴포넌트가** 렌더링 되었을 때

1~3번의 과정을 통해 컴포넌트가 렌더링 될 때 **자식 컴포넌트** 또한 같은 과정으로 렌더링이 된다.
하지만 렌더링이 다시 되어 업데이트 될 변경사항이 없는데, 위 과정을 통해 다시 렌더링이 된다면 성능이 떨어지고, 컴포넌트 트리구조가 깊을 수록 
더 많은 렌더링이 수행하므로 성능에 좋지 않다.   
[예제참고](https://codesandbox.io/s/strange-currying-5lxrp?from-embed)   
```부모 컴포넌트에서 자기자신 상태를 변경하였지만, 자식 컴포넌트(Title)가 다시 렌더링 되는 것을 콘솔을 통해 확인 할 수 있다.```   

```jsx
export default function App() {
  const [value, setValue] = useState({ name: "jihye" });
  console.log("render", value);
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>{value.name} - Start editing to see some magic happen!</h2>
      <input type="text" name="name" onChange={changeValue} />
    </div>
  );
}
```

























