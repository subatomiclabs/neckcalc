function loadScript(url, callback=undefined)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

loadScript( "node_modules/file-saver/FileSaver.min.js" );

function readTextFile(file, func)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                func( allText );
            }
        }
    }
    rawFile.send(null);
}

function Lines() {
   this.d = []; // array of lines of 2D points
   this.startDXF = "";
   this.endDXF = "";
   this.exporterOffset = [0,0];

   this.setExporterOffset = function( o ) {
      this.exporterOffset = o;
   };

   this.clear = function() {
      this.d = [];
      readTextFile( "dxf-start.dxf", (data) => this.startDXF = data );
      readTextFile( "dxf-end.dxf", (data) => this.endDXF = data );
   };

   this.addLineFromFlatPoints = function( pts ) {
      let line = [];
      for (let x = 0; x < pts.length; x += 2) {
         //console.log( "add point:" + x + " " + pts[x+0] + " " + pts[x+1] + "\n" );
         line.push([pts[x+0], pts[x+1]]);
      }
      this.d.push( line );
   };

   function dxfLwPolyLineBuilder( scale, offset, which_obj, numverts, verts ) {
      var str = "0\nLWPOLYLINE\n5\n" + (100 + which_obj) + "\n100\nAcDbEntity\n8\nLayer_1\n62\n7\n100\nAcDbPolyline\n90\n" + numverts + "\n70\n1\n";
      for (var v of verts) {
         str += "10\n" +  (offset[0] + v[0] * scale) + "\n";
         str += "20\n" + -(offset[1] + v[1] * scale) + "\n";
         str += "30\n" + 0.0 * scale + "\n";
      }
      return str;
   };

   this.toDXF = function()
   {
      let dxf = [];
      dxf.push( this.startDXF );
      var scale = 1.0;
      var which_obj = 0;

      /*
      // TEST data
      {
         var line = [];
         line.push( [985.699440, 1706.060244] );
         line.push( [327.476336, 1532.265396] );
         line.push( [308.774912, 1021.888948] );
         line.push( [1056.015920, 1065.104660] );
         line.push( [985.699440, 1706.060244] );
         dxf.push( this.dxfLwPolyLineBuilder( 1, which_obj, line.length, line ) );
         ++which_obj;
      }
      {
         var line = [];
         line.push( [10+985.699440, 10+1706.060244] );
         line.push( [10+327.476336, 10+1532.265396] );
         line.push( [10+308.774912, 10+1021.888948] );
         line.push( [10+1056.015920, 10+1065.104660] );
         line.push( [10+985.699440, 10+1706.060244] );
         dxf.push( this.dxfLwPolyLineBuilder( 1, which_obj, line.length, line ) );
         ++which_obj;
      }
      */

      for (var i = 0; i < this.d.length; ++i) {
         var line = this.d[i];
         dxf.push( dxfLwPolyLineBuilder( scale, this.exporterOffset,
                                         which_obj, line.length, line ) );
         ++which_obj;
      }
      dxf.push( this.endDXF );
      return dxf;
   };

   function svgLineBuilder( scale, offset, which_obj, numverts, verts ) {
      var str = '    <path vector-effect="non-scaling-stroke" d="M ';
      for (var v of verts) {
         str += (offset[0] + v[0] * scale) + ',';
         str += (offset[1] + v[1] * scale) + ' ';
      }
      str += 'Z" />\n';
      return str;
   };

   this.toSVG = function()
   {
      let svg = [];
      let which_obj = 0;
      let scale = 100;
      svg.push( '<svg height="100" width="100" viewBox="0 0 100 100">\n' +
                '  <g id="svgGroup" stroke="#000" stroke-width="0.25mm" stroke-linecap="round" fill="none" fill-rule="evenodd" font-size="9pt">\n' );
      for (var i = 0; i < this.d.length; ++i) {
         var line = this.d[i];
         svg.push( svgLineBuilder( scale, this.exporterOffset,
                                   which_obj, line.length, line ) );
         ++which_obj;
      }
      svg.push( '  </g>\n</svg>\n' );
      return svg;
   }

   function svgLineBuilderAlt( scale, offset, which_obj, numverts, verts ) {
      var str = '    <path vector-effect="non-scaling-stroke" d="M ';
      var output_verts = [];
      for (var v of verts) {
         output_verts.push( (offset[0] + v[0] * scale) + ' ' +
                            (offset[1] + v[1] * scale) );
      }
      // add the first one again...
      if (0 < verts.length) output_verts.push( verts[0][0] * scale + ' ' + verts[0][1] * scale );
      str += output_verts.join( " L " );
      str += ' Z" />\n';
      return str;
   };

   this.toSVGalt = function()
   {
      let svg = [];
      let which_obj = 0;
      let scale = 100;
      svg.push( '<svg height="100" width="100" viewBox="0 0 100 100">\n' +
                '  <g id="svgGroup" stroke="#000" stroke-width="0.25mm" stroke-linecap="round" fill="none" fill-rule="evenodd" font-size="9pt">\n' );
      for (var i = 0; i < this.d.length; ++i) {
         var line = this.d[i];
         svg.push( svgLineBuilderAlt( scale, this.exporterOffset,
                                      which_obj, line.length, line ) );
         ++which_obj;
      }
      svg.push( '  </g>\n</svg>\n' );
      return svg;
   }
};

