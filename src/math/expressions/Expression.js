import { Vector } from '../Vector.js';
import { Interval } from '../Interval.js';
import { MathPlus } from '../MathPlus.js';

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
    if(string.charAt(string.length - 1) === '}') {
        if(string.charAt(0) === '{')
            return 'interval'
        else    
            return 'parametric'
    }
    if(string.includes('(') === false && string.includes(')') === false && !/[0-9]+/.test(string)) {
        return 'variable'
    }
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
        if(type === 'interval') {
            if(str.charAt(i) === '}') {
                parts.push({str: str.substring(start, i + 1), type: type})
                start = i + 1;
                type = null;
            }
        } else if(str.charAt(i) === '{') {
            type = 'interval'
        } else if(str.charAt(i) === '(') {
            nestingLevel++

            if(type === null) {
                type = 'expression';
            }
            if(type === 'operator' || type === 'uoperator') {
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
            if(str.charAt(i) === '-' && (type === null || type === 'operator')) {
                if(type === 'operator') {
                    parts.push({str: str.substring(start, i), type: type})
                    start = i;
                }
                type = 'uoperator';
            } else if(/[0-9a-zA-Z.]/.test(str.charAt(i)) === false || str.charAt(i) === '^') {
                parts.push({str: str.substring(start, i), type: type})
                start = i;
                type = 'operator';
            } else {
                if(type === null) {
                    type = 'constant'
                }
                if(type === 'operator' || type === 'uoperator') {
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
        if(parts[i].type === 'operator' || parts[i].type === 'uoperator') {
            while(ops.length > 0 && (ops[ops.length - 1].type === 'uoperator' || precedence[ops[ops.length - 1].str] >= precedence[parts[i].str])) {
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

Expression.splitTuple = function(string) {
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

Expression.splitParametric = function(string) {
    return string.split(/(?={)/);
}

Expression.toJSExpression = function(string, specials, isparam) {
    var str = string.replace(/\s+/g,'')

    // Expression is an equation:
    if(str.match(/=/g) !== null && str.match(/=/g).length === 1) {
        var left, right;
        left = string.split('=')[0];
        right = string.split('=')[1];
        
        var leftParts = Expression.separate(left);

        // variable assignment
        if(leftParts.length === 1 && leftParts[0].type === 'variable') {
            var expr = 'context["'+ left + '"]='+Expression.toJSExpression(right);
            return expr;
        }

        // function definition
        if(leftParts[0].type === 'function') {
            if(leftParts[2].type === 'vector') {
                var expr = 'context["'+leftParts[0].str+'"]=function' + leftParts[2].str + '{ return '+Expression.toJSExpression(right, Expression.splitTuple(leftParts[2].str))+'; }';
            } else {
                var expr = 'context["'+leftParts[0].str+'"]=function(' + leftParts[2].str + '){ return '+Expression.toJSExpression(right, leftParts[2].str)+'; }';
            }
            return expr;
        }
    } else {
        var type = Expression.typeOf(str);

        if(type === 'expression') {
            var operations = Expression.toPostfix(Expression.separate(str));

            var stack = [];

            for(var i = 0; i < operations.length; i++) {
                switch(operations[i].type) {
                    case 'variable':
                        if(specials !== undefined && specials.includes(operations[i].str)) {
                            stack.push(operations[i].str);
                        } else {
                            stack.push('context["'+operations[i].str+'"]')
                        }
                        break;
                    case 'constant':
                        stack.push('new Interactive.Number('+operations[i].str+')')
                        break;     
                    case 'vector':
                        var param = operations[i+1].type === 'function';
                        stack.push(Expression.toJSExpression(operations[i].str, specials, param));
                        break;                       
                    case 'function':
                        var a = stack.pop()
                        stack.push('context["'+operations[i].str+'"]('+a+')');
                        break;
                    case 'uoperator':
                        var a = stack.pop()
                        stack.push(a+'.neg()');
                        break;
                    case 'operator':
                        var b = stack.pop();
                        var a = stack.pop();
                        switch(operations[i].str) {
                            case '+':
                                stack.push(a+'.add('+b+')')
                                break;
                            case '-':
                                stack.push(a+'.sub('+b+')')
                                break;
                            case '*':
                                stack.push(a+'.mul('+b+')')
                                break;
                            case '/':
                                stack.push(a+'.div('+b+')')
                                break;
                            case '^':
                                stack.push(a+'.exp('+b+')')
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
            if(isparam) {
                var expr = ''
                for(var i = 0; i < components.length; i++) {
                    expr += Expression.toJSExpression(components[i], specials) + ',';
                }
                expr = expr.slice(0, expr.length - 1)
                return expr;
            } else {
                var expr = 'new Interactive.Vector('
                for(var i = 0; i < components.length; i++) {
                    expr += Expression.toJSExpression(components[i], specials) + ',';
                }
                expr = expr.slice(0, expr.length - 1) + ')'
                return expr;
            }
        } else if (type === 'interval') {
            var params = Expression.splitTuple(str);

            var expr = 'new Interactive.Interval("'+params[0]+'",';
            for(var i = 1; i < params.length; i++) {
                expr += Expression.toJSExpression(params[i], specials) + ',';
            }
            expr = expr.slice(0, expr.length - 1) + ')'            
            return expr;
        } else if (type === 'variable') {
            if(specials !== undefined && specials.includes(str)) return str
            var expr = 'context["'+str+'"]'
            return expr;
        }
    }
}

Expression.toJSFunction = function(string) {
    var expr = Expression.toJSExpression(string);
    return Function('context', 'return '+expr+';');
}

/**
 * Variables from given context will override variables from this context 
 */
Expression.prototype.evaluate = function(context) {
    if(this.validated === false) {
        this.function = Expression.toJSFunction(this.string);
        this.validated = true;
    }
    if(context !== undefined) {
        var temp = Object.assign({}, this.context);
        Object.assign(temp, context);
        return this.function(temp);
    } else {
        return this.function(this.context);
    }
}

Expression.getDefaultContext = function() {
    return Object.assign({}, MathPlus);
}

export { Expression };