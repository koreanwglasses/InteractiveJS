import { Vector } from '../Vector.js';
import { Interval } from '../Interval.js';
import { MathPlus } from '../MathPlus.js';

function Expression(string, context) {
    this.type = 'Expression';

    this.string = string;

    this.context = context;

    this.variables = [];
    this.function = this.toJSFunction(this.string);
}

Expression.prototype.getVariables = function () {
    var variables = []
    for (var i = 0; i < this.variables.length; i++) {
        var v = this.variables[i];
        if (this.context.functions[v] !== undefined && variables.includes(v) === false) {
            variables = variables.concat(this.context.functions[v].getVariables());
        } else {
            variables.push(v)
        }
    }
    return variables;
}

Expression.typeOf = function (string) {

    if (string === '()') return 'null';
    if (string.includes('|')) return 'isoline';
    if (string.includes('=')) return 'equation';

    var nestingLevel = 0;
    var isVector = false;
    if (string.charAt(string.length - 1) === '}') {
        if (string.charAt(0) === '{')
            return 'interval'
        else
            return 'parametric'
    }
    if (string.includes('(') === false && string.includes(')') === false) {
        if (/^[0-9.]+$/.test(string)) {
            return 'constant'
        } else if (string.includes('+') || string.includes('-') || string.includes('*') || string.includes('/') || string.includes('^')) {
            return 'expression'
        } else {
            return 'variable'
        }
    }
    for (var i = 0; i < string.length; i++) {
        if (string.charAt(i) === '(') {
            nestingLevel++;
        } else if (string.charAt(i) === ')') {
            nestingLevel--;
        } else
            if (string.charAt(i) === ',' && nestingLevel === 1) {
                isVector = true;
            }
        if (string.charAt(i) === ';' && nestingLevel === 1) {
            return 'matrix';
        }
        if (nestingLevel === 0 && i !== string.length - 1) {
            return 'expression';
        }
    }
    if (isVector) return 'vector';
    return 'expression';
}

Expression.separate = function (str) {
    // Separate into parts which alternate (expression/operator)
    var parts = []
    var start = 0;
    var nestingLevel = 0;
    var type = null;
    for (var i = 0; i < str.length; i++) {
        if (type === 'interval') {
            if (str.charAt(i) === '}') {
                parts.push({ str: str.substring(start, i + 1), type: type })
                start = i + 1;
                type = null;
            }
        } else if (str.charAt(i) === '{') {
            type = 'interval'
        } else if (str.charAt(i) === '(') {
            nestingLevel++

            if (type === null) {
                type = 'expression';
            }
            if (type === 'operator' || type === 'uoperator') {
                parts.push({ str: str.substring(start, i), type: type })
                start = i;
                type = 'expression';
            } else if (type === 'variable') {
                type = 'function';
                parts.push({ str: str.substring(start, i), type: type })
                start = i;
                type = 'expression';
            }
        } else if (str.charAt(i) === ')') {
            nestingLevel--;
        } else if (nestingLevel == 0) {
            if (str.charAt(i) === '-' && (type === null || type === 'operator')) {
                if (type === 'operator') {
                    parts.push({ str: str.substring(start, i), type: type })
                    start = i;
                }
                type = 'uoperator';
            } else if (/[0-9a-zA-Z.]/.test(str.charAt(i)) === false || str.charAt(i) === '^') {
                parts.push({ str: str.substring(start, i), type: type })
                start = i;
                type = 'operator';
            } else {
                if (type === null) {
                    type = 'constant'
                }
                if (type === 'operator' || type === 'uoperator') {
                    parts.push({ str: str.substring(start, i), type: type })
                    start = i;
                    type = 'constant';
                }
                if (/[0-9.]/.test(str.charAt(i)) === false)
                    type = 'variable';
            }
        }
    }
    if (start != str.length) {
        parts.push({ str: str.substring(start, str.length), type: type })
    }

    // Split the expressions if applicable
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === 'expression') {
            parts[i].type = Expression.typeOf(parts[i].str);
            if (parts[i].type === 'expression') {
                var newstr = parts[i].str.slice(1, parts[i].str.length - 1)
                var newparts = [{ str: '(', type: '(' }].concat(Expression.separate(newstr))
                newparts.push({ str: ')', type: ')' })
                parts = parts.slice(0, i).concat(newparts).concat(parts.slice(i + 1, parts.length))
                i += newparts.length - 1;
            } else if (i > 0 && parts[i].type === 'vector' && parts[i - 1].type === 'function') {
                parts.splice(i, 0, { str: '(', type: '(' });
                parts.splice(i + 2, 0, { str: ')', type: ')' });
            } else if (parts[i].type === 'null') {
                parts[i].str = '';
                parts.splice(i, 0, { str: '(', type: '(' });
                parts.splice(i + 2, 0, { str: ')', type: ')' });
            }
        }
    }
    return parts;
}

