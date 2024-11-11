# Reactivity System Demo

Ứng dụng này là một ví dụ đơn giản về cách xây dựng hệ thống phản ứng (Reactivity System) bằng JavaScript. Chúng ta sử dụng `Proxy` để tự động cập nhật giao diện người dùng (UI) khi dữ liệu thay đổi, mà không cần gọi hàm cập nhật thủ công.

## Mục Tiêu

- Xây dựng một hệ thống phản ứng đơn giản sử dụng `Proxy` trong JavaScript.
- Tự động cập nhật UI khi dữ liệu (`state.count`) thay đổi.

## Cấu Trúc Dự Án

- **index.html**: Tệp HTML đơn giản chứa các phần tử giao diện.
- **script.js**: Tệp JavaScript chứa mã hệ thống phản ứng.

## Cách Hoạt Động

### 1. Cấu Trúc HTML

```html
<div id="app">
  <p>Count: <span id="count"></span></p>
  <button id="increment">Increase Count</button>
</div>

```

### 2. Hệ thống Phản ứng trong JavaScript

#### 2.1 Dependency Tracker
Chúng ta sử dụng một lớp `Dependency` để theo dõi các hiệu ứng (effects) và kích hoạt lại khi dữ liệu thay đổi.

```js
class Dependency {
  constructor() {
    this.subscribers = new Set();
  }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }

  notify() {
    this.subscribers.forEach(subscriber => subscriber());
  }
}
```
+ `depend()`: Lưu các hàm `effect` đang hoạt động vào `subscribers`.
+ `notify()`: Kích hoạt lại các hàm `effect` khi dữ liệu thay đổi.

#### 2.2 track và trigger
+ `track`: Theo dõi phụ thuộc vào dữ liệu khi truy cập giá trị trong Proxy.
+ `trigger`: Kích hoạt các phụ thuộc khi dữ liệu thay đổi.
```js
const targetMap = new WeakMap();

function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dependency();
    depsMap.set(key, dep);
  }
  dep.depend();
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) {
    dep.notify();
  }
}

```

#### 2.3 reactive
Hàm reactive sử dụng Proxy để chặn các thao tác get và set:

+ `get`: Gọi `track` để theo dõi thuộc tính khi được truy cập.
+ `set`: Gọi `trigger` để kích hoạt các hiệu ứng khi thuộc tính được thay đổi.

```js
function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      track(obj, key);
      return obj[key];
    },
    set(obj, key, value) {
      obj[key] = value;
      trigger(obj, key);
      return true;
    }
  });
}

```
### 3. Tích hợp Hệ thống Phản ứng với UI
#### 3.1 Sử dụng `effect` để Theo dõi Thay Đổi

Hàm `effect` ghi nhận các hàm `fn` để tự động cập nhật UI khi `state.count` thay đổi.
```js
let activeEffect = null;
function effect(fn) {
  activeEffect = fn;
  fn(); // Chạy hàm ngay lần đầu để theo dõi phụ thuộc
  activeEffect = null;
}
```

#### 3.2 Kết Nối UI và Hệ Thống Phản Ứng
+ Sử dụng effect để tự động cập nhật UI khi count thay đổi.
+ Thêm sự kiện click vào nút để tăng count và kích hoạt cập nhật UI.

```js
const state = reactive({ count: 0 });

effect(() => {
  document.getElementById("count").innerText = state.count;
});

document.getElementById("increment").addEventListener("click", () => {
  state.count++;
});
```

## Authors

- [@vietanhdang](https://www.github.com/vietanhdang)


## Related
[Evan You on Proxies](https://www.vuemastery.com/courses/advanced-components/evan-you-on-proxies)
