'use strict'

var gCanvas
var gCtx
var gMouseDown = false
var gTapedLineIdx
var gkeysMap



function init() {
    gCanvas = document.querySelector('canvas')
    gCtx = gCanvas.getContext('2d')
    renderImages()
    renderMemes()
    gkeysMap = getSearchKeys()
    renderSearchBy()
    var hammCanv = new Hammer(gCanvas)
    hammCanv.on('pan', onTextPan)
    hammCanv.get('pan').set({ direction: Hammer.DIRECTION_ALL })
    hammCanv.add(new Hammer.Press({ event: 'press', time: 50 }))
    hammCanv.on('press', onTextPress)
    hammCanv.on('pinch', onCanvasPinch)
    hammCanv.get('pinch').set({ enable: true });
    var hammBody = new Hammer(document.body)
    hammBody.add(new Hammer.Tap({ event: 'dubleTap', taps: 2 }))
    hammBody.on("dubleTap", ev => ev.preventDefault())

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
    var txtHTMLs = imgs.map(img => `<img onclick="editImg(${img.id})" src="${img.url}" alt="${img.keywords[0]}"></img>`)
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

// function renderMeme(meme, idx) {
//     var elContainer = document.querySelector('.memes-container')
//     elContainer.innerHTML += `<canvas class="canvas-${idx}" onclick="editMeme(${idx})" height="150px" width="150px"></canvas>`
//     let canvas = document.querySelector(`.canvas-${idx}`)
//     let ctx = canvas.getContext('2d')
//     var id = meme.selectedImgId
//     var img = new Image();
//     img.src = getImgById(id).url
//     img.onload = () => {
//         canvas.width = 150
//         gCanvas.height = 150
//         meme.offsetX = canvas.offsetLeft
//         meme.offsetY = canvas.offsetTop
//         ctx.drawImage(img, 0, 0, 150, 150)
//         meme.lines.forEach(line => drawText(line))
//     }
// }

function editImg(id) {
    document.querySelector('.gallery').hidden = true
    document.querySelector('.memes').hidden = true
    document.querySelector('.about').hidden = true
    if (typeof(id) === 'number') createMeme(id)
    else createMemeFromImg(id)
    renderCanvas()
    document.querySelector('.editor-container').hidden = false
    document.querySelector('.bgc-container').hidden = false
}

function editMeme(idx) {
    document.querySelector('.gallery').hidden = true
    document.querySelector('.memes').hidden = true
    document.querySelector('.about').hidden = true
    var meme = getMemes()[idx]
    renderCanvas(meme)
    document.querySelector('.editor-container').hidden = false
    document.querySelector('.bgc-container').hidden = false

}


function renderCanvas(meme = null) {
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
    if (isconfirmed) onGoTo('.gallery')
}

function onChangeLine() {
    changeLine(1)
    var elLineSpan = document.querySelector('.line-number')
    var txt = getLineNum()
    elLineSpan.innerText = txt
}

function onAddLine(txt = null) {
    if (!txt) txt = document.querySelector('.content-input').value
    var color = document.getElementById('lineColor').value
    var fill = document.getElementById('fillColor').value
    addLine(txt, color, fill)
    renderCanvas()
}

function onDelete() {
    deleteLine()
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
    return
    //     if (ev.type === 'mousedown') {
    //         gMouseDown = true
    //         var isLine = setClickedLine(ev.offsetX, ev.offsetY)
    //         if (!isLine) gMouseDown = false

    //     }
    //     if (ev.type === 'mouseup') {
    //         gMouseDown = false
    //     }
    //     if (gMouseDown) {
    //         changeXPos(ev.movementX)
    //         changeYPos(ev.movementY)
    //         renderCanvas()
    //     }
}

function onTextPan(ev) {
    ev.preventDefault()
    if (getCurrMeme().lines.length && gTapedLineIdx) {
        changeXPos(ev.changedPointers[0].movementX)
        changeYPos(ev.changedPointers[0].movementY)
        renderCanvas()
    }

}

function onTextPress(ev) {
    ev.preventDefault()
    var { x, y } = ev.center
    gTapedLineIdx = setClickedLine(x, y, true)
    renderCanvas()
}

function onCanvasPinch(ev) {
    var diffX = ev.changedPointers[0].movementX + ev.changedPointers[1].movementX
    var diffY = ev.changedPointers[0].movementY + ev.changedPointers[1].movementY
    var diff = (diffX + diffY) / 2
    console.log('pinched', diff)
    onChangeSize(diff)

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
    document.querySelector('.editor-container').hidden = true
    document.querySelector('.bgc-container').hidden = true
    document.querySelector('.memes').hidden = false
}

function onGoTo(section, ev = null) {
    if (ev) ev.preventDefault()
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
    document.getElementById('imgData').value = gCanvas.toDataURL("image/jpeg");

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