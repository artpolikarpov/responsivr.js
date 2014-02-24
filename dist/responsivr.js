/*! https://artpolikarpov.github.io/responsivr.js/
* © 2014 Artem Polikarpov, MIT license */
(function (win, undefined) {
  function noop () {
    // Oblivion...
  }

  var console = win.console || {log: noop},
      Responsivr = {},
      doc = win.document,
      body,
      responsivrIsVisible,
      labelHTML,
      labelIsFunction,
      style = doc.createElement('style'),
      RESPONSIVR_HIDE_DELAY, RESPONSIVR_HIDE_DURATION, RESPONSIVR_LABELS, RESPONSIVR_RANDOM;

  Responsivr.overlay = doc.createElement('div');
  Responsivr.label = doc.createElement('div');
  Responsivr.overlay.className = 'responsivr';
  Responsivr.label.className = 'responsivr__label';
  Responsivr.overlay.appendChild(Responsivr.label);

  function waitFor (test, fn, timeout) {
    if (test()) {
      fn.call(this);
    } else {
      if (timeout < 0) {
        waitFor(test, fn, timeout);
      } else {
        setTimeout(function () {
          waitFor(test, fn, timeout);
        }, timeout || 10);
      }
    }
  }

  function setStyle (css) {
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.innerHTML = css;
    }
  }

  function takeOneLabel () {
    var index;

    waitFor(function () {
      if (RESPONSIVR_RANDOM) {
        index = Math.round(Math.random() * (RESPONSIVR_LABELS.length - 1));
      } else {
        index = Responsivr.labelIndex + 1;
        if (index >= RESPONSIVR_LABELS.length) {
          index = 0;
        }
      }

      return index !== Responsivr.labelIndex || RESPONSIVR_LABELS.length === 1;
    }, function () {
      labelHTML = RESPONSIVR_LABELS[index];

      Responsivr.labelIndex = index;
    }, -1);
  }

  function onResize () {
    console.log('Ah, resize!');

    clearTimeout(onResize.t);
    onResize.t = setTimeout(Responsivr.hide, RESPONSIVR_HIDE_DELAY);

    Responsivr.show();

    if (labelIsFunction) {
      Responsivr.label.innerHTML = labelHTML();
    }
  }

  var initialize = function () {
    console.log('Make responsive!');

    RESPONSIVR_HIDE_DELAY = isNaN(win.RESPONSIVR_HIDE_DELAY) ? 500 : win.RESPONSIVR_HIDE_DELAY;
    RESPONSIVR_HIDE_DURATION = isNaN(win.RESPONSIVR_HIDE_DURATION) ? 250 : win.RESPONSIVR_HIDE_DURATION;
    RESPONSIVR_LABELS = Object.prototype.toString.call(win.RESPONSIVR_LABELS) === '[object Array]' ? win.RESPONSIVR_LABELS : ['This is responsive!'];
    RESPONSIVR_RANDOM = typeof win.RESPONSIVR_RANDOM !== 'undefined' ? win.RESPONSIVR_RANDOM : true;

    Responsivr.labelIndex = -1;

    var transition = 'opacity ' + RESPONSIVR_HIDE_DURATION + 'ms linear;';
    setStyle(
        '.responsivr {' +
            'position: fixed;' +
            'z-index: 2147483647;' +
            'top: 0;' +
            'right: 0;' +
            'bottom: 0;' +
            'left: 0;' +
            'width: 100%;' +
            'height: 100%;' +
            'color: #000;' +
            'background-color: #fff;' +
            'text-align: center;' +
            'opacity: 0;' +
            'display: none;' +
            '-webkit-transition: ' + transition +
            'transition: ' + transition +
        '}' +
        '.responsivr--visible {' +
            'opacity: 1;' +
            '-webkit-transition: none;' +
            'transition: none;' +
        '}' +
        '.responsivr:before {' +
            'content: "";' +
            'display: inline-block;' +
            'width: 1px;' +
            'height: 100%;' +
            'vertical-align: middle;' +
            'margin-right: -1px;' +
        '}' +
        '.responsivr__label {' +
            'display: inline-block;' +
            'vertical-align: middle;' +
            'font-size: 24px;' +
            'line-height: 1.5;' +
            'padding: .4em 1.2em;' +
            'margin: 0 auto;' +
        '}');
    body.appendChild(style);

    body.appendChild(Responsivr.overlay);

    if (win.addEventListener) {
      win.addEventListener('resize', onResize, false);
    }
  };

  var show = function () {
    if (responsivrIsVisible) {
      return;
    }
    responsivrIsVisible = true;

    Responsivr.overlay.style.display = 'block';

    setTimeout(function () {
      Responsivr.overlay.className = 'responsivr responsivr--visible';
    }, 0);

    takeOneLabel();
    if (!(labelIsFunction = typeof labelHTML === 'function')) {
      Responsivr.label.innerHTML = labelHTML;
    }
    return true;
  };
  
  Responsivr.show = function () {
    if (!show()) {
      return Responsivr;
    }
    if (labelIsFunction) {
      Responsivr.label.innerHTML = labelHTML();
    }

    (win.RESPONSIVR_ON_SHOW || noop)();
    return Responsivr;
  };

  Responsivr.hide = function () {
    if (!responsivrIsVisible || Responsivr.isHiding) {
      return Responsivr;
    }

    Responsivr.isHiding = true;

    Responsivr.overlay.className = 'responsivr';
    setTimeout(function () {
      responsivrIsVisible = false;
      Responsivr.isHiding = false;
      
      Responsivr.overlay.style.display = 'none';
    }, RESPONSIVR_HIDE_DURATION);

    (win.RESPONSIVR_ON_HIDE || noop)();
    return Responsivr;
  };

  Responsivr.destroy = function () {
    if (!Responsivr.isWatching || !body) {
      return Responsivr;
    }

    console.log('Bye-bye, brave :-*');

    Responsivr.isWatching = false;

    body.removeChild(style);
    body.removeChild(Responsivr.overlay);

    if (win.removeEventListener) {
      win.removeEventListener('resize', onResize, false);
    }

    return Responsivr;
  };

  Responsivr.initialize = function () {
    if (Responsivr.isWatching) {
      return Responsivr;
    }
    Responsivr.isWatching = true;

    waitFor(function () {
      return (body = doc.getElementsByTagName('body')[0]) || console.log('Wait for body...') && false;
    }, function () {
      initialize.call(this);
    });

    return Responsivr;
  };

  if (!win.RESPONSIVR_MANUAL_START) {
    Responsivr.initialize();
  }

  win.Responsivr = Responsivr;

})(window);