function saveText(text, filename, mimetype="application/dxf;charset=utf-8")
{
   var blob = new Blob(text, {type: mimetype});
   saveAs(blob, filename);
}

function showText(text, mimetype="text/plain")
{
   //window.location.href = "data:" + mimetype + ";charset=utf-8," + encodeURIComponent( text.join('') );
   window.location.href = "data:" + mimetype + ";base64," + btoa( text.join('') );
}



function convertCanvasToImage(canvas,type="png")//, callback)
{
   var img;
   if (type=="png")
     img = Canvas2Image.saveAsPNG(canvas, true);
   else if (type=="bmp")
     img = Canvas2Image.saveAsBMP(canvas, true);
   else if (type=="jpg" || type=="jpeg")
     img = Canvas2Image.saveAsJPEG(canvas, true);
   else
     img = Canvas2Image.saveAsPNG(canvas, true);
   img.id = "canvasimage";
   img.style.border = canvas.style.border;
   img.name = "download."+type;
   //document.body.replaceChild(img, canvas); // replace the canvas inline
   window.location.href = img.src; // load new page with the image.

   //var img = new Image();
   //img.onload = function(){
   //   //callback(img);
   //   //document.write('<img src="'+img.src+'"/>');
   //   //canvas.parentNode.removeChild(canvas);
   //   window.location.href = img.src;
   //}
   img.src = canvas.toDataURL("image/png");
}

// prompt to save image as file
function saveCanvasToImage(canvas)//, callback)
{
   Canvas2Image.saveAsPNG( canvas );
   return;

   //// seems to not work on IE...
   //var img = new Image();
   //img.onload = function(){
   //   //callback(img);
   //   window.location.href = img.src;
   //}
   ////Convert image to 'octet-stream' (Just a download, really)
   //img.src = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
}

/*
 * Canvas2Image v0.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 */

