'use strict'

const KEY = 'savedMemes'
const IMGKEY = 'savedImgs'
var gKeywords = { 'happy': 12, 'funny puk': 1 }
var gImgs = [
    { id: 1, url: 'meme-imgs/1.jpg', keywords: ['ALL', 'funny', 'laugh', 'man'] },
    { id: 2, url: 'meme-imgs/2.jpg', keywords: ['ALL', 'happy', 'animals', 'dogs'] },
    { id: 3, url: 'meme-imgs/3.jpg', keywords: ['ALL', 'happy', 'baby', 'dogs'] },
    { id: 4, url: 'meme-imgs/4.jpg', keywords: ['ALL', 'cat', 'sleepy'] },
    { id: 5, url: 'meme-imgs/5.jpg', keywords: ['ALL', 'baby'] },
    { id: 6, url: 'meme-imgs/6.jpg', keywords: ['ALL', 'happy', 'man'] },
    { id: 7, url: 'meme-imgs/7.jpg', keywords: ['ALL', 'happy', 'baby'] },
    { id: 8, url: 'meme-imgs/8.jpg', keywords: ['ALL', 'happy'] },
    { id: 9, url: 'meme-imgs/9.jpg', keywords: ['ALL', 'happy'] },
    { id: 10, url: 'meme-imgs/10.jpg', keywords: ['ALL', 'happy'] },
    { id: 11, url: 'meme-imgs/11.jpg', keywords: ['ALL', 'happy'] },
    { id: 12, url: 'meme-imgs/12.jpg', keywords: ['ALL', 'happy'] },
    { id: 13, url: 'meme-imgs/13.jpg', keywords: ['ALL', 'happy'] },
    { id: 14, url: 'meme-imgs/14.jpg', keywords: ['ALL', 'happy'] },
    { id: 15, url: 'meme-imgs/15.jpg', keywords: ['ALL', 'happy'] },
    { id: 16, url: 'meme-imgs/16.jpg', keywords: ['ALL', 'happy'] },
    { id: 17, url: 'meme-imgs/17.jpg', keywords: ['ALL', 'happy'] },
    { id: 18, url: 'meme-imgs/18.jpg', keywords: ['ALL', 'sad'] }
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

function getSearchKeys() {
    var keys = gImgs.map(img => img.keywords.map((key) => key))
    var newKeys = []
    keys.forEach(keyArr => newKeys.push(...keyArr))

    var filtKeys = [...new Set(newKeys)]
    var keysMap = {}
    filtKeys.forEach(key => keysMap[key] = getRandomInt(1, 30))
    keysMap.ALL = 40
    return keysMap
}

function getImagesToRender(key) {
    if (key === null) return gImgs
    var imgs = gImgs.filter(img => img.keywords.some(keyword => keyword.includes(key)))
    return imgs
}

function getImgById(id) {
    return gImgs.find(img => img.id === id)
}

function createMeme(id, height) {
    gMeme = {
        selectedImgId: id,
        selectedLineIdx: 0,
        lines: [
            { txt: 'line 1', size: 30, align: 'left', isAligned: true, font: 'Impact', color: 'black', fill: 'white', x: 30, y: 30 },
            { txt: 'line 2', size: 30, align: 'left', isAligned: true, font: 'Impact', color: 'black', fill: 'white', x: 30, y: height - 50 }
        ]
    }
    document.querySelector('.content-input').value = gMeme.lines[gMeme.selectedLineIdx].txt

}

function createMemeFromImg(img) {
    var url = img.currentSrc
    gImgs.push({ id: gImgs.length + 1, url, keywords: [] })
    createMeme(gImgs.length)
    console.log(gImgs)
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

function addLine(txt = 'edit line') {
    gMeme.lines.push({ txt, size: 30, align: 'left', isAligned: true, font: 'Impact', color: 'black', fill: 'white', x: 30, y: 40 * gMeme.lines.length - 1 })
    gMeme.selectedLineIdx = gMeme.lines.length - 1
}

function editLine(txt) {
    gMeme.lines[gMeme.selectedLineIdx].txt = txt
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
    if (gMeme.lines.length) {
        gMeme.lines[gMeme.selectedLineIdx].isAligned = false
        gMeme.lines[gMeme.selectedLineIdx].align = 'left'
        gMeme.lines[gMeme.selectedLineIdx].x += diff
    }
}

function setClickedLine(x, y) {
    const line = gMeme.lines.find(line => {
        switch (line.align) {
            case 'left':
                return x >= line.x && x <= line.x + line.width && y >= line.y - line.height && y < line.y
            case 'center':
                return x >= line.x - line.width / 2 && x <= line.x + line.width / 2 && y >= line.y - line.height && y < line.y
            case 'right':
                return x >= line.x - line.width && x <= line.x && y >= line.y - line.height && y < line.y
        }
        return x >= line.x && x <= line.x + line.width && y >= line.y - line.height && y < line.y
    })
    if (line === undefined) return false
    var idx = gMeme.lines.indexOf(line)
    gMeme.selectedLineIdx = idx
    return true
}

function highliteSelectedLine() {
    var line = gMeme.lines[gMeme.selectedLineIdx]
    if (!line.isAligned) {
        drawRect(line.x, line.y, line.width, line.height)
        return
    }
    switch (line.align) {
        case 'left':
            drawRect(line.x, line.y, line.width, line.height)
            break
        case 'center':
            drawRect((gCanvas.width / 2 - line.width / 2), line.y, line.width, line.height)
            break
        case 'right':
            drawRect(gCanvas.width - 20 - line.width, line.y, line.width, line.height)
            break
    }
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

function align(alignTo) {
    var line = gMeme.lines[gMeme.selectedLineIdx]
    line.isAligned = true
    line.align = alignTo
    line.x = (alignTo === 'left') ? 20 : (alignTo === 'right') ? gCanvas.width - 20 : gCanvas.width / 2
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}