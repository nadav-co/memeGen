'use strict'

var gCanvas
var gCtx
var gMouseDown = false
var gTapedLineIdx
var gkeysMap
var gPrevTouch



function init() {
    gCanvas = document.querySelector('canvas')
    gCtx = gCanvas.getContext('2d')
    renderImages()
    renderMemes()
    gkeysMap = getSearchKeys()
    renderSearchBy()
    var hammerDT = new Hammer(document.body)
    hammerDT.add(new Hammer.Tap({ event: 'doubleTap', taps: 2 }))
    hammerDT.on('doubleTap', ev => ev.preventDefault())

}

function renderSearchBy() {
    var txtHTMls = ''
    var i = 0
    for (var key in gkeysMap) {
        txtHTMls += `<span onclick="onSearchByKey(this)" class="key-${i}" style="font-size:calc(1rem + ${gkeysMap[key]}px)">${key}</span>`
    }
    document.querySelector('.search-by').innerHTML = txtHTMls
}

function renderImages(key = null) {
    var imgs = getImagesToRender(key)
    if (!imgs.length) return
    var txtHTMLs = imgs.map(img => `<img onclick="editImg(${img.id})" src="${img.url}" alt="${img.keywords[1]}"></img>`)
    document.querySelector('.img-container').innerHTML = txtHTMLs.join('')
}

function renderMemes() {
    var elContainer = document.querySelector('.memes-container')
    var memes = getImgMemes()
    if (!memes || !memes.length) return
    var txtHTMLs = memes.map((meme, idx) => {
        return `<img src="${meme}" class="img-${idx}" onclick="editMeme(${idx})" >\n`
    })
    elContainer.innerHTML = txtHTMLs.join('')
}


function editImg(id) {
    document.querySelector('.header-content').classList.remove('main-layout')
    document.querySelector('.gallery').hidden = true
    document.querySelector('.memes').hidden = true
    document.querySelector('.about').hidden = true
    if (typeof(id) === 'number') createMeme(id, gCanvas.height)
    else createMemeFromImg(id, gCanvas.height)
    renderCanvas()
    document.querySelector('.editor-container').hidden = false
    document.querySelector('.bgc-container').hidden = false
}

function editMeme(idx) {
    document.querySelector('.gallery').hidden = true
    document.querySelector('.memes').hidden = true
    document.querySelector('.about').hidden = true
    var meme = getMemes()[idx]
    document.querySelector('.header-content').classList.remove('main-layout')
    renderCanvas(meme)
    document.querySelector('.editor-container').hidden = false
    document.querySelector('.bgc-container').hidden = false

}


function renderCanvas(meme = null) {
    document.querySelector('.share-meme').innerText = 'Share'
    var active = document.querySelector('.active')
    if (active) active.classList.remove('active')
    if (!meme) meme = getCurrMeme()
    else setMeme(meme)
    drawImg(meme)
}

function drawImg(meme, isMarkOff = false) {
    var id = meme.selectedImgId
    var img = new Image();
    img.src = getImgById(id).url
    img.onload = () => {
        var elContainer = document.querySelector('.canvas-container')
        gCanvas.width = (img.width < elContainer.clientWidth) ? img.width : elContainer.clientWidth * 0.95
        gCanvas.height = (img.width < elContainer.clientWidth) ? img.height : img.height * (gCanvas.width / img.width)
        meme.offsetX = gCanvas.offsetLeft
        meme.offsetY = gCanvas.offsetTop
        gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height)
        meme.lines.forEach(line => drawText(line))
        var elLineSpan = document.querySelector('.line-number')
        elLineSpan.innerText = getLineNum()
        if (meme.selectedLineIdx !== null && meme.lines.length && !isMarkOff) highliteSelectedLine()

    }
}

function drawText(line) {
    gCtx.lineWidth = '1.5'
    gCtx.strokeStyle = line.color
    gCtx.fillStyle = line.fill
    gCtx.font = `${line.size}px ${line.font}`
    gCtx.textAlign = line.align
    gCtx.fillText(line.txt, line.x, line.y)
    gCtx.strokeText(line.txt, line.x, line.y)
    line.height = line.size
    line.width = gCtx.measureText(line.txt).width
}

function onBackToGallery() {
    var isconfirmed = confirm('discard changes?')
    if (isconfirmed) {
        onGoTo('.gallery')
        document.querySelector('.to-gallery').classList.add('active')
        renderImages()
    }
}

function onChangeLine() {
    changeLine(1)
    var elLineSpan = document.querySelector('.line-number')
    var txt = getLineNum()
    elLineSpan.innerText = txt
    document.querySelector('.content-input').value = getCurrMeme().lines[gMeme.selectedLineIdx].txt
    renderCanvas()
}

function onAddLine() {
    addLine()
    renderCanvas()
}

function onEditLine(elTxt) {
    editLine(elTxt.value)
    renderCanvas()
}

function onAddEmoji(emoji) {
    addLine(emoji.innerText)
    document.querySelector('.content-input').value = getCurrMeme().lines[gMeme.selectedLineIdx].txt
    renderCanvas()
}

function onDelete() {
    deleteLine()
    document.querySelector('.content-input').value = getCurrMeme().lines[gMeme.selectedLineIdx].txt
    renderCanvas()
}