var Canvas2Image = (function() {

   // check if we have canvas support
   var bHasCanvas = false;
   var oCanvas = document.createElement("canvas");
   if (oCanvas.getContext("2d")) {
      bHasCanvas = true;
   }

   // no canvas, bail out.
   if (!bHasCanvas) {
      return {
         saveAsBMP : function(){},
         saveAsPNG : function(){},
         saveAsJPEG : function(){}
      }
   }

   var bHasImageData = !!(oCanvas.getContext("2d").getImageData);
   var bHasDataURL = !!(oCanvas.toDataURL);
   var bHasBase64 = !!(window.btoa);

   var strDownloadMime = "image/octet-stream";

   // ok, we're good
   var readCanvasData = function(oCanvas) {
      var iWidth = parseInt(oCanvas.width);
      var iHeight = parseInt(oCanvas.height);
      return oCanvas.getContext("2d").getImageData(0,0,iWidth,iHeight);
   }

   // base64 encodes either a string or an array of charcodes
   var encodeData = function(data) {
      var strData = "";
      if (typeof data == "string") {
         strData = data;
      } else {
         var aData = data;
         for (var i=0;i<aData.length;i++) {
            strData += String.fromCharCode(aData[i]);
         }
      }
      return btoa(strData);
   }

   // creates a base64 encoded string containing BMP data
   // takes an imagedata object as argument
   var createBMP = function(oData) {
      var aHeader = [];

      var iWidth = oData.width;
      var iHeight = oData.height;

      aHeader.push(0x42); // magic 1
      aHeader.push(0x4D);

      var iFileSize = iWidth*iHeight*3 + 54; // total header size = 54 bytes
      aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
      aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
      aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
      aHeader.push(iFileSize % 256);

      aHeader.push(0); // reserved
      aHeader.push(0);
      aHeader.push(0); // reserved
      aHeader.push(0);

      aHeader.push(54); // dataoffset
      aHeader.push(0);
      aHeader.push(0);
      aHeader.push(0);

      var aInfoHeader = [];
      aInfoHeader.push(40); // info header size
      aInfoHeader.push(0);
      aInfoHeader.push(0);
      aInfoHeader.push(0);

      var iImageWidth = iWidth;
      aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
      aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
      aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
      aInfoHeader.push(iImageWidth % 256);

      var iImageHeight = iHeight;
      aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
      aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
      aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
      aInfoHeader.push(iImageHeight % 256);

      aInfoHeader.push(1); // num of planes
      aInfoHeader.push(0);

      aInfoHeader.push(24); // num of bits per pixel
      aInfoHeader.push(0);

      aInfoHeader.push(0); // compression = none
      aInfoHeader.push(0);
      aInfoHeader.push(0);
      aInfoHeader.push(0);

      var iDataSize = iWidth*iHeight*3; 
      aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
      aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
      aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
      aInfoHeader.push(iDataSize % 256); 

      for (var i=0;i<16;i++) {
         aInfoHeader.push(0); // these bytes not used
      }

      var iPadding = (4 - ((iWidth * 3) % 4)) % 4;

      var aImgData = oData.data;

      var strPixelData = "";
      var y = iHeight;
      do {
         var iOffsetY = iWidth*(y-1)*4;
         var strPixelRow = "";
         for (var x=0;x<iWidth;x++) {
            var iOffsetX = 4*x;

            strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+2]);
            strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+1]);
            strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX]);
         }
         for (var c=0;c<iPadding;c++) {
            strPixelRow += String.fromCharCode(0);
         }
         strPixelData += strPixelRow;
      } while (--y);

      var strEncoded = encodeData(aHeader.concat(aInfoHeader)) + encodeData(strPixelData);

      return strEncoded;
   }


   // sends the generated file to the client
   var saveFile = function(strData) {
      document.location.href = strData;
   }

   var makeDataURI = function(strData, strMime) {
      return "data:" + strMime + ";base64," + strData;
   }

   // generates a <img> object containing the imagedata
   var makeImageObject = function(strSource) {
      var oImgElement = document.createElement("img");
      oImgElement.src = strSource;
      return oImgElement;
   }

   var scaleCanvas = function(oCanvas, iWidth, iHeight) {
      if (iWidth && iHeight) {
         var oSaveCanvas = document.createElement("canvas");
         oSaveCanvas.width = iWidth;
         oSaveCanvas.height = iHeight;
         oSaveCanvas.style.width = iWidth+"px";
         oSaveCanvas.style.height = iHeight+"px";

         var oSaveCtx = oSaveCanvas.getContext("2d");

         oSaveCtx.drawImage(oCanvas, 0, 0, oCanvas.width, oCanvas.height, 0, 0, iWidth, iHeight);
         return oSaveCanvas;
      }
      return oCanvas;
   }

   return {

      saveAsPNG : function(oCanvas, bReturnImg, iWidth, iHeight) {
         if (!bHasDataURL) {
            return false;
         }
         var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);
         var strData = oScaledCanvas.toDataURL("image/png");
         if (bReturnImg) {
            return makeImageObject(strData);
         } else {
            saveFile(strData.replace("image/png", strDownloadMime));
         }
         return true;
      },

      saveAsJPEG : function(oCanvas, bReturnImg, iWidth, iHeight) {
         if (!bHasDataURL) {
            return false;
         }

         var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);
         var strMime = "image/jpeg";
         var strData = oScaledCanvas.toDataURL(strMime);

         // check if browser actually supports jpeg by looking for the mime type in the data uri.
         // if not, return false
         if (strData.indexOf(strMime) != 5) {
            return false;
         }

         if (bReturnImg) {
            return makeImageObject(strData);
         } else {
            saveFile(strData.replace(strMime, strDownloadMime));
         }
         return true;
      },

      saveAsBMP : function(oCanvas, bReturnImg, iWidth, iHeight) {
         if (!(bHasImageData && bHasBase64)) {
            return false;
         }

         var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);

         var oData = readCanvasData(oScaledCanvas);
         var strImgData = createBMP(oData);
         if (bReturnImg) {
            return makeImageObject(makeDataURI(strImgData, "image/bmp"));
         } else {
            saveFile(makeDataURI(strImgData, strDownloadMime));
         }
         return true;
      }
   };

})();

