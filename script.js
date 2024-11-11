// Dependency Tracker
let activeEffect = null;
function effect(fn) {
    activeEffect = fn;
    fn(); // Gọi hàm để theo dõi phụ thuộc ban đầu
    activeEffect = null;
}

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
        this.subscribers.forEach((subscriber) => subscriber());
    }
}

// Map lưu trữ phụ thuộc
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

// Hàm reactive để tạo Proxy cho đối tượng
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
        },
    });
}
