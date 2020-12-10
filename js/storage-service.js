'use strict'

function getFromStorage(key) {
    var json = localStorage.getItem(key)
    var value = JSON.parse(json)
    return value;
}

function setToStorage(key, value) {
    var json = JSON.stringify(value);
    localStorage.setItem(key, json)
}

function pushToStorage(key, value) {
    var arr = getFromStorage(key)
    arr.push(value)
    setToStorage(key, arr)

}

function removeFromStorage(key) {
    localStorage.removeItem(key)
}