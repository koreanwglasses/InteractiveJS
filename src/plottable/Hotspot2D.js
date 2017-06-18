function Hotspot2D(position) {
    this.type = 'Hotspot2D'

    if (position.type !== 'Vector') {
        console.log('Interactive.Hotspot2D: position is not a vector.');
        return null;
    }

    if (position.dimensions !== 2) {
        console.log('Interactive.Hotspot2D: Vector dimension mismatch. 2D vector required.')
        return null;
    }

    this.position = position;
    this.size = 5;
    // this.onmouseenter = function() { return false; }
    // this.onmouseleave = function() { return false; }
    // this.onmousedown = function() { return false; }
    // this.onmouseup = function() { return false; }
    this.ondrag = function() { return false; }
}

export{ Hotspot2D };