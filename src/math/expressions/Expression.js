import { Vector } from '../Vector.js';

function Expression(string, context) {
    this.type = 'Expression';

    this.string = string;    
    this.validated = false;
    this.function = null;
    this.context = context;
}

Expression.typeOf = function(string) {
    var nestingLevel = 0;
    var isVector = false;
    for(var i = 0; i < string.length; i++) {
        if(string.charAt(i) === '(') {
            nestingLevel++;
        } else if (string.charAt(i) === ')') {
            nestingLevel--;
        } else
        if(string.charAt(i) === ',' && nestingLevel === 1) {
            isVector = true;
        }
        if(string.charAt(i) === ';' && nestingLevel === 1) {
            return 'matrix';
        }
        if(nestingLevel === 0 && i !== string.length - 1) {
            return 'expression';
        }
    }
    if(isVector) return 'vector';
    return 'expression';
}

Expression.separate = function(str) {
    // Separate into parts which alternate (expression/operator)
    var parts = []
    var start = 0;
    var nestingLevel = 0;
    var type = null;
    for(var i = 0; i < str.length; i++) {
        if(str.charAt(i) === '(') {
            nestingLevel++

            if(type === null) {
                type = 'expression';
            }
            if(type === 'operator') {
                parts.push({str: str.substring(start, i), type: type})
                start = i;
                type = 'expression';
            } else if (type === 'variable') {
                type = 'function';
                parts.push({str: str.substring(start, i), type: type})
                start = i;
                type = 'expression';
            }
        } else if(str.charAt(i) === ')') {
            nestingLevel--;
        } else if(nestingLevel == 0) {                    
            if(/[0-9a-zA-z.]/.test(str.charAt(i)) === false) {
                parts.push({str: str.substring(start, i), type: type})
                start = i;
                type = 'operator';
            } else {
                if(type === null) {
                    type = 'constant'
                }
                if(type === 'operator') {
                    parts.push({str: str.substring(start, i), type: type})
                    start = i;
                    type = 'constant';
                }
                if(/[0-9.]/.test(str.charAt(i)) === false)
                    type = 'variable';
            }
        }
    }
    if(start != str.length) {
        parts.push({str: str.substring(start, str.length), type:type})
    }

    // Split the expressions if applicable
    for(var i = 0; i < parts.length; i++) {
        if(parts[i].type === 'expression') {
            parts[i].type = Expression.typeOf(parts[i].str);
            if(parts[i].type === 'expression') {
                var newstr = parts[i].str.slice(1,parts[i].str.length-1)
                var newparts = [{str:'(',type:'('}].concat(Expression.separate(newstr))
                newparts.push({str:')',type:')'})
                parts = parts.slice(0,i).concat(newparts).concat(parts.slice(i+1,parts.length))
                i += newparts.length - 1;
            } else if (i > 0 && parts[i].type === 'vector' && parts[i - 1].type === 'function') {
                parts.splice(i ,0,{str:'(',type:'('});
                parts.splice(i+2, 0, {str:')',type:')'});
            }
        }
    }
    return parts;
}

Expression.toPostfix = function(parts) {
    var post = [];
    var ops = [];
    var funs = [];
    var precedence = {'+': 0, '-': 0, '*': 1, '/': 1, '^': 2, '(': -1, ')': -1}
    for(var i = 0; i < parts.length; i++) {
        if(parts[i].type === 'operator') {
            while(ops.length > 0 && precedence[ops[ops.length - 1].str] >= precedence[parts[i].str]) {
                post.push(ops.pop());
            }
            ops.push(parts[i]);
        } else if (parts[i].type === 'function') {
            funs.push(parts[i]);
        } else if (parts[i].type === '(') {
            ops.push(parts[i]);
        } else if (parts[i].type === ')') {
            while(ops[ops.length - 1].type !== '(') {
                post.push(ops.pop());
            }
            if(funs.length > 0) {
                post.push(funs.pop());
            }
            ops.pop();
        } else {
            if(parts[i].type === 'constant') {
                parts[i].value = parseFloat(parts[i].str);
            }
            post.push(parts[i]);
        }
    }
    while(ops.length > 0) {
        post.push(ops.pop());
    }
    return post;
}

Expression.splitVector = function(string) {
    var str = string.substring(1,string.length - 1);
    var parts = []
    var start = 0;
    var nestingLevel = 0;
    for(var i = 0; i < str.length; i++) {
        if(str.charAt(i) === '(') {
            nestingLevel++;
        } else if(str.charAt(i) === ')') {
            nestingLevel--;
        } else if(nestingLevel == 0) {                    
            if(str.charAt(i) === ',') {
                parts.push(str.substring(start,i));
                start = i + 1;
            }
        }
    }
    parts.push(str.substring(start, str.length))
    return parts;
}

// Expression.toJSExpression = function(str) {
//     var parts = Expression.separate(str);
//     var func = '';
//     for(var i = 0; i < parts.length; i++) {
//         if(parts[i].type === 'variable') {
//             if(Math[parts[i].str] !== undefined) {
//                 func += 'Math.' + parts[i].str;
//             } else {
//                 func += 'context.' + parts[i].str;
//             }
//         } else if (parts[i].type === 'vector') {
//             var components = Expression.splitVector(parts[i].str);
//             func += 'new Vector(';
//             for(var j = 0; j < components.length; j++) {
//                 func += Expression.toJSExpression(components[j])
//                 func += ','
//             }
//             func = func.slice(0,func.length - 1)
//             func += ')'
//         } else {
//             func += parts[i].str;
//         }
//     }
//     return func;
// }

