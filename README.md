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
 * BrowerRouterComp 컴포넌트를 만든 이유는 
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
  return <Provider {...props} value={{
    state, 
    setState: obj => setState(Object.assign(state, obj))
  }} />
}
```

```jsx
export const Link = ({to, children, className}) => {
  return <PageTransitionConsumer>
    {({state}) => {
      const gotoPage = (pathName) = async() => {
        state.memoryHistory.push(pathName);
        await sleep(2000);
        state.history.push(pathName);
        //전환 애니메이션 작동부분
      }
      return <a onClick={gotoPage(to)} className={className}>{children}</a>
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

