function loadXMLDoc(filename)
{
   if (window.XMLHttpRequest)
   {
      xhttp=new XMLHttpRequest();
   }
   else // code for IE5 and IE6
   {
      xhttp=new ActiveXObject("Microsoft.XMLHTTP");
   }
   xhttp.open("GET",filename,false);
   xhttp.send();
   return xhttp.responseXML;
}

// returns the width in pixels of the text area drawn.
function drawText(ctx, offsetx, offsety, scale, txt, x, y, c1, textmodifier, textsize)
{
   let fontsize = textsize*scale[1]/300;
   ctx.fillStyle = c1;
   ctx.font = textmodifier + " " + fontsize + "px Helvetica, sans-serif";
   ctx.fillText( txt, x*scale[0] + offsetx, y*scale[1] + offsety );
   //ctx.fillText( txt, x, y );
   //return [[x*scale[0] + offsetx, y*scale[1] + offsety],
   //         [ctx.measureText( txt ).width, fontsize]];
   return ctx.measureText( txt ).width;
}

function drawLine(ctx, x, y, x2, y2, style, thickness) {
   ctx.strokeStyle = style;
   ctx.lineWidth = thickness;
   ctx.beginPath();
   ctx.moveTo(x, y);
   ctx.lineTo(x2, y2);
   ctx.closePath();
   ctx.stroke();
}


function drawStar( ctx, x, y, size, c1, c2, linewidth )
{
   // bounding box of normalized star is 0,0 .. 14,14
   var s = size/14.0;
   //x -= size/2.0;
   //y -= size/2.0;

   ctx.fillStyle = c1;
   ctx.beginPath();
   ctx.moveTo(0.0*s + x, 5.5*s + y);
   ctx.lineTo(5.0*s + x, 5.0*s + y);
   ctx.lineTo(7.0*s + x, 0.0*s + y);
   ctx.lineTo(9.0*s + x, 5.0*s + y);
   ctx.lineTo(14.0*s + x,5.5*s + y);
   ctx.lineTo(10.5*s + x,9.0*s + y);
   ctx.lineTo(12.0*s + x,14.0*s + y);
   ctx.lineTo(7.0*s + x, 11.5*s + y);
   ctx.lineTo(2.0*s + x, 14.0*s + y);
   ctx.lineTo(3.5*s + x, 9.0*s + y);
   ctx.closePath();
   ctx.fill();

   ctx.strokeStyle = c2;
   ctx.lineWidth = linewidth;
   ctx.beginPath();
   ctx.moveTo(0.0*s + x, 5.5*s + y);
   ctx.lineTo(5.0*s + x, 5.0*s + y);
   ctx.lineTo(7.0*s + x, 0.0*s + y);
   ctx.lineTo(9.0*s + x, 5.0*s + y);
   ctx.lineTo(14.0*s + x,5.5*s + y);
   ctx.lineTo(10.5*s + x,9.0*s + y);
   ctx.lineTo(12.0*s + x,14.0*s + y);
   ctx.lineTo(7.0*s + x, 11.5*s + y);
   ctx.lineTo(2.0*s + x, 14.0*s + y);
   ctx.lineTo(3.5*s + x, 9.0*s + y);
   ctx.closePath();
   ctx.stroke();
}

/**
 *      Draws an array of points (x,y).
 *      context            = 2d context from canvas element
 *      points            = array of float or integers arranged as x1,y1,x2,y1,...,xn,yn. Minimum 2 points.
 *      NOTE: array must contain a minimum set of two points.
 */
function drawLines(ctx, x, y, scale, pts, color, linewidth) {
   ctx.strokeStyle = color;
   ctx.lineWidth = linewidth;
   ctx.beginPath();
   ctx.moveTo( pts[0]*scale[0]+x, pts[1]*scale[1]+y );
   for (i = 2; i < pts.length - 1; i += 2) {
      ctx.lineTo( pts[i]*scale[0]+x, pts[i+1]*scale[1]+y );
   }
   //ctx.closePath();
   ctx.stroke();
}

function drawPoint( ctx, x, y, scale, pt, color )
{
   ctx.fillStyle = color;
   ctx.beginPath();
   ctx.rect( (pt[0]*scale[0]-2) + x, (pt[1]*scale[1]-2) + y, 4, 4 );
   ctx.fill();
}