Expression.toJSFunction = function(string) {
    var str = string.trim();

    // Expression is an equation:
    if(str.match(/=/g) !== null && str.match(/=/g).length === 1) {
        var left, right;
        if(str.includes(':=')) {
            left = string.split(':=')[0];
            right = string.split(':=')[1];
        } else {
            left = string.split('=')[0];
            right = string.split('=')[1];
        }
        
        var leftParts = Expression.separate(left);

        // variable assignment
        if(leftParts.length === 1 && leftParts[0].type === 'variable') {
            var righteval = Expression.toJSFunction(right);
            var func;
            // Static assignment
            if(str.includes(':=')) {
                func = function(context) {
                    return context[leftParts[0].str] = righteval(context);
                }
            } else { // Dynamic Assignment
                func = function(context) {
                    Object.defineProperty(context, leftParts[0].str, {get: function() { return righteval(context); }} );
                    return context[leftParts[0].str]
                }
            }
            return func;
        } 
        
        var leftPost = Expression.toPostfix(leftParts);

        // function definition
        if(leftPost.length === 2 && leftPost[leftPost.length - 1].type === 'function') {
            var righteval = Expression.toJSFunction(right);
            if(leftPost[0].type === 'variable') {
                var func = function(context) {
                    return context[leftPost[leftPost.length - 1].str] = function(v) {
                        Object.assign({}, context);
                        context[leftPost[0].str] = v.q[0];
                        return righteval(context);
                    }
                }

                return func;
            }
            if(leftPost[0].type === 'vector') {
                var args = Expression.splitVector(leftPost[0].str)
                console.log(args)

                var func = function(context) {
                    return context[leftPost[leftPost.length - 1].str] = function(v) {
                        Object.assign({}, context);
                        for(var i = 0; i < args.length; i++) {
                            context[args[i]] = v.q[i];
                        }
                        return righteval(context);
                    }
                }

                return func;
            }
        }
    } else {
        var type = Expression.typeOf(str);

        if(type === 'expression') {
            var operations = Expression.toPostfix(Expression.separate(str));
            // var postfix = ''
            // for(var i = 0; i < operations.length; i++) {
            //     postfix += operations[i].str + ' '
            // }
            // console.log(postfix);

            for(var i = 0; i < operations.length; i++) {
                switch(operations[i].type) {
                    case 'vector':                        
                        operations[i].eval = Expression.toJSFunction(operations[i].str);
                        break;
                    case 'constant':
                        operations[i].value = parseFloat(operations[i].str);
                        break;
                }
            }
            
            var func = function(context) {
                var stack = [];
                for(var i = 0; i < operations.length; i++) {
                    switch(operations[i].type) {
                        case 'vector':
                            stack.push(operations[i].eval(context));
                            break;
                        case 'constant':
                            stack.push(operations[i].value);
                            break;
                        case 'variable':
                            stack.push(context[operations[i].str]);
                            break;
                        case 'function':
                            var v = stack.pop();
                            if(!(v instanceof Vector)) {
                                v = new Vector(v);
                            }

                            if(Math[operations[i].str] !== undefined) {
                                stack.push(Math[operations[i].str].apply(null, v.q))
                            } else {
                                stack.push(context[operations[i].str](v));
                            }
                            break;
                        case 'operator':
                            var b = stack.pop();
                            var a = stack.pop();
                            if(typeof a === 'number' && typeof b === 'number') {
                                switch(operations[i].str) {
                                    case '+':
                                        stack.push(a + b);
                                        break;
                                    case '-':
                                        stack.push(a - b);
                                        break;
                                    case '*':
                                        stack.push(a * b);
                                        break;
                                    case '/':
                                        stack.push(a / b);
                                        break;
                                    case '^':
                                        stack.push(Math.pow(a, b));
                                        break;                                                                    
                                }
                            } else if(typeof a === 'number') {
                                switch(operations[i].str) {
                                    case '+':
                                        stack.push(b.preAdd(a));
                                        break;
                                    case '-':
                                        stack.push(b.preSub(a));
                                        break;
                                    case '*':
                                        stack.push(b.preMul(a));
                                        break;
                                    case '/':
                                        stack.push(b.preDiv(a));
                                        break;
                                    case '^':
                                        stack.push(b.preExp(a));
                                        break;                                                                    
                                }
                            } else {
                                switch(operations[i].str) {
                                    case '+':
                                        stack.push(a.add(b));
                                        break;
                                    case '-':
                                        stack.push(a.sub(b));
                                        break;
                                    case '*':
                                        stack.push(a.mul(b));
                                        break;
                                    case '/':
                                        stack.push(a.div(b));
                                        break;
                                    case '^':
                                        stack.push(a.exp(b));
                                        break;                                                                    
                                }
                            }
                    }
                }
                return stack.pop();
            }

            return func;
        } else if (type === 'vector') {
            var components = Expression.splitVector(str);

            var compeval = [];
            for(var i = 0; i < components.length; i++) {
                compeval.push(Expression.toJSFunction(components[i]));
            }

            var func = function(context) {
                var vector = new Vector();
                vector.dimensions = compeval.length;
                for(var i = 0; i < compeval.length; i++) {
                    vector.q[i] = compeval[i](context);
                }
                return vector;
            }

            return func;
        }
    }
}

Expression.prototype.evaluate = function() {
    if(this.validated === false) {
        this.function = Expression.toJSFunction(this.string);
        this.validated = true;
    }
    return this.function(this.context);
}

export { Expression };