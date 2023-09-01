
/** 
const polygons = [
    {
        'name': 'Chelston Exchange',
        'province': 'Lusaka',
        'points' :  [
            [-15.3716333, 28.3907783],  // -15°22.2980 S, 28°23.4467 E
            [-15.3708267, 28.3932037],  // -15°22.2496 S, 28°23.5922 E
            [-15.3725917, 28.3911167],  // -15°22.3555 S, 28°23.4670 E
            [-15.3718308, 28.3942333], // -15°22.3098 S, 28°23.6540  E 
        ]
    },
    {
        'name': 'Emmasdale Exchange',
        'province': 'Lusaka',
        'points' :  [
            [-15.3887383, 28.2673850],  // -15°23.3243 S, 28°16.0431 E
            [-15.3887850, 28.2696767],  // -15°23.3271 S, 28°16.1806 E
            [-15.3900267, 28.2695800],  // -15°23.4016 S, 28°16.1748 E
            [-15.3898400, 28.2689550],  // -15°23.3904 S, 28°16.0373 E 
        ]
    },
    {
        'name': 'Kwacha House',
        'province': 'Lusaka',
        'points' :  [
            [-15.4175317, 28.3024250],  // -15°25.0519 S, 28°18.1455 E
            [-15.4161933, 28.3040050],  // -15°24.9716 S, 28°18.2403 E
            //[-15.4164200, 28.3042067],  // -15°24.9852 S, 28°18.2524 E
            [-15.4174083, 28.3043300],  // -15°25.0445 S, 28°18.2598 E 
            [-15.4180650, 28.3032567],  // -15°25.0839 S, 28°18.1954 E 
        ]
    },
    {
        'name': 'Lumumba Store',
        'province': 'Lusaka',
        'points' :  [
            [-15.4066333, 28.2684367],  // -15°24.3980 S, 28°16.1062 E
            [-15.4058783, 28.2695317],  // -15°24.3527 S, 28°16.1719 E
            [-15.4073267, 28.2715650],  // -15°24.4396 S, 28°16.2939 E 
            [-15.4086033, 28.2707917],  // -15°24.5162 S, 28°16.2475 E 
        ]
    },
    {
        'name': 'Zamtel House',
        'province': 'Lusaka',
        'points' :  [
            [-15.4180617, 28.2931083],  // -15°25.0837 S, 28°17.5865 E
            [-15.4148967, 28.2962850],  // -15°24.8938 S, 28°17.7571 E
            [-15.4155483, 28.2972917],  // -15°24.9329 S, 28°17.8375 E 
            [-15.4200783, 28.2936767],  // -15°25.2047 S, 28°17.6206 E 
        ]
    }
   
];

*/

function isPointInPolygon(point, polygons){
    for (index in polygons){
        if(checkPolygon(point, JSON.parse(polygons[index].points))){ 
            return polygons[index].name;
        }
    }

    return false
}

function checkPolygon(pointString, polygon) {
    let point = pointString.split(',').map(parseFloat)
    const x = point[0];
    const y = point[1];
    let isInside = false;
  
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
  
      const intersect = ((yi > y) !== (yj > y)) &&
                        (x < ((xj - xi) * (y - yi) / (yj - yi)) + xi);
  
      if (intersect) {
        isInside = !isInside;
      }
    }
  
    return isInside;
}

module.exports = {
    isPointInPolygon
}