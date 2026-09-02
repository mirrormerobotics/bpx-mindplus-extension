class Func {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        this.extensionId = extensionId;
    }

    sayHello(generator, block, parameter) {
        const text = parameter.TEXT.code;
        return `print(${text})`;
    }

    helloText(generator) {
        return ['"Hello Mind+"', generator.ORDER_ATOMIC];
    }
}

export default Func;
