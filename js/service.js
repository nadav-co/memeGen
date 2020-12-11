'use strict'

const KEY = 'savedMemes'
const IMGKEY = 'savedImgs'
var gKeywords = { 'happy': 12, 'funny puk': 1 }
var gImgs = [
    { id: 1, url: 'meme-imgs/1.jpg', keywords: ['happy'] },
    { id: 2, url: 'meme-imgs/2.jpg', keywords: ['happy'] },
    { id: 3, url: 'meme-imgs/3.jpg', keywords: ['happy'] },
    { id: 4, url: 'meme-imgs/4.jpg', keywords: ['happy'] },
    { id: 5, url: 'meme-imgs/5.jpg', keywords: ['happy'] },
    { id: 6, url: 'meme-imgs/6.jpg', keywords: ['happy'] },
    { id: 7, url: 'meme-imgs/7.jpg', keywords: ['happy'] },
    { id: 8, url: 'meme-imgs/8.jpg', keywords: ['happy'] },
    { id: 9, url: 'meme-imgs/9.jpg', keywords: ['happy'] },
    { id: 10, url: 'meme-imgs/10.jpg', keywords: ['happy'] },
    { id: 11, url: 'meme-imgs/11.jpg', keywords: ['happy'] },
    { id: 12, url: 'meme-imgs/12.jpg', keywords: ['happy'] },
    { id: 13, url: 'meme-imgs/13.jpg', keywords: ['happy'] },
    { id: 14, url: 'meme-imgs/14.jpg', keywords: ['happy'] },
    { id: 15, url: 'meme-imgs/15.jpg', keywords: ['happy'] },
    { id: 16, url: 'meme-imgs/16.jpg', keywords: ['happy'] },
    { id: 17, url: 'meme-imgs/17.jpg', keywords: ['happy'] },
    { id: 18, url: 'meme-imgs/18.jpg', keywords: ['sad'] }
];
var gMeme = {
    selectedImgId: 5,
    selectedLineIdx: 0,
    lines: [{
        txt: 'I never eat Falafel',
        size: 20,
        align: 'left',
        color: 'red'
    }]
}

function getImagesToRender(key) {
    if (key === null) return gImgs
    var imgs = gImgs.filter(img => img.keywords.some(keyword => keyword.includes(key)))
    return imgs
}

function getImgById(id) {
    return gImgs.find(img => img.id === id)
}

function createMeme(id) {
    gMeme = {
        selectedImgId: id,
        selectedLineIdx: 0,
        lines: []
    }
}

function getCurrMeme() {
    return gMeme
}

function setCurrMeme(meme) {
    gMeme = meme
}

function changeLine(diff) {
    var idx = gMeme.selectedLineIdx
    var len = gMeme.lines.length
    gMeme.selectedLineIdx = (idx === len) ? idx - 1 : (idx > len || idx === 0 && diff < 0 || idx + 1 === len) ? 0 : idx + diff
}

function getLineNum() {
    return (gMeme.lines.length) ? `${gMeme.selectedLineIdx+1}/${gMeme.lines.length}` : '0/0'
}

function addLine(txt, color, fill) {
    gMeme.lines.push({ txt, size: 30, align: 'left', font: 'Impact', color, fill, x: 30, y: 30 })
    gMeme.selectedLineIdx = gMeme.lines.length - 1
}

function deleteLine() {
    if (!gMeme.lines.length) return
    gMeme.lines.splice(gMeme.selectedLineIdx, 1)
    changeLine(-1)
}

function setFont(font) {
    if (!gMeme.lines.length) return
    gMeme.lines[gMeme.selectedLineIdx].font = font
}

function setSize(diff) {
    if (!gMeme.lines.length) return
    gMeme.lines[gMeme.selectedLineIdx].size += diff
}

function changeColor(color) {
    if (!gMeme.lines.length) return
    gMeme.lines[gMeme.selectedLineIdx].color = color
}

function changeFill(color) {
    if (!gMeme.lines.length) return
    gMeme.lines[gMeme.selectedLineIdx].fill = color
}

function changeYPos(diff) {
    if (gMeme.lines.length) gMeme.lines[gMeme.selectedLineIdx].y += diff
}

function changeXPos(diff) {
    if (gMeme.lines.length) gMeme.lines[gMeme.selectedLineIdx].x += diff
}

function setClickedLine(x, y, touch = false) {
    if (touch) {
        x -= gMeme.offsetX
        y -= gMeme.offsetY
    }
    var line = gMeme.lines.find(line => {
        return x >= line.x && x <= line.x + line.width &&
            y >= line.y - line.height && y < line.y
    })
    if (line === undefined) return false
    var idx = gMeme.lines.indexOf(line)
    gMeme.selectedLineIdx = idx
    return true
}

function highliteSelectedLine() {
    var line = gMeme.lines[gMeme.selectedLineIdx]
    drawRect(line.x, line.y, line.width, line.height)
}

function saveMeme() {
    var imgMemes = getFromStorage(IMGKEY)
    var meme = gCanvas.toDataURL('image/jpeg');
    if (!imgMemes) setToStorage(IMGKEY, [meme])
    else pushToStorage(IMGKEY, meme)

    var memes = getFromStorage(KEY)
    if (!memes) setToStorage(KEY, [gMeme])
    else pushToStorage(KEY, gMeme)
}

function downloadImg(elLink) {
    var imgContent = gCanvas.toDataURL('image/jpeg');
    elLink.href = imgContent
}

function getImgMemes() {
    return getFromStorage(IMGKEY)
}

function getMemes() {
    return getFromStorage(KEY)
}

function setMeme(meme) {
    gMeme = meme
}