function onSetFont(elInput) {
    setFont(elInput.value)
    renderCanvas()
}

function onChangeSize(diff) {
    setSize(diff)
    renderCanvas()
}

function onChangeColor(elInput) {
    changeColor(elInput.value)
    renderCanvas()
}

function onChangeFill(elInput) {
    changeFill(elInput.value)
    renderCanvas()
}

function onChangeYPos(diff) {
    changeYPos(+diff)
    renderCanvas()
}

function onToggleMenu() {
    document.querySelector('.navbar').classList.toggle('open')
}

function onSearch(elinput) {
    renderImages(elinput.value)
}

function onCanvasClicked(ev) {
    ev.preventDefault()
    if (ev.type === 'mousedown') {
        gMouseDown = true
        var isLine = setClickedLine(ev.offsetX, ev.offsetY)
        if (!isLine) gMouseDown = false
        else document.querySelector('.content-input').value = getCurrMeme().lines[gMeme.selectedLineIdx].txt
    }
    if ((ev.type === 'touchstart')) {
        gMouseDown = true
        var x = ev.targetTouches[0].pageX - ev.target.offsetLeft
        var y = ev.targetTouches[0].pageY - ev.target.offsetTop
        gPrevTouch = { x, y }
        var isLine = setClickedLine(x, y)
        if (!isLine) gMouseDown = false
        else document.querySelector('.content-input').value = getCurrMeme().lines[gMeme.selectedLineIdx].txt
        return
    }

    if (ev.type === 'mouseup' || ev.type === 'touchend') {
        gMouseDown = false
    }

    if (gMouseDown) {
        if (ev.type === 'touchmove') {
            var x = ev.targetTouches[0].pageX - ev.target.offsetLeft
            var y = ev.targetTouches[0].pageY - ev.target.offsetTop
            changeXPos(x - gPrevTouch.x)
            changeYPos(y - gPrevTouch.y)
            gPrevTouch = { x, y }
        } else {
            changeXPos(ev.movementX)
            changeYPos(ev.movementY)
        }
        renderCanvas()
    }
}

function drawRect(x, y, width, height) {
    gCtx.beginPath()
    gCtx.strokeStyle = 'white'
    gCtx.rect(x - 5, y + 5, width + 10, -height - 5)
    gCtx.stroke()
    gCtx.fillStyle = '#00000020'
    gCtx.fillRect(x - 5, y + 5, width + 10, -height - 5)
    gCtx.align = align
}

function onSaveMeme() {
    drawImg(getCurrMeme(), true)
    saveMeme()

    renderMemes()
    document.querySelector('.header-content').classList.add('main-layout')
    document.querySelector('.editor-container').hidden = true
    document.querySelector('.bgc-container').hidden = true
    document.querySelector('.memes').hidden = false
}

function onGoTo(section, ev = null) {
    if (ev) {
        ev.preventDefault()
        var active = document.querySelector('.active')
        if (active) active.classList.remove('active')
        ev.target.parentElement.classList.add('active')
    }
    document.querySelector('.header-content').classList.add('main-layout')
    document.querySelector('.navbar').classList.remove('open')
    document.querySelector('.gallery').hidden = true
    document.querySelector('.about').hidden = true
    document.querySelector('.bgc-container').hidden = true
    document.querySelector('.memes').hidden = true
    document.querySelector('.editor-container').hidden = true
    document.querySelector(section).hidden = false
    if (section === '.memes') renderMemes()
}

function onDownload(elLink) {
    drawImg(getCurrMeme(), true)
    downloadImg(elLink)
}

function onAlign(alignment) {
    align(alignment)
    renderCanvas()
}

function onImgInput(ev) {
    loadImageFromInput(ev, editImg)
}

function loadImageFromInput(ev, onImageReady) {
    var reader = new FileReader();

    reader.onload = function(event) {
        var img = new Image();
        img.onload = onImageReady.bind(null, img)
        img.src = event.target.result;
    }
    reader.readAsDataURL(ev.target.files[0]);
}

function onSearchByKey(elSpan) {
    gkeysMap[elSpan.innerText] += 1
    renderSearchBy()
    renderImages(elSpan.innerText)
}

function uploadImg(elBtn, ev) {
    var elForm = elBtn.parentElement
    ev.preventDefault();
    document.getElementById('imgData').value = gCanvas.toDataURL('image/jpeg');

    // A function to be called if request succeeds
    function onSuccess(uploadedImgUrl) {
        uploadedImgUrl = encodeURIComponent(uploadedImgUrl)
        document.querySelector('.share-meme').innerHTML = `
        <a class="btn" href="https://www.facebook.com/sharer/sharer.php?u=${uploadedImgUrl}&t=${uploadedImgUrl}" title="Share on Facebook" target="_blank" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${uploadedImgUrl}&t=${uploadedImgUrl}'); return false;">
           facebook   
        </a>`
    }

    doUploadImg(elForm, onSuccess);
}

function doUploadImg(elForm, onSuccess) {
    var formData = new FormData(elForm);
    fetch('http://ca-upload.com/here/upload.php', {
            method: 'POST',
            body: formData
        })
        .then(function(res) {
            return res.text()
        })
        .then(onSuccess)
        .catch(function(err) {
            console.error(err)
        })
}

function onEnterInput(ev) {
    if (ev.key === 'Enter') onAddLine()
}