### `Route transition animation`
```
1. 링크 클릭 시 바로 라우터가 넘어가면 안되고 멈춘 상태에서 전환 라우터가 현재 라우터 같은 위치에 보이지 않게 랜더링 하고, 
2. 두 라우터의 wrapper element를 찾은 후 현재 라우터 element에는 out-animation 작동하고 
3. 현재 라우터의 out-animation이 끝나기 전에 전환 페이지에 in-animation 작동한 다음
4. out-animation과 in-animation 끝나면 전환 라우터 링크로 이동
```
-----

#### `1. memoryRouter, BrowserRouter`
현재 페이지와, 전환 페이지가 이어지는 트랜지션 애니메이션을 주기 위해선, 
같은 페이지에 위치해야 자연스러운 애니메이션이 작동한다. 

`react-router-dom`의 메모리 라우터(`MemoryRouter`)의 `history`를 이용하여 전환되는 페이지를 `push()`하여 메모리 라우터에는 전환 페이지가 랜더링 되고, 브라우저 라우터(`BrowserRouter`)는 현재 페이지로 유지하며 동시에 in, out 애니메이션이 작동되어야 한다.

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
`Router의 구조`를 간단히 생각해보면, 메모리 라우터 안에, 브라우저 라우터와 페이지들이 위치하고, 페이지 이동은 되지 않지만 랜더링하기 위한 메모리 라우터 페이지들이 위치한다.

메모리 라우터를 이동시키기 위한 방법은 메모리 라우터의 `useHistory()` 사용하여 해당 페이지로 랜더링이 (`push()`)되어야 하는데, `useHistory()`는 실제 컴포넌트의 제일 가까이 있는 부모 라우터`Router`의 (컴포넌트가 아님) `history`를 가져오기 때문에, 메모리 라우터의 `history`를 받기 위해선 부모/자식 계층이여야(컴포넌트) 받아올 수 있다.

```js
// 메모리 라우터와 브라우저 라우터에 랜더링할 페이지가 필요하므로 컴포넌트화한다.
const Pages = () => <>
  <Route exact path='/main' render={_=><Main />} />
  <Route exact path='/post' render={_=><Post />} />
</>

// 부모 라우터로 부터 history를 받아 조작 할 수 있도록 컴포넌트를 만든다.
const HistoryObserver = ({memoryHistory, children}) => {
  const history = useHistory(); // BrowerRouter history
  useEffect(() => {
    console.log(memoryHistory) // MemoryRouter history
    memoryHistory.push('/main');
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
const BrowerRouterComp = () => {
  const history = useHistory();
  return <BrowerRouter>
    <HistoryObserver memoryHistory={history}>
      <Page />
    </HistoryObserver>
  </BrowerRouter>
}

const App = () => {
  return <MemoryRouter>
    <BrowerRouterComp />
    <Pages />
  </MemoryRouter>
}
```










