/**
 * Creates several bindings and useful functions for mouse and touch interactions
 * @param {*} container 
 */
function TouchEventListener(container) {
    var _container = container;

    var _mouseInContainer = false;
    var _rightMouseDown = false;
    var _suppressContextMenu = false;

    var _screenStartX = 0;
    var _screenStartY = 0;

    _container.addEventListener('mouseenter', function() {
        _mouseInContainer = true;
    });

    _container.addEventListener('mouseleave', function() {
        _mouseInContainer = false;
    });

    _container.addEventListener('mousedown', function(event) {
        if(event.button & 2) _rightMouseDown = true;
        
        _screenStartX = event.screenX;
        _screenStartY = event.screenY;
    });

    _container.addEventListener('mouseup', function(event) {
        if(event.button & 2) _rightMouseDown = false;
    });

    _container.addEventListener('contextmenu', function(event) {
        if(_suppressContextMenu) {
            event.preventDefault();
            _suppressContextMenu = false;
        }
    });

    document.addEventListener('mousemove', function(event) {
        if(_rightMouseDown) {
            var e = new CustomEvent('pan', { 
                detail: {
                    screenStartX: _screenStartX,
                    screenX: event.screenX,
                    screenStartY: _screenStartY,
                    screenY: event.screenY,
                    suppressContextMenu: function() {
                        _suppressContextMenu = true;
                    }
                }
            });
            _container.dispatchEvent(e);
        }
    });

    _container.addEventListener('wheel', function(event) {
        var e = new CustomEvent('zoom', {
            detail: {
                amount: event.deltaY,
                suppressScrolling: function() {
                    event.preventDefault();
                }
            }
        });

        _container.dispatchEvent(e);
    });

}

export { TouchEventListener };