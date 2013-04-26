//TODO
//custom map size add selects onclick processing + set dist object on buutton click
//add timer
//add controls numbers
//add finish point
//show all map after finish
//add lines between controls in show distance

//add map scale and total distance calculation
//add laps for each control
//add penalty fow additional map showing timex10

//bind show map func on space
        
        
var canDraw = false;
$(document).ready(function() {
    var canvas = document.getElementById('map');
    var course_canvas = document.getElementById('course');
    var fog_canvas = document.getElementById('path');
    
    var context = canvas.getContext('2d');
    var course_context = course_canvas.getContext('2d');
    var fog_context = fog_canvas.getContext('2d');
    
    //distance object
    var distance = Object.create(null);
    distance.start = {x: 100, y: 500};
    distance.controlPoints = [{x: 700, y: 300, v: 10, isFound: false, isVisible: false}, {x: 400, y: 200, v: 10, isFound: false, isVisible: false}];
    distance.draw_distance = function(ctx,element,x,y, color){
        switch (element) {
            case 'start':
                ctx.moveTo(x,y);
                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.strokeStyle = color;
                ctx.moveTo(x,y-18);
                ctx.lineTo(x+15,y+9);
                ctx.lineTo(x-15,y+9);
                ctx.lineTo(x,y-18);
                ctx.lineTo(x+15,y+9);
                ctx.stroke();
                break
            case 'cp':
                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.strokeStyle = color;
                ctx.arc(x,y,15,0,2*Math.PI, true);
                ctx.stroke();
                break
            case 'line':
                break
        }
    }
    
    //path
    var curPos = {x: distance.start.x, y: distance.start.y};
    var curCP = 0;
    var path = [curPos];
    
    if (canvas.getContext && fog_canvas.getContext && course_canvas.getContext){
        var x = getStyle(fog_canvas, "width");
        var y = getStyle(fog_canvas, "height");
        x = x.substring(0,x.length-2);
        y = y.substring(0,y.length-2);
        draw(context, fog_context, course_context, distance, {x: x, y: y});
    }
    
    //Попадание на контрольный пункт
    function ifInCP(curPos){
        for (n in distance.controlPoints){
            var CP;
            CP = distance.controlPoints[n];
            if(((CP.x-curPos.x)*(CP.x-curPos.x) + (CP.y-curPos.y)*(CP.y-curPos.y)) < (CP.v*CP.v)){
                //if it's current CP
                if (curCP == n && distance.controlPoints[n].isVisible === false){
                    distance.controlPoints[n].isFound = true;
                    distance.draw_distance(course_context,'cp', distance.controlPoints[n].x, distance.controlPoints[n].y,"#00FF00");
                    curPos = {x: distance.controlPoints[n].x, y: distance.controlPoints[n].y};
                    eraser({offsetX: curPos.x,offsetY: curPos.y}, context, fog_context, 20, curPos);
                    curCP++;
                }
            }            
        }
    }
    //Продолжение пути, если попали в максимальный радиус от конца
    function ifInRadius(e, radius){
        function pathToCurPos(path, ctx){
            var end;
            var sX, sY, fX, fY;
            end = path.length-1;
            sX = path[end-1].x;
            sY = path[end-1].y;
            fX = path[end].x;
            fY = path[end].y;
            ctx.beginPath();
            ctx.moveTo(sX,sY);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#C5007F";
            ctx.lineTo(fX,fY);
            ctx.stroke();
        }
        var mouseX, mouseY;
        if(e.offsetX) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
            }
        else if(e.layerX) {
            mouseX = e.layerX;
            mouseY = e.layerY;
        }
        if (((mouseX-curPos.x)*(mouseX-curPos.x) + (mouseY-curPos.y)*(mouseY-curPos.y)) < (radius*radius)){
            eraser(e, context, fog_context, 2*radius, curPos);
            curPos = {x: mouseX, y: mouseY};
            path.push(curPos);
            pathToCurPos(path, context);
            ifInCP(curPos);
        }
    }
    
    $(fog_canvas).bind('mousedown', function(e) {
        if (canDraw){
            ifInRadius(e, 20);
            $(fog_canvas).bind('mousemove', function(e) {
                ifInRadius(e, 20);
            });
        }
    });
    
    function drawPath(path, ctx){
        for (i=0; i<path.length-1; i++){
            ctx.beginPath();
            ctx.moveTo(path[i].x,path[i].y);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#C5007F";
            ctx.lineTo(path[i+1].x,path[i+1].y);
            ctx.stroke();
        }
    }
    
    $(fog_canvas).bind('mouseup', function() {
        if (canDraw){
            $(fog_canvas).unbind('mousemove');
            if (path.length > 2){
                path = simplify(path, 1.0);
                drawPath(path, context);
            }
            
        }
    });
    
    var showMap = document.getElementById('showMap');
    $(showMap).bind('click', function() {
        if (canDraw){
            canDraw = 'false';
            var fogLayer;
            fogLayer = document.getElementById('path');
            function revert(){
                fogLayer.style.visibility = 'visible';
                canDraw = 'true';
            }
            fogLayer.style.visibility = 'hidden';
            setTimeout(revert,5000);
        }
    });
    
    
});