// returns spline points
function drawCurve(ctx, x, y, scale, ptsa, isClosed, numOfSegments, color, linewidth, showPoints) {

   showPoints   = showPoints ? showPoints : false;
   let curve_pts = getCurvePoints(ptsa, numOfSegments);
   drawLines(ctx, x, y, scale, curve_pts, color, linewidth);

   if (showPoints) {
      console.log( "drawing points" );
      ctx.fillStyle = color;
      ctx.beginPath();
      for(var i = 0; i < ptsa.length - 1; i += 2) {
         ctx.rect( (ptsa[i]*scale[0]) - 2 + x, (ptsa[i+1]*scale[1] - 2) + y, 4, 4 );
         //console.log( ptsa[i] + " " + ptsa[i+1] );
      }
      ctx.fill();
   }
   return curve_pts;
}

// Catmull Rom Spline from arbitrary list of points (Uniform, Centripetal, Chordal)
// https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
//
// ptsa           flat float array of points
// numOfSegments  how many subdivisions in between each point
// alpha          0==uniform (std catmull rom), 0.5==centripetal, 1.0==chordal
function getCurvePoints(ptsa, numOfSegments, alpha=0.5 /*centripetal*/) {
   numOfSegments = numOfSegments ? numOfSegments : 16;
   //console.log( " numOfSegments:" + numOfSegments  );

   let first = [ptsa[0], ptsa[1]];
   let second = [ptsa[2], ptsa[3]];
   let last = [ptsa[ptsa.length-2], ptsa[ptsa.length-1]];
   let second_to_last = [ptsa[ptsa.length-4], ptsa[ptsa.length-3]];

   [100,0], [101,0]

   //copy 1. mirror the 2nd point at beginning and end
   let points = [];
   points.push( [first[0] + first[0]-second[0], first[1] + first[1]-second[1]] ); // mirror
   for (let b = 0; b < ptsa.length; b+=2) {
      points.push( [ptsa[b], ptsa[b+1]] );
   }
   points.push( [last[0] + last[0]-second_to_last[0], last[1] + last[1]-second_to_last[1]] ); // mirror
   let _pts = [];
   // debugging
   //_pts.push(points[0][0]);
   //_pts.push(points[0][1]);

   for (let point_it = 0; point_it < points.length-3; ++point_it) {

      let p0 = points[0+point_it];
      let p1 = points[1+point_it];
      let p2 = points[2+point_it];
      let p3 = points[3+point_it];

      let GetT = function(/*float*/ t, /*Vector2*/ p0, /*Vector2*/ p1) {
         let a = Math.pow((p1[0] - p0[0]), 2.0) + Math.pow((p1[1] - p0[1]), 2.0);
         let b = Math.pow(a, 0.5);
         let c = Math.pow(b, alpha);
         return (c + t);
      }

      let t0 = 0.0;
      let t1 = GetT(t0, p0, p1);
      let t2 = GetT(t1, p1, p2);
      let t3 = GetT(t2, p2, p3);

      let t;
      for (t = t1; t <= t2; t += ((t2-t1) / numOfSegments))
      {
         let A1x = ((t1-t)/(t1-t0)) * p0[0] + ((t-t0)/(t1-t0)) * p1[0];
         let A1y = (t1-t)/(t1-t0) * p0[1] + (t-t0)/(t1-t0) * p1[1];
         let A2x = (t2-t)/(t2-t1) * p1[0] + (t-t1)/(t2-t1) * p2[0];
         let A2y = (t2-t)/(t2-t1) * p1[1] + (t-t1)/(t2-t1) * p2[1];
         let A3x = (t3-t)/(t3-t2) * p2[0] + (t-t2)/(t3-t2) * p3[0];
         let A3y = (t3-t)/(t3-t2) * p2[1] + (t-t2)/(t3-t2) * p3[1];

         let B1x = (t2-t)/(t2-t0) * A1x + (t-t0)/(t2-t0) * A2x;
         let B1y = (t2-t)/(t2-t0) * A1y + (t-t0)/(t2-t0) * A2y;
         let B2x = (t3-t)/(t3-t1) * A2x + (t-t1)/(t3-t1) * A3x;
         let B2y = (t3-t)/(t3-t1) * A2y + (t-t1)/(t3-t1) * A3y;

         let Cx = (t2-t)/(t2-t1) * B1x + (t-t1)/(t2-t1) * B2x;
         let Cy = (t2-t)/(t2-t1) * B1y + (t-t1)/(t2-t1) * B2y;

         //console.log( " Cx:" + Cx + " Cy:" + Cy );
         _pts.push(Cx);
         _pts.push(Cy);
      }
   }
   // add the last point (close the gap)
   _pts.push(points[points.length-2][0]);
   _pts.push(points[points.length-2][1]);

   // debugging:
   //_pts.push(points[points.length-1][0]);
   //_pts.push(points[points.length-1][1]);

   return _pts;
};




