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
  const [history, setHistory] = useState({});
  const [memoryHistory, setMemoryHistory] = useState({});
  return <Provider {...props} value={{
    history,
    setHistory,
    memoryHistory,
    setMemoryHistory
  }} />
}
```

```jsx
export const Link = ({to, children, className}) => {
  return <PageTransitionConsumer>
    {({history, memoryHistory}) => {
      const gotoPage = (pathName) = async() => {
        memoryHistory.push(pathName);
        await sleep(2000);
        history.push(pathName);
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
    context.setHistory = history; // BrowerRouter history
    context.setMemoryHistory = memoryHistory 
  }, []);
  return <>{children}</>
}
```

링크를 연결해 줄 페이지 컴포넌트에서 `<Link to="post">Go to Post Page</Link>`를 사용하면 
메모리 라우터 `Post` 페이지가 렌더링 된 후 2초 뒤에 (sleep 함수) 브라우저 라우터 `history.push()`가 작동하면서
주소가 해당 링크로 이동되어 브라우저 라우터 `Post` 페이지가 렌더링된다.












