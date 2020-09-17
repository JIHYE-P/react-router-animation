### `페이지 전환 트랜지션 애니메이션 과정`
```
1. 링크 클릭 시 링크가 넘어가면 안되고 멈춘 상태에서 전환되는 페이지와, 현재 페이지의 wrapper 찾기
2. wrapper 찾은 후 전환 페이지 wrapper를 현재 페이지 같은 위치에 보이지 않게 rendering 후
3. 현재 페이지 wrapper에 out-animation 작동하고
4. out-animation이 끝나기 전에 전환 페이지에 in-animation 작동하고
5. out-animation과 in-animation 끝나면 현재 wrapper 삭제 후 전환 페이지 링크로 이동
```
-----

