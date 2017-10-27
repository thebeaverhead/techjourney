/**
 * Created by piotr.pozniak@thebeaverhead.com on 27/10/2017.
 */


export default class UI {

  /**
   *
   */
  constructor(props) {
    this.lastScrollTime = 0;
    this.journey = null;

    this.onDescriptionChange = props.onDescriptionChange;
  }


  /**
   *
   * @param lang
   * @param lvl
   */
  updateDescription(item, lvl) {

    const journey = this.journey;
    const lang = this.journey.lang;

    if (lvl === null || lvl === undefined) {
      lvl = journey.getCurrentLevel();
    }

    console.log(lvl, lang);
    let label = journey.levels[lvl].label[lang];
    let desc = journey.levels[lvl].description[lang];

    if (item) {
      label += " &gt; " + item.label;
      desc = item.description[lang];
    }

    this.onDescriptionChange({
      levelTitle: label,
      levelDesc: desc,
    });

  }


  /**
   *
   * @param width
   * @param height
   */
  updateCanvasSize(width, height) {
    this.journey.canvas.width = width;
    this.journey.canvas.height = height;

    this.journey.ctx = this.journey.canvas.getContext('2d');

    this.journey.render();
  }




  /**
   *
   */
  isObjectHover(x, y) {

    if (this.journey.getItemXY(x, y)) {
      return true;
    }
    else if (this.journey.getLevelXY(x, y)) {
      return true;
    }

    return false;
  }


  /**
   *
   * @param x
   * @param y
   */
  onCanvasClick(x, y) {

    const item = this.journey.getItemXY(x, y);

    if ((item || this.journey.selectedItem) && item != this.journey.selectedItem) {


      this.updateDescription(item);
      var previousItem = this.journey.selectedItem;
      this.journey.selectedItem = item;


      this.handleHighlighting(item, previousItem);
    }
    else {
      const level = this.journey.getLevelXY(x, y);

      if (level) {
        const currentLevelZoom = (this.journey.getCurrentLevel()) * this.journey.levelRange;
        const levelZoom = (level.level) * this.journey.levelRange;

        this.zoom(levelZoom - currentLevelZoom);
      }
      else {
       this.updateDescription();
      }
    }

  }


  /**
   *
   * @param lang
   */
  onLangChange(lang) {
    this.journey.lang = lang;

    this.journey.render();

    this.updateDescription(this.journey.selectedItem);
  }


  /**
   *
   * @param item
   * @param previousItem
   * @param step
   */
  animateHighlighting(item, previousItem, step) {

    if (item) {
      item.highlightLevel = Math.easeInOutQuad(step, 1, 1.2, 50);
    }

    if (previousItem) {
      previousItem.highlightLevel = 3.2 - Math.easeInOutQuad(step, 1, 1.2, 50);
    }

  }



  /**
   *
   * @param item
   * @param previousItem
   */
  handleHighlighting(item, previousItem) {


    var step = 1;
    if (item) {
      item.highlightLevel = item.highlightLevel ? item.highlightLevel : 0;
    }

    this.zooming = true;
    var highlightInterval = setInterval(
      () => {

        this.animateHighlighting(item, previousItem, step++);
        this.journey.render();

        if (step > 50) {
          clearInterval(highlightInterval);

          if (previousItem){
            previousItem.highlightLevel = 0;
            if (this.journey.selectedItem == previousItem) {
              this.journey.selectedItem = null;
            }
          }
          this.journey.zooming = false;
        }

      },
      10
    );
  }




  /**
   *
   * @param deltaZoom
   */
  zoom(levelRange) {

    const journey = this.journey;
    const maxLevel = (journey.levels.length * journey.levelRange - journey.levelThreshold);
    const currentZoomLevel = journey.zoomLevel;

    if (!journey.animating
      && ((currentZoomLevel + levelRange) >= journey.minZoomLevel
        || (currentZoomLevel + levelRange) <= (maxLevel - journey.levelThreshold))) {

      this.animating = true;

      var step = 0;


      const newLevel = Math.floor((journey.zoomLevel + levelRange) / journey.levelRange);

      console.log(levelRange, newLevel);

      this.updateDescription(null, newLevel);

      var accelerateZoom = setInterval(
        () => {

          step++;
          let currentDelta = Math.easeInOutQuad(step, 1, levelRange, 100);

          journey.zoomLevel = currentZoomLevel + currentDelta;// * (levelRange > 0 ? 1 : -1);

          journey.render();

          if (step > 100) {

            clearInterval(accelerateZoom);

            journey.zoomLevel = currentZoomLevel + levelRange;

            setTimeout(
              () => {
                this.animating = false
              },
              400
            );

          }

        },
        10
      );

    }
  }


  /**
   *
   * @param attr
   * @param val
   */
  updateAttr(attr, val) {
    this.journey[attr] = val;
    this.journey.render();
  }


  /**
   *
   * @param deltaZoom
   */
  scroll(deltaZoom) {

    const time = (new Date()).getTime();

    if (time - this.lastScrollTime < 800) {
      return;
    }

    this.lastScrollTime = time;
    if (this.journey.selectedItem) {

      this.handleHighlighting(null, this.journey.selectedItem);
    }

    if (!this.animating) {
      this.zoom((deltaZoom >= 0 ? 1 : -1) * this.journey.levelRange);
    }
  }
}