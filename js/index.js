'use strict';

(function () {

function start(el) {
    var MAX_SCALE = 5;
    new Vue({
        el: el,
        data: {
            showField: true,
            user: null,
            canvasSize: 198,
            imgWidth: 0,
            imgHeight: 0,
            offsetX: 0,
            offsetY: 0,
            loadDone: false,
            minScale: 0.1,
            percent: 0
        },
        computed: {
            scale: {
                get: function () {
                    return this.percent / 100 * MAX_SCALE + this.minScale;
                },
                set: function (value) {
                    this.percent = (value - this.minScale) / MAX_SCALE * 100;
                }
            }
        },
        created: function () {
            this.src = 'images/demo.jpg';
        },
        methods: {
            close: function () {
                console.log('close');
            },
            fieldChanged: function (event) {
                fieldChanged(this, event);
            },
            imgLoaded: function (event) {
                imgLoaded(this, event.target);
            },
            dragImg: function (event) {
                dragImg(this, event);
            },
            dragTrackButton: function (event) {
                dragTrackButton(this, event);
            },
            zoomOut: function () {
                var STEP = 1;
                this.percent = Math.max(0, this.percent - STEP);
            },
            zoomIn: function () {
                var STEP = 1;
                this.percent = Math.min(100, this.percent + STEP);
            },
            getAvatarBase64: function (callback) {
                getAvatarBase64(this, callback);
            },
            upload: function (callback) {
                uploadBase64(this, callback);
            },
            save: function () {
                save(this);
            }
        }
    });
}

function fieldChanged(context, event) {
    var file = event.target.files[0];
    if(!file) {
        return;
    }
    uploadImage(file, function (errorCode, src) {
        context.src = src;
        context.showField = false;
        context.$nextTick(function () {
            context.showField = true;
        });
    });
}

function uploadImage(file, callback) {
    console.log('TODO uploadImage', file);
    callback(null, 'images/demo2.jpg');
}

function imgLoaded(context, img) {
    img.style = null;
    context.imgWidth = img.width;
    context.imgHeight = img.height;
    var canvasSize = context.canvasSize;
    var imgMinSize = Math.min(img.width, img.height);
    context.minScale = canvasSize / imgMinSize;
    context.scale = context.minScale;
    context.loadDone = true;
}

function dragImg(context, event) {
    if(!context.loadDone) {
        return;
    }
    var el = event.target;
    var $el = $(el);
    var oldPosition = {
        left: parseFloat($el.css('left')),
        top: parseFloat($el.css('top'))
    };
    drag(el, event, function (position) {
        var deltaX = position.left - oldPosition.left;
        var deltaY = position.top - oldPosition.top;
        context.offsetX = deltaX;
        context.offsetY = deltaY;
        $el.css({
            'margin-left': deltaX,
            'margin-top': deltaY
        });
    }, el.parentElement);
}

function dragTrackButton(context, event) {
    if(!context.loadDone) {
        return;
    }

    var el = event.target;
    var $el = $(el);

    var trackWidth = $el.parent().width();
    drag(el, event, function (position) {
        var left = Math.min(Math.max(0, position.left), trackWidth);
        var ratio =  left / trackWidth;
        context.percent = ratio * 100;
    });
}

function getAvatarBase64(context, callback) {
    var img = document.createElement('img');
    var canvas = document.createElement('canvas');
    canvas.width = context.canvasSize;
    canvas.height = context.canvasSize;
    img.onload = function() {
        var scale = context.scale;
        var leftCorner = context.imgWidth / 2 - canvas.width / 2 / scale;
        var topCorner = context.imgHeight / 2 - canvas.height / 2 / scale;
        var sx = leftCorner - context.offsetX / scale;
        var sy = topCorner - context.offsetY / scale;
        var sWidth = canvas.width / scale;
        var sHeight = canvas.height / scale;
        var ctx = canvas.getContext('2d');
            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        var url = canvas.toDataURL();
        callback(null, url);
    };
    img.onerror = function () {
        callback('404');
    };
    img.crossOrigin = 'anonymous';
    img.src = context.$refs.img.src;
}

function uploadBase64(context, callback) {
    context.getAvatarBase64(function (errorCode, base64) {
        if(errorCode) {
            return callback(errorCode);
        }
        console.log('TODO uploadBase64', base64);
        callback();
    });
}

function save(context) {
    if(!context.src) {
        return;
    }

    context.upload(function (errorCode, src) {
        if(errorCode) {
            return console.error(errorCode);
        }
        context.src = src;
        context.$emit('srcchange', src);
    });
}

window.start = start;
})();