Expression.toPostfix = function (parts) {
    var post = [];
    var ops = [];
    var funs = [];
    var precedence = { '+': 0, '-': 0, '*': 1, '/': 1, '^': 2, '(': -1, ')': -1 }
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === 'operator' || parts[i].type === 'uoperator') {
            while (ops.length > 0 && (ops[ops.length - 1].type === 'uoperator' || precedence[ops[ops.length - 1].str] >= precedence[parts[i].str])) {
                post.push(ops.pop());
            }
            ops.push(parts[i]);
        } else if (parts[i].type === 'function') {
            funs.push(parts[i]);
        } else if (parts[i].type === '(') {
            ops.push(parts[i]);
        } else if (parts[i].type === ')') {
            while (ops[ops.length - 1].type !== '(') {
                post.push(ops.pop());
            }
            if (funs.length > 0) {
                post.push(funs.pop());
            }
            ops.pop();
        } else {
            post.push(parts[i]);
        }
    }
    while (ops.length > 0) {
        post.push(ops.pop());
    }
    return post;
}

Expression.splitTuple = function (string) {
    var str = string.substring(1, string.length - 1);
    var parts = []
    var start = 0;
    var nestingLevel = 0;
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) === '(') {
            nestingLevel++;
        } else if (str.charAt(i) === ')') {
            nestingLevel--;
        } else if (nestingLevel == 0) {
            if (str.charAt(i) === ',') {
                parts.push(str.substring(start, i));
                start = i + 1;
            }
        }
    }
    parts.push(str.substring(start, str.length))
    return parts;
}

