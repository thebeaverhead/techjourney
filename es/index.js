/**
 * Created by piotr.pozniak@thebeaverhead.com on 19/10/2017.
 */

import Journey from './journey';
import UI from './ui';
//import FirebaseConfig from './firebase-config';
//import firebase from 'firebase';

import $ from 'jquery';
import Hammer from 'hammerjs';
import Isemail from 'isemail';

console.log('hello tech journey');

var app = {};


/**
 * @author Robert Penner, http://gizma.com/easing
 * @param t
 * @param b
 * @param c
 * @param d
 * @returns {*}
 */
Math.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
  if (t < 1) return c/2*t*t + b;
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
};


/**
 *
 */
$(document).ready(function() {


  if ('serviceWorker' in navigator) {
    registerServiceWorker();
  }

  function registerServiceWorker() {

    navigator.serviceWorker.getRegistration('/').then(function (registrationCheckObject) {
      console.log(registrationCheckObject);

      if (!registrationCheckObject) {
        navigator.serviceWorker.register('/service-worker.js', {scope: "/"}).then(function (registrationInstallObject) {
          navigator.serviceWorker.ready.then(
            (serviceWorkerRegistration) => {
              window.location.reload(true);
            }
          );
        }, function (err) {
          console.info('ServiceWorker registration failed: ', err);
        });

      } else {
        registrationCheckObject.addEventListener('updatefound', () => {
          navigator.serviceWorker.register('/service-worker.js', {scope: "/"}).then(function (registrationInstallObject) {

            document.querySelector('#sw-update-toast').className += " show";

            document.querySelector('#update-sw').addEventListener('click', () => {
              navigator.serviceWorker.controller.postMessage("new-version");

              window.location.reload(true);
            });

          });

        }, function (err) {
          console.info('ServiceWorker registration failed: ', err);
        });
      }

    });

    navigator.serviceWorker.onmessage = function (evt) {

      let message = JSON.parse(evt.data);

      if (message && message.type === "reload") {
        window.location.reload(true);
      }
    }

  }

  app.ui = new UI({
    onDescriptionChange: updateDescription
  });

  //firebase.initializeApp(FirebaseConfig);

  const canvas = document.getElementById('cvs');

  const levelRange = canvas.width > canvas.height ? 600 : 500;
  const zoomLevel = canvas.width > canvas.height ? 500 : 400;
  const levelThreshold = canvas.width > canvas.height ? 50 : 50;
  const zoomFactor = canvas.width > canvas.height ? 0.45 : 0.23;
  const imgResizeFactor = canvas.width > canvas.height ? 0.001 : 0.0009;

  let lang = navigator.language;


  var langSelected = false;

  $('.lang-btn').each((i, e) =>{

    if ($(e).val() == lang) {
      $(e).addClass('active');
      langSelected = true;
    }
  });

  if (!langSelected) {
    lang = 'en-UK';
    $(".lang-btn[value='en-UK']").addClass('active');
  }


  app.ui.journey = new Journey({
    canvas: canvas,
    levelRange: levelRange,//$('#levelRange').val() * 1,
    levelThreshold: levelThreshold, //$('#levelThreshold').val() * 1,
    zoomFactor: zoomFactor, //$('#zoomFactor').val() * 1,
    imgResizeFactor: imgResizeFactor, //$('#imgResizeFactor').val() * 1,
    speedFactor: $('#speedFactor').val() * 1,
    zoomLevel: zoomLevel,
    minZoomLevel: zoomLevel,
    lang: lang
  });


  // TODO show "data loading" indicator here
  $.getJSON(
    'data.json',
    null,
    (data) => {
      app.ui.journey.levels = data.levels;

      app.ui.i18n = data.i18n;

      app.ui.updateDescription();

      // TODO show loading graphics indicator here

      var imgsToLoad = 0;

      data.levels.map(item => imgsToLoad += item.elements.length);

      var loadedImgs = 0;

      data.levels.map((level) => {


        level.elements.map((item) => {

          item.img = new Image();

          item.img.onload = function() {

            //console.log(item.imgPath + ' loaded');
            loadedImgs++;

            if (imgsToLoad == loadedImgs) {

              onWindowResize();

              $('#cvs').on('wheel', onWheel);


            }
          };

          item.img.src = item.imgPath;
        });
      });


    }
  );


  if (!window.location.href.match("debug")) {
    $('.debug').hide();
  }


  window.addEventListener('resize', onWindowResize, false);


  let hammer = new Hammer(canvas);

  hammer.get('tap').set({enable: false});
  hammer.get('doubletap').set({enable: false});
  hammer.get('press').set({enable: false});
  hammer.get('pan').set({enable: false});
  //hammer.get('swipe').set({enable: false});
  hammer.get('pinch').set({enable: true});
  hammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

  /**
   *
   */
  hammer.on('pinch', (e) => {

    e.preventDefault();
    const sumDelta = e.deltaX+e.deltaY;
    if (Math.abs(sumDelta) > 10) {
      app.ui.scroll(-1 * e.deltaY);
    }
  });


  /**
   *
   */
  hammer.on('swipe', (e) => {

    e.preventDefault();

    app.ui.scroll(-1 * e.deltaY);
  });



  /**
   *
   * @param e
   */
  function onWheel(e) {
    e.preventDefault();

    app.ui.scroll(e.originalEvent.deltaY);

  }


  /**
   *
   */
  $("#start").click(() => {
    $('#welcome').hide();
  });


  /**
   *
   */
  $('#info').click(() => {
    if ($('.info-container').hasClass('show')) {
      $('.info-container').removeClass('show');
      $('#info .material-icons').html('info_outline');
      $('html').css('overflow', 'hidden');
    }
    else {
      $('.info-container').addClass('show');
      $('#info .material-icons').html('close');
      $('body').css('overflow', 'visible');
      $('html').css('overflow', 'visible');
    }

  });

  $('#share').click(() => {
    if ($('.share-container').hasClass('show')) {
      $('.share-container').removeClass('show');
    }
    else {
      $('.share-container').addClass('show');
    }
  });


  /**
   *
   */
  $('#cvs').mousemove((e) =>  {
    let x = e.clientX;
    let y = e.clientY;


    if (app.ui.isObjectHover(x, y)) {
      $('#cvs').css('cursor', 'pointer');
    }
    else {
      $('#cvs').css('cursor', 'default');
    }

  });


  /**
   *
   */
  $('#cvs').click((e) =>  {

    let x = e.clientX;
    let y = e.clientY;

    app.ui.onCanvasClick(x, y);

  });



  /**
   *
   */
  $(".lang-btn").click((e) => {


    $('.lang-btn.active').removeClass('active');
    $(e.target).addClass('active');

    app.ui.onLangChange($(e.target).val());

  });


  /**
   *
   */
  $('#levelRange').change(() => {
    app.ui.updateAttr('levelRange', $('#levelRange').val() * 1);
  });


  /**
   *
   */
  $('#levelThreshold').change(() => {
    app.ui.updateAttr('levelThreshold', $('#levelThreshold').val() * 1);
  });


  /**
   *
   */
  $('#zoomFactor').change(() => {
    app.ui.updateAttr('zoomFactor', $('#zoomFactor').val() * 1);
  });


  /***
   *
   */
  $('#imgResizeFactor').change(() => {
    app.ui.updateAttr('imgResizeFactor', $('#imgResizeFactor').val() * 1);
  });


  /**
   *
   */
  $('#speedFactor').change(() => {
    app.ui.updateAttr('speedFactor', $('#speedFactor').val() * 1);
  });


  /**
   *
   */
  $('#showFrame').click(() => {
    app.ui.updateAttr('showFrame', $('#showFrame').prop('checked'));
  });


  /**
   *
   */
  $('#showItemPts').click(() => {
    app.ui.updateAttr('showFrame', $('#showItemPts').prop('checked'));
  });


  $('#submit').click((e) => {
    e.preventDefault();

    const email = $('#email').val();
    $('#email').removeClass('error');
    $('#submit-error').hide();


    if (!Isemail.validate(email)) {
      $('#email').addClass('error');
      $('#submit-error').show();
    }
    else {

      $('#submit').prop('disabled', true);

      //const database = firebase.database();

      database.goOnline();
      database.ref("/newsletter/"+database.ref("/newsletter").push().key)
        .set(
          {email: email},
          (error) => {

            if (error) {
              $('#submit-error').show();
              $('#submit').prop('disabled', false);
            }
            else {
              $('#submit-success').show();
              $('#submit').css('visibility', 'hidden');

            }
            database.goOffline();
          }
        );
    }

  });


  /**
   *
   * @param translation
   */
  function updateDescription(translation) {

    $('.fade').addClass('in');
    setTimeout(
      () => {

        $('#levelTitle').html(translation.levelTitle);
        $('#levelDesc').html(translation.levelDesc);

        $('#welcomeScreen-title').html(translation.welcomeScreen.title);
        $('#welcomeScreen-subtitle').html(translation.welcomeScreen.subtitle);

        $('#info-title').html(translation.info.title);
        $('#info-description').html(translation.info.description);
        $('#email').attr('placeholder', translation.info.email);
        $('#submit').html(translation.info.submit);


        $('.fade').removeClass('in');
      },
      500
    );
  }


  /**
   *
   */
  function onWindowResize() {

    $('#cvs').css('width', window.innerWidth);
    $('#cvs').css('height', window.innerHeight);
    app.ui.updateCanvasSize(window.innerWidth, window.innerHeight);

  };




});


