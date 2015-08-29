(function() {

    var images = {
        back: { url:'images/exp-por-image-2@2x.jpg', img: null },
        front: { url:'images/exp-por-image-1@2x.jpg', img: null }
    };

    var mainCanvas = document.getElementById('maincanvas');
    var tempCanvas = null;
    var drawCanvas = null;

    var canvasWidth = 320;
    var canvasHeight = 264;

    var touchStart = false;
    var lineWidth = 15;

    var revealThreshold = 350;
    var revealAmount = 0;

    var getLocalCoords = function(element, event) {
        var offsetX = 0, offsetY = 0;
        var first;
        var pageX, pageY;

        while (element !== null) {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
            element = element.offsetParent;
        }

        if (event.changedTouches) {
            first = event.changedTouches[0];
            pageX = first.pageX;
            pageY = first.pageY;
        } 

        else {
            pageX = event.pageX;
            pageY = event.pageY;
        }

        return { 'x': pageX - offsetX, 'y': pageY - offsetY };
    }

    var recompositeCanvases = function() {
        var tempCanvasCtx = tempCanvas.getContext('2d');
        var mainCanvasCtx = mainCanvas.getContext('2d');

        tempCanvas.width = tempCanvas.width;

        tempCanvasCtx.drawImage(drawCanvas, 0, 0, canvasWidth, canvasHeight);

        tempCanvasCtx.globalCompositeOperation = 'source-out';
        tempCanvasCtx.drawImage(images.front.img, 0, 0, canvasWidth, canvasHeight);

        mainCanvasCtx.drawImage(images.back.img, 0, 0, canvasWidth, canvasHeight);

        mainCanvasCtx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);
        
        // // Step 3: stamp the background on the temp (!! source-atop mode !!)
        // tempCanvasCtx.globalCompositeOperation = 'source-atop';
        // tempCanvasCtx.drawImage(images.back.img, 0, 0, canvasWidth, canvasHeight);

        // // Step 4: stamp the foreground on the display canvas (source-over)
        // mainCanvasCtx.drawImage(images.front.img, 0, 0, canvasWidth, canvasHeight);

        // // Step 5: stamp the temp on the display canvas (source-over)
        // mainCanvasCtx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);
    }

    var scratchLine = function(canvas, x, y, newLine) {
        var ctx = canvas.getContext('2d');
        ctx.lineWidth = lineWidth;
        ctx.lineCap = ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000';

        if (newLine) {
            ctx.beginPath();
            // this +0.01 hackishly causes Linux Chrome to draw a
            // "zero"-length line (a single point), otherwise it doesn't
            // draw when the mouse is clicked but not moved:
            ctx.moveTo(x + 0.01, y);
        }

        ctx.lineTo(x, y);
        ctx.stroke();

        revealAmount += 1;
    }

    var setupCanvases = function() {
        tempCanvas = document.createElement('canvas');
        drawCanvas = document.createElement('canvas');
        
        mainCanvas.width = tempCanvas.width = drawCanvas.width = canvasWidth;
        mainCanvas.height = tempCanvas.height = drawCanvas.height = canvasHeight;

        recompositeCanvases();
    }

    var startHandler = function(event) {
        var local = getLocalCoords(mainCanvas, event);
        touchStart = true;

        scratchLine(drawCanvas, local.x, local.y, true);
        recompositeCanvases();

        event.preventDefault();
    };

    var moveHandler = function(event) {
        if (touchStart) {
            var local = getLocalCoords(mainCanvas, event);

            scratchLine(drawCanvas, local.x, local.y, false);
            recompositeCanvases();

            event.preventDefault();
        }
    };

    var endHandler = function(event) {
        touchStart = false;

        if (revealAmount > revealThreshold) {
            console.log('callback');
        }

        event.preventDefault();
    }; 

    mainCanvas.addEventListener('mousedown', startHandler, false);
    mainCanvas.addEventListener('touchstart', startHandler, false);

    window.addEventListener('mousemove', moveHandler, false);
    window.addEventListener('touchmove', moveHandler, false);

    window.addEventListener('mouseup', endHandler, false);
    window.addEventListener('touchend', endHandler, false);       

    var loadImages = function () {
        var loadCount = 0;
        var loadTotal = 2;

        var image = new Image();
        image.addEventListener('load', function () {
            loadCount += 1;

            images.back.img = image;

            if (loadCount === loadTotal) {
                setupCanvases();
            }
        });

        image.src = images.back.url;

        var image2 = new Image();
        image2.addEventListener('load', function () {
            loadCount += 1;

            images.front.img = image2;

            if (loadCount === loadTotal) {
                setupCanvases();
            }            
        });

        image2.src = images.front.url;
    }

    window.addEventListener('load', function() {
        var resetButton = document.getElementById('resetbutton');

        loadImages();

        resetButton.addEventListener('click', function() {
                // clear the draw canvas
                drawCanvas.width = drawCanvas.width;
                recompositeCanvases()

                return false;
            }, false);

    }, false);

})();