Expression.splitParametric = function (string) {
    return string.split(/(?={)/);
}

Expression.prototype.toJSExpression = function (string, specials, isparam, variables) {
    var str = string.replace(/\s+/g, '')

    var type = Expression.typeOf(str);

    // Expression is an equation:
    if (type === 'equation') {
        var left, right;
        left = string.split('=')[0];
        right = string.split('=')[1];

        var leftParts = Expression.separate(left);

        // variable assignment
        if (leftParts.length === 1 && leftParts[0].type === 'variable') {
            var expr = 'context["' + left + '"]=' + this.toJSExpression(right);
            return expr;
        }

        // function definition
        if (leftParts[0].type === 'function') {
            if (leftParts[2].type === 'null') {
                var expr = 'context["' + leftParts[0].str + '"]=function(){ return ' + this.toJSExpression(right) + '; }';
            } else if (leftParts[2].type === 'vector') {
                var expr = 'context["' + leftParts[0].str + '"]=function' + leftParts[2].str + '{ return ' + this.toJSExpression(right, Expression.splitTuple(leftParts[2].str)) + '; }';
            } else if (leftParts[2].type === 'variable') {
                var expr = 'context["' + leftParts[0].str + '"]=function(' + leftParts[2].str + '){ return ' + this.toJSExpression(right, leftParts[2].str) + '; }';
            }
            this.context.functions[leftParts[0].str] = this;
            return expr;
        }
    } else if (type === 'expression') {
        var operations = Expression.toPostfix(Expression.separate(str));

        var stack = [];

        for (var i = 0; i < operations.length; i++) {
            switch (operations[i].type) {
                case 'null':
                    stack.push('');
                    break;
                case 'variable':
                    if (specials !== undefined && specials.includes(operations[i].str)) {
                        stack.push(operations[i].str);
                    } else {
                        stack.push('context["' + operations[i].str + '"]')
                        if (this.variables.includes(operations[i].str) === false) this.variables.push(operations[i].str);
                    }
                    break;
                case 'constant':
                    stack.push('new Interactive.Number(' + operations[i].str + ')')
                    break;
                case 'vector':
                    var param = operations[i + 1].type === 'function';
                    stack.push(this.toJSExpression(operations[i].str, specials, param));
                    break;
                case 'function':
                    var a = stack.pop()
                    stack.push('context["' + operations[i].str + '"](' + a + ')');
                    if (this.variables.includes(operations[i].str) === false) this.variables.push(operations[i].str);
                    break;
                case 'uoperator':
                    var a = stack.pop()
                    stack.push(a + '.neg()');
                    break;
                case 'operator':
                    var b = stack.pop();
                    var a = stack.pop();
                    switch (operations[i].str) {
                        case '+':
                            stack.push(a + '.add(' + b + ')')
                            break;
                        case '-':
                            stack.push(a + '.sub(' + b + ')')
                            break;
                        case '*':
                            stack.push(a + '.mul(' + b + ')')
                            break;
                        case '/':
                            stack.push(a + '.div(' + b + ')')
                            break;
                        case '^':
                            stack.push(a + '.exp(' + b + ')')
                            break;
                        default:
                            console.log('Interactive.Expression: Unknown symbol')
                    }
                    break;
                default:
                    console.log('Interactive.Expression: Unknown symbol')
            }
        }

        return stack[0];
    } else if (type === 'vector') {
        var components = Expression.splitTuple(str);
        if (isparam) {
            var expr = ''
            for (var i = 0; i < components.length; i++) {
                expr += this.toJSExpression(components[i], specials) + ',';
            }
            expr = expr.slice(0, expr.length - 1)
            return expr;
        } else {
            var expr = 'new Interactive.Vector('
            for (var i = 0; i < components.length; i++) {
                expr += this.toJSExpression(components[i], specials) + ',';
            }
            expr = expr.slice(0, expr.length - 1) + ')'
            return expr;
        }
    } else if (type === 'interval') {
        var params = Expression.splitTuple(str);

        var expr = 'new Interactive.Interval("' + params[0] + '",';
        for (var i = 1; i < params.length; i++) {
            expr += this.toJSExpression(params[i], specials) + ',';
        }
        expr = expr.slice(0, expr.length - 1) + ')'
        return expr;
    } else if (type === 'variable') {
        if (specials !== undefined && specials.includes(str)) return str
        var expr = 'context["' + str + '"]'
        if (this.variables.includes(str) === false) this.variables.push(str);
        return expr;
    } else if (type === 'parametric') {
        var params = Expression.splitParametric(str);
        var func = 'function('
        var intervals = '';

        if (specials === undefined) specials = [];

        for (var i = 1; i < params.length; i++) {
            var arg = Expression.splitTuple(params[i])[0]
            specials.push(arg)
            func += arg + ','

            intervals += ',' + this.toJSExpression(params[i]);
        }

        func = func.slice(0, func.length - 1) + ') { return ' + this.toJSExpression(params[0], specials) + '; }';

        var expr = 'new Interactive.Parametric(' + func + intervals + ')';
        return expr;
    } else if (type === 'constant') {
        var expr = 'new Interactive.Number(' + str + ')';
        return expr;
    } else if (type === 'isoline') {
        var parts = str.split('|');
        var parametric = this.toJSExpression(parts[0])
        var axis = parts[1].split('=')[0];
        var level = this.toJSExpression(parts[1].split('=')[1]);

        var expr = 'new Interactive.Isoline(' + parametric + ',"' + axis + '",' + level + ')';
        return expr;
    }
}

Expression.prototype.toJSFunction = function (string) {
    var expr = this.toJSExpression(string);
    return Function('context', 'return ' + expr + ';');
}

/**
 * Variables from given context will override variables from this context 
 */
Expression.prototype.evaluate = function () {
    return this.function(this.context);
}

Expression.getDefaultContext = function () {
    return Object.assign({ functions: {} }, MathPlus);
}

export { Expression };