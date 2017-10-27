/**
 * Created by piotr.pozniak@thebeaverhead.com on 19/10/2017.
 */

import Journey from './journey';
import UI from './ui';

import $ from 'jquery';
import Hammer from 'hammerjs';

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


  app.ui = new UI({
    onDescriptionChange: updateDescription
  });

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
      app.ui.journey.levels = data;

      app.ui.updateDescription();

      // TODO show loading graphics indicator here

      var imgsToLoad = 0;

      data.map(item => imgsToLoad += item.elements.length);

      var loadedImgs = 0;

      data.map((level) => {


        level.elements.map((item) => {

          item.img = new Image();

          item.img.onload = function() {

            console.log(item.imgPath + ' loaded');
            loadedImgs++;

            if (imgsToLoad == loadedImgs) {

              app.ui.updateCanvasSize(window.innerWidth, window.innerHeight);

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
  hammer.get('swipe').set({enable: false});
  hammer.get('pinch').set({enable: true});


  /**
   *
   */
  hammer.on('pinch', (e) => {

    e.preventDefault();
    console.log(e);
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
    $('.info-container').addClass('show');
    $('#info .material-icons').html('close');

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
        $('.fade').removeClass('in');
      },
      500
    );
  }


  /**
   *
   */
  function onWindowResize() {

    app.ui.updateCanvasSize(innerWidth, innerHeight);

  };


});


