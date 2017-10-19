/**
 * Created by piotr.pozniak@thebeaverhead.com on 19/10/2017.
 */

import Journey from './journey';

import $ from 'jquery';
import Hammer from 'hammerjs';

console.log('hello tech journey');


$(document).ready(function() {

  var journey = new Journey({
    canvas: document.getElementById('cvs'),
    levelRange: $('#levelRange').val() * 1,
    levelThreshold: $('#levelThreshold').val() * 1,
    zoomFactor: $('#zoomFactor').val() * 1,
    imgResizeFactor: $('#imgResizeFactor').val() * 1,
    speedFactor: $('#speedFactor').val() * 1,
    zoomLevel: 500,
    minZoomLevel: 500
  });

  // TODO show "data loading" indicator here
  $.getJSON(
    'data.json',
    null,
    (data) => {
      journey.levels = data;

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


  hammer.on('pinch', (e) => {
    console.log(e);
  });


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

    if (deltaZoom < 0 && (journey.zoomLevel + deltaZoom) >= journey.minZoomLevel
      || deltaZoom > 0 && (journey.zoomLevel + deltaZoom) <= maxLevel - journey.levelThreshold) {

      journey.zoomLevel += deltaZoom;

      journey.render();

      if (fadeTimeout) {
        clearTimeout(fadeTimeout);
      }

      $('.welcome').addClass('faded');
      $('.info-block').addClass('faded');
      $('.footer').addClass('faded');

      fadeTimeout = setTimeout(
        () => {
          $('.welcome').removeClass('faded');
          $('.info-block').removeClass('faded');
          $('.footer').removeClass('faded');
        },
        1000
      );

    }
  }

/**
 *
 */
function onWindowResize() {

    journey.canvas.width = window.innerWidth;
    journey.canvas.height = window.innerHeight;

    journey.ctx = app.canvas.getContext('2d');
    journey.render();
  };



  window.addEventListener('resize', onWindowResize, false);

});


