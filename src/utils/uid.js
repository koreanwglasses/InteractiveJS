var uid = {};
uid.counter = 0;
uid.getUid = function() {
    return uid.counter++;
}

export { uid };