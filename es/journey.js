/**
 * Created by piotr.pozniak@thebeaverhead.com on 19/10/2017.
 */


export default class Journey {

  /**
   *
   * @param props
   */
  constructor(props) {

    this.canvas = props.canvas;
    this.levelRange = props.levelRange;
    this.levelThreshold = props.levelThreshold;
    this.zoomFactor = props.zoomFactor;
    this.imgResizeFactor = props.imgResizeFactor;
    this.speedFactor = props.speedFactor;
    this.showFrame = props.showFrame;
    this.showItemPts = props.showItemPts;
    this.zoomLevel = props.zoomLevel;
    this.minZoomLevel = props.minZoomLevel;
    this.lang = props.lang;

    this.ctx = this.canvas.getContext('2d');
  }


  /**
   *
   * @param ctx
   * @returns {boolean}
   */
  renderWireframe() {

    if (!this.showFrame) {
      return false;
    }

    let i;
    const ctx = this.ctx;

    for (i = 0; i <= this.canvas.width; i += 100) {

      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.canvas.height);

      ctx.moveTo(0, i);
      ctx.lineTo(this.canvas.width, i);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.closePath();

    }

  }


  /**
   *
   * @param data
   */
  grasyscaleImage(image) {

    var d = image.data;
    for (var i=0; i<d.length; i+=4) {
      var r = d[i];
      var g = d[i+1];
      var b = d[i+2];
      // CIE luminance for the RGB
      // The human eye is bad at seeing red and blue, so we de-emphasize them.
      var v = 0.2126*r + 0.7152*g + 0.0722*b;
      d[i] = d[i+1] = d[i+2] = v
    }

    return image;
  }


  /**
   *
   */
  renderItem(item, zoomLevel) {


    const canvas = this.canvas;
    const ctx = this.ctx;

    let n = zoomLevel * this.zoomFactor;
    let imgResizeFactor = this.imgResizeFactor * (item.highlightLevel ? item.highlightLevel : 1);

    let a = item.y / item.x;
    let ppx = item.x + n;
    let ppy = a * ppx;// * p + 300;

    let img = item.img;

    let cvsCenterX = canvas.width / 2;
    let cvsCenterY = canvas.height / 2;

    if (item.x < 0) {
      ppx = item.x - n;
      ppy = a * ppx;// * p + 300;
    }

    let dppy = canvas.height - ppy;

    //console.log(ppx, dppy, n, Math.abs(ppx));
    ctx.save();
    ctx.translate(cvsCenterX, -cvsCenterY);


    let newImageWidth = ~~(img.width * zoomLevel * imgResizeFactor);
    let newImageHeight = ~~(img.height * zoomLevel * imgResizeFactor);
    let resizeFactorDeltaX = (newImageWidth - (~~(img.width * zoomLevel * this.imgResizeFactor))) / 2;
    let resizeFactorDeltaY = (newImageHeight - (~~(img.height * zoomLevel * this.imgResizeFactor))) / 2;


    let newImagePosX = ppx;// - newImageWidth / 2;
    let newImagePosY = dppy;// - newImageHeight / 2

    if (item.x >= 0 && item.y >= 0) {
      // I
      newImagePosY = dppy - newImageHeight;

      newImagePosX -= resizeFactorDeltaX;
      newImagePosY += resizeFactorDeltaY;
    }
    else if (item.x < 0 && item.y >= 0) {
      // II
      newImagePosX = ppx - newImageWidth;
      newImagePosY = dppy - newImageHeight;

      //
      newImagePosX += resizeFactorDeltaX;
      newImagePosY += resizeFactorDeltaY;
    }
    else if (item.x >= 0 && item.y < 0) {
      // III

      newImagePosX -= resizeFactorDeltaX;
      newImagePosY -= resizeFactorDeltaY;
    }
    else if (item.x < 0 && item.y < 0) {
      // IV
      newImagePosX = ppx - newImageWidth;

      newImagePosX += resizeFactorDeltaX;
      newImagePosY -= resizeFactorDeltaY * 2;
    }



    if (item.highlightLevel) {


      console.log(resizeFactorDeltaX);


    }

    ctx.drawImage(
      img,
      0, // Optional. The x coordinate where to start clipping
      0, // Optional. The y coordinate where to start clipping
      img.width, // Optional. The width of the clipped image
      img.height, // Optional. The height of the clipped image
      ~~(newImagePosX), // The x coordinate where to place the image on the canvas
      ~~(newImagePosY), // The y coordinate where to place the image on the canvas
      ~~(newImageWidth), // Optional. The width of the image to use (stretch or reduce the image)
      ~~(newImageHeight), // Optional. The height of the image to use (stretch or reduce the image)
    );

    if (this.showItemPts) {
      ctx.beginPath();
      ctx.rect(ppx, dppy, 10, 10);
      ctx.fill();
      ctx.closePath();
    }


    ctx.restore();

    item.screenX = newImagePosX + cvsCenterX;
    item.screenY = newImagePosY - cvsCenterY;

    item.screenW = ~~(newImageWidth);
    item.screenH = ~~(newImageHeight);

    /*let circle = new Path2D();
    //circle.moveTo(40, 100);
    circle.rect(item.screenX, item.screenY, item.screenW, item.screenH);
    ctx.fillColor = '#bca';
    ctx.stroke(circle);*/


  }


  /**
   *
   */
  renderScale() {

    const canvas = this.canvas;
    const ctx = this.ctx;

    let scaleTop = 40;
    let scaleBottom = canvas.height - 40;
    let scalePosX = canvas.width > canvas.height ? 40 : 20;
    let sliderRadius = 8;


    let itemsCount = this.levels.length;
    let scaleHeight = scaleBottom - scaleTop;

    let scaleMax = itemsCount * this.levelRange;
    let scaleStep = Math.round((scaleHeight) / (itemsCount + 1));

    // render scale
    // vertical
    for (let i = 0; i < itemsCount-1; i++) {
      ctx.beginPath();
      ctx.moveTo(scalePosX, (scaleTop + (scaleStep * i)) + 8);
      ctx.lineTo(scalePosX, (scaleTop + (scaleStep * i)) + scaleStep - 8);
      ctx.lineWidth = 0.3;
      ctx.stroke();
      ctx.closePath();
    }

    // horizontal

    for (let i = 0; i < itemsCount; i++) {

      let circle = new Path2D();
      //circle.moveTo(40, 100);
      circle.arc(
        scalePosX,
        (i * scaleStep) + scaleTop,
        8,
        0,
        2 * Math.PI
      );
      ctx.beginPath();
      ctx.fillColor = '#fff';
      ctx.stroke(circle);

      /*ctx.beginPath();
      ctx.moveTo(scalePosX - 8, ((i * scaleStep) + scaleTop));
      ctx.lineTo(scalePosX + 8, ((i * scaleStep) + scaleTop));
      ctx.lineWidth = 0.3;
      ctx.stroke();*/
      ctx.closePath();

    }


    // ------------------
    let currentLevel = Math.floor(this.zoomLevel / this.levelRange);

    /*let pointerPosFactor = ((this.zoomLevel - (this.zoomLevel * 0.066) - this.minZoomLevel)
      / scaleMax * scaleHeight)
      + (scaleTop) + scaleStep;
*/

    let pointerPosFactor = scaleTop;// + (scaleStep * currentLevel);
    const levelLength = (this.zoomLevel + this.levelRange) - this.zoomLevel;
    pointerPosFactor += Math.floor(((this.zoomLevel - this.minZoomLevel % this.levelRange) * scaleStep) / levelLength);

    //console.log(app.zoomLevel, currentLevel, scaleMax, scaleHeight, scaleStep, pointerPosFactor);

    // slider
    ctx.beginPath();
    // Add colors
    let grd = ctx.createRadialGradient(scalePosX, pointerPosFactor, 0.000, scalePosX, pointerPosFactor, 8.000);

    // Add colors
    grd.addColorStop(0.274, 'rgba(255, 255, 255, 1.000)');
    grd.addColorStop(1.000, 'rgba(148, 30, 31, 0.500)');

    ctx.fillStyle = grd;
    ctx.arc(scalePosX, pointerPosFactor, 9, 0, 2 * Math.PI);

    //circle.arc(scalePosX, pointerPosFactor, 8, 0, 2 * Math.PI);
    //ctx.fillColor = '#fff';
    //ctx.stroke(circle);
    ctx.fill();
    ctx.closePath();


return;
    // labels

    let currentLevelRounded = Math.round(this.zoomLevel / this.levelRange);
    let currentLevelRaw = this.zoomLevel / this.levelRange;

    currentLevel = Math.round(this.zoomLevel / this.levelRange) - 1;

    if (currentLevel >= itemsCount) {
      currentLevel = itemsCount-1;
    }

    ctx.font = "18px Helvetica";
    ctx.textBaseline = "middle";
    ctx.fillStyle="rgba(0, 0, 0, 1)";

    ctx.fillText(
      this.levels[currentLevel].label[this.lang],
      scalePosX + 15,
      (1 + currentLevel) * scaleStep + scaleTop
    );

    // draw level preceding
    if (currentLevel >= 1) {
      let alpha = 1- ((this.zoomLevel / this.levelRange) - currentLevel - 0.5);


      ctx.font = "18px Helvetica";
      ctx.textBaseline = "middle";
      ctx.fillStyle="rgba(0, 0, 0, " + alpha +")";

      ctx.fillText(
        this.levels[currentLevel-1].label[this.lang],
        scalePosX + 15,
        (1 + currentLevel-1) * scaleStep + scaleTop
      );
    }

    // draw level succeeding
    if (currentLevel < itemsCount-1) {
      let alpha =  ((this.zoomLevel / this.levelRange) - currentLevel - 0.5);

      ctx.font = "18px Helvetica";
      ctx.textBaseline = "middle";
      ctx.fillStyle="rgba(0, 0, 0, " + alpha +")";
      ctx.fillText(
        this.levels[currentLevel+1].label[this.lang],
        scalePosX + 15,
        (1 + currentLevel+1) * scaleStep + scaleTop
      );
    }

  }



  /**
   *
   */
  render() {

    const canvas = this.canvas;
    const ctx = this.ctx;

    const levelRange = this.levelRange;
    const levelThreshold = this.levelThreshold;

    const currentLevel = Math.floor(this.zoomLevel / levelRange);
    const currentLevelZoom = this.zoomLevel % levelRange;
/*
    console.log(
      'levelRange', levelRange,
      'levelThreshold', levelThreshold,
      'currentLevel', currentLevel,
      'currentLevelZoom', currentLevelZoom
    );*/

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /**
     *
     */



    // Add colors
    let grd = ctx.createRadialGradient(
      this.canvas.width/2,
      this.canvas.height/2,
      0.000,
      this.canvas.width/2,
      this.canvas.height/2,
      this.canvas.height/2,
    );

    //grd.addColorStop(0.435, 'rgba(255, 255, 255, 1.000)');
    //grd.addColorStop(1.000, 'rgba(242, 239, 239, 1.000)');

    grd.addColorStop(0.435, 'rgba(255, 255, 255, 1.000)');
    grd.addColorStop(1.000, 'rgba(242, 239, 239, 1.000)');

    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderWireframe();

    this.renderScale();


    // walk through all layers
    for (let i = 0; i < this.levels.length; i++) {

      const level = this.levels[i];
      const objts = level.elements;

      const maxLvlVisibility = ((i + 1) * levelRange) + levelThreshold;
      const minLvlVisibility = ((i + 1) * levelRange) - levelRange;

      // check if layer is visible
      if (maxLvlVisibility < app.zoomLevel || (i - currentLevel) < 0) {
        continue;
      }


      let zoom = (this.zoomLevel % levelRange);// + levelThreshold;
      let baseFactor = ((maxLvlVisibility - this.zoomLevel)) * 0.017 * (i ? i : 1);
      let factor = 1;

      let levelZoom = this.zoomLevel / baseFactor;

      if (levelZoom < this.levels.length) {
        continue;
      }

      /*
          console.log(
            //'max level visibility', maxLvlVisibility,
            'min level visibility', minLvlVisibility,
            'levelZoom', levelZoom,
            'baseFactor', baseFactor,
            'zoom', zoom,
          );
      */

      // if layer is visible render items
      for (let j = 0; j < objts.length; j++) {
        this.renderItem(objts[j], levelZoom);
      }

    }

  }


  /**
   *
   * @param x
   * @param y
   * @returns {*}
   */
  getItemXY(x, y) {
    const currentLevel = Math.floor(this.zoomLevel / this.levelRange);
    const levelObjects = this.levels[currentLevel].elements;

    for (let i = 0; i < levelObjects.length; i++) {
      const obj = levelObjects[i];

      if (
        x >= obj.screenX  && (obj.screenX + obj.screenW) > x
        && obj.screenY <= y && (obj.screenY + obj.screenH) > y
      ) {
        return obj;
      }
    }

    return null;
  }
}
