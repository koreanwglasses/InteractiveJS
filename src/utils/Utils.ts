export function bracketAwareSplit(s: string, delimiters: string): string[] {
    let parts = [''];
    let depth = 0;
    for(let c of s) {
        if(c == '(' || c == '[' || c == '{') {
            depth++;
        }
        if(c == ')' || c == ']' || c == '}') {
            depth--;
        }
        if(depth == 0 && delimiters.includes(c)) {
            parts.push('');
        } else {
            parts[parts.length - 1] += c;
        }
    }
    return parts;
}