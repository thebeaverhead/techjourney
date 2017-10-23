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
   *
   * @param lang
   * @param lvl
   */
  function updateDescription(lang, item, lvl) {

    if (!lvl) {
      lvl = Math.floor(journey.zoomLevel / journey.levelRange);
    }

    let label = journey.levels[lvl].label[lang];
    let desc = journey.levels[lvl].description[lang];

    if (item) {
      label += " &gt; " + item.label;
      desc = item.description[lang];
    }

    $('#levelTitle').html(label);
    $('#levelDesc').html(desc);
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

    e.preventDefault();
    console.log(e);

    onZoom(e.deltaX * journey.speedFactor, journey.levelRange);
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
  $('#cvs').mousemove((e) =>  {
    let x = e.clientX;
    let y = e.clientY;

    const item = journey.getItemXY(x, y);
    if (item) {
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

    const item = journey.getItemXY(x, y);

    updateDescription(journey.lang, item);

    if ((item || journey.selectedItem) && item != journey.selectedItem) {

      var previousItem = journey.selectedItem;
      journey.selectedItem = item;

      var step = 1;
      if (item) {
        item.highlightLevel = item.highlightLevel ? item.highlightLevel : 0;
      }

      var highlightInterval = setInterval(
        () => {

          step++;

          if (item) {
            item.highlightLevel = Math.easeInOutQuad(step, 1, 1.5, 50);
          }

          if (previousItem) {
            previousItem.highlightLevel = 3.5 - Math.easeInOutQuad(step, 1, 1.5, 50);
          }
          journey.render();

          if (step > 50) {
            clearInterval(highlightInterval);
          }

        },
        10
      );
    }
    else {
      console.log(x, y);
      const level = journey.getLevelXY(x, y);

      if (level) {
        const currentLevelZoom = (1 + Math.floor(journey.zoomLevel / journey.levelRange)) * journey.levelRange;
        const levelZoom = (level.level + 1) * journey.levelRange;

        const deltaZoom = levelZoom - currentLevelZoom > 0 ? 1 : -1;
        onZoom(deltaZoom, deltaZoom * (levelZoom - currentLevelZoom));
      }
    }
  });



  /**
   *
   */
  $(".lang-btn").click((e) => {
    $('.lang-btn.active').removeClass('active');
    $(e.target).addClass('active');

    journey.lang = $(e.target).val();

    journey.render();
    updateDescription(journey.lang);

  });


  /**
   *
   * @param deltaZoom
   */
  function onZoom(deltaZoom, levelRange) {

    const maxLevel = (journey.levels.length * journey.levelRange - journey.levelThreshold);

    if (!journey.zooming
        && (deltaZoom < 0 && (journey.zoomLevel + deltaZoom) >= journey.minZoomLevel
        || deltaZoom > 0 && (journey.zoomLevel + deltaZoom) <= maxLevel - journey.levelThreshold)) {

      journey.zooming = true;


      var step = 0;
      const currentZoomLevel = journey.zoomLevel;

      $('.fade').addClass('in');

      journey.accelerateZoom = setInterval(
        () => {

          step++;
          let currentDelta = Math.easeInOutQuad(step, 1, levelRange, 100);

          journey.zoomLevel = currentZoomLevel + currentDelta * (deltaZoom > 0 ? 1 : -1);

          journey.render();

          if (step > 100) {

            clearInterval(journey.accelerateZoom);
            journey.zooming = false;
            journey.zoomLevel = currentZoomLevel + levelRange * (deltaZoom > 0 ? 1 : -1);

            let level = Math.floor(journey.zoomLevel/levelRange);
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


    const deltaZoom = e.originalEvent.deltaY * journey.speedFactor;

    onZoom(deltaZoom, journey.levelRange);
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


