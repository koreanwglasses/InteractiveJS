function Parametric(func, intervals) {
    this.func = func;
    this.intervals = Array.from(arguments).slice(1)
}

export { Parametric };