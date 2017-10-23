/**
 * Created by piotr.pozniak@thebeaverhead.com on 19/10/2017.
 */

import Journey from './journey';

import $ from 'jquery';
import Hammer from 'hammerjs';

console.log('hello tech journey');


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


  /**
   * Service worker initialization
   */

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('./service-worker')
    .then(function() { console.log('Service Worker Registered'); });
  }

  /**
   *
   * @param lang
   * @param lvl
   */
  function updateDescription(lang, lvl) {

    if (!lvl) {
      lvl = Math.floor(journey.zoomLevel/journey.levelRange);
    }

    $('#levelTitle').html(journey.levels[lvl].label[lang]);
    $('#levelDesc').html(journey.levels[lvl].description[lang]);
  }



  var journey = new Journey({
    canvas: document.getElementById('cvs'),
    levelRange: $('#levelRange').val() * 1,
    levelThreshold: $('#levelThreshold').val() * 1,
    zoomFactor: $('#zoomFactor').val() * 1,
    imgResizeFactor: $('#imgResizeFactor').val() * 1,
    speedFactor: $('#speedFactor').val() * 1,
    zoomLevel: 500,
    minZoomLevel: 500,
    lang: navigator.language
  });

  console.log(journey);

  var langSelected = false;

  $('.lang-btn').each((i, e) =>{

    console.log(e);
    if ($(e).val() == journey.lang) {
      $(e).addClass('active');
      langSelected = true;
    }
  });

  if (!langSelected) {
    journey.lang = 'en-UK';
    $(".lang-btn[value='" + journey.lang + "']").addClass('active');
  }

  // TODO show "data loading" indicator here
  $.getJSON(
    'data.json',
    null,
    (data) => {
      journey.levels = data;

      updateDescription(journey.lang);

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

              journey.canvas.width = window.innerWidth;
              journey.canvas.height = window.innerHeight;

              journey.render();
              $('#cvs').on('wheel', onWheel);


            }
          };

          item.img.src = item.imgPath;
        });
      });


    }
  );




  let hammer = new Hammer(journey.canvas);

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
    console.log(e);
  });

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
    $('#welcome').show();
  });

  /**
   *
   */
  $(".lang-btn").click((e) => {
    $('.lang-btn.active').removeClass('active');
    $(e.target).addClass('active');

    journey.lang = $(e.target).val();

    updateDescription(journey.lang);
    journey.render();
  });


  /**
   *
   */
  $('#levelRange').change(() => {
    journey.levelRange = $('#levelRange').val() * 1;
    journey.render();
  });


  $('#levelThreshold').change(() => {
    journey.levelThreshold = $('#levelThreshold').val() * 1;
    journey.render();
  });


  $('#zoomFactor').change(() => {
    journey.zoomFactor = $('#zoomFactor').val() * 1;
    journey.render();
  });


  $('#imgResizeFactor').change(() => {
    journey.imgResizeFactor = $('#imgResizeFactor').val() * 1;
    journey.render();
  });

  $('#speedFactor').change(() => {
    journey.speedFactor = $('#speedFactor').val() * 1;
    journey.render();
  });


  $('#showFrame').click(() => {
    journey.showFrame = !journey.showFrame;
    journey.render();
  });

  $('#showItemPts').click(() => {
    journey.showItemPts = journey.showFrame;
    journey.render();
  });


  if (!window.location.href.match("debug")) {
    $('.debug').hide();
  }

  var fadeTimeout = null;


  /**
   *
   * @param e
   */
  function onWheel(e) {
    e.preventDefault();

    const maxLevel = (journey.levels.length * journey.levelRange - journey.levelThreshold);
    const deltaZoom = e.originalEvent.deltaY * journey.speedFactor;

    if (!journey.zooming && (deltaZoom < 0 && (journey.zoomLevel + deltaZoom) >= journey.minZoomLevel
      || deltaZoom > 0 && (journey.zoomLevel + deltaZoom) <= maxLevel - journey.levelThreshold)) {

      journey.zooming = true;


      var step = 0;
      const currentZoomLevel = journey.zoomLevel;

      $('.fade').addClass('in');

      journey.accelerateZoom = setInterval(
        () => {

          step++;
          let currentDelta = Math.easeInOutQuad(step, 1, journey.levelRange, 100);

          journey.zoomLevel = currentZoomLevel + currentDelta * (deltaZoom > 0 ? 1 : -1);

          journey.render();

          if (step > 100) {

            clearInterval(journey.accelerateZoom);
            journey.zooming = false;
            journey.zoomLevel = currentZoomLevel + journey.levelRange * (deltaZoom > 0 ? 1 : -1);

            let level = Math.floor(journey.zoomLevel/journey.levelRange);
            $('.fade').removeClass('in');

            updateDescription(journey.lang);
          }

        },
        10
      );

    }
  }

/**
 *
 */
function onWindowResize() {

    journey.canvas.width = window.innerWidth;
    journey.canvas.height = window.innerHeight;

    journey.ctx = journey.canvas.getContext('2d');
    journey.render();
  };



  window.addEventListener('resize', onWindowResize, false);

});