//----------painting------------//
//загружаем картинку и рисуем туман
function draw(context, fog_context, course_context, distance, size) {
    var img = new Image(); 
    img.src = 'testMap2.jpg';    
    img.onload = function() {
    context.drawImage(img, 0, 0);
    
    //draw course
    setTimeout(function(){
            fog_context.fillStyle = "rgba(0, 200, 200, 1)";
            fog_context.fillRect (0, 0, size.x, size.y);
            eraser({offsetX: distance.start.x,offsetY: distance.start.y}, context, fog_context,40,{x: distance.start.x, y: distance.start.y});
            for (var cp in distance.controlPoints){
                eraser({offsetX: distance.controlPoints[cp].x,offsetY: distance.controlPoints[cp].y}, context, fog_context,20,{x: distance.controlPoints[cp].x, y: distance.controlPoints[cp].y});
            }
            canDraw = true;
        },5000);
    //enable drawing
 
    distance.draw_distance(course_context,'start', distance.start.x, distance.start.y,"#C5007F");
    for (var cp in distance.controlPoints){
        distance.draw_distance(course_context,'cp', distance.controlPoints[cp].x, distance.controlPoints[cp].y,"#C5007F");
    }   
  }
}

function eraser(e, context, fog_context, radius , curPos) {
  /**
   * Пока в эту функцию передаются только рабочий контекст, радиус (пока он используется для задания стороны квадрата ластика) и объект event.
   * Позже, нам понадобится добавить сюда передачу второго контекста
   */
  var mouseX, mouseY;
 
  var diameter = radius * 2;
 
  if(e.offsetX) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
  }
  else if(e.layerX) {
    mouseX = e.layerX;
    mouseY = e.layerY;
  } else {
    mouseX = -1000;
    mouseY = -1000;
  }
         // Этот вариант ластика нам не подходит:
         //context.clearRect(mouseX, mouseY, radius, radius);
         // вместо него используем такой: сначала из нижнего холста получаем значения цветов пикселов, попавших под ластик
         imagedata = context.getImageData(mouseX - radius, mouseY - radius, diameter, diameter);
         fog_imagedata = fog_context.getImageData(mouseX - radius, mouseY - radius, diameter, diameter);
        
         //for(elem in imagedata) {
         //  console.log(elem);
         //}
        
         elem_count = diameter * diameter * 4;
        
         // преобразовываем массив пикселов
         i = 0;
         while(i <= elem_count) {
           /*
            каждый элемент массива это не массив ргба, а отдельная компонетна цвета, то есть для нулевого элемента
            0 - р
            1 - г
            2 - б
            3 - а
            
            для m = i / 4 элемента:
            i     - р
            i + 1 - г
            i + 2 - б
            i + 3 - а
            
            
            c
            |
            |\
            | \
            |  \
            |   \
            |____\
            b     a
            
            ac должно быть меньше radius
            
            a — центр круга
           
            */
        
           // определяю координаты точки в матрице. m — номер в строке, n — номер строки
           m = i / 4;
           if (m < diameter) {
             n = 0;
           } else {
             n = 0;
             while(m >= diameter) {
               m -= diameter;
               n++;
             }
           }
        
           bc = radius - m;
           if(bc < 0) {
             bc = -bc;
           }
        
           ab = radius - n;
           if(ab < 0) {
             ab = -ab;
           }
        
           if(Math.sqrt(bc * bc + ab * ab) < radius) {
             // Если пиксел попал в круг, то меняю его цвет как на нижнем холсте, иначе оставляю цвет на такой как на верхнем холсте
             fog_imagedata['data'][i]     = imagedata['data'][i];     // r
             fog_imagedata['data'][i + 1] = imagedata['data'][i + 1]; // g
             fog_imagedata['data'][i + 2] = imagedata['data'][i + 2]; // b
             //fog_imagedata['data'][i + 3] = imagedata['data'][i + 3]; // a
             fog_imagedata['data'][i + 3] = 0; // a
           }
        
           i += 4;
         }
        
         // Затем заменяем этими пикселами пикселы на рабочем холсте:
         fog_context.putImageData(fog_imagedata, mouseX - radius, mouseY - radius);
}

//get computed styles var elementFontSize = getStyle(document.getElementById("container"), "font-size");
function getStyle(oElm, strCssRule){
    var strValue = "";
    if(document.defaultView && document.defaultView.getComputedStyle){
        strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
    }
    else if(oElm.currentStyle){
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
            return p1.toUpperCase();
        });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
}