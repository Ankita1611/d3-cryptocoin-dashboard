export function formProperDateFormat(year, month, day) { 
  // example: turns 2017, 5, 14 into 2017-05-15
  let dateStr = `${year}-${month < 10 ? ("0" + month) : month}-${day < 10 ? ("0" + day) : day}`;
  return dateStr;
}

export function twoArraysAreEqual(array, array2) {
  // if the other array is a falsy value, return
  if (!array2)
    return false;

  // compare lengths - can save a lot of time 
  if (array.length != array2.length)
    return false;

  for (let i = 0, l = array.length; i < l; i+=1) {
    // Check if we have nested arrays
    if (array[i] instanceof Array && array2[i] instanceof Array) {
      // recurse into the nested arrays
      if (!array[i].equals(array2[i]))
        return false;
    }
    else if (array[i] != array2[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }       
  return true;    
}

// recursivly finds averages for two values(binary lookup)
export function formTickValues({ finalLevel, level, prevSm, prevLg }) {
  if(level === finalLevel) {
    return;
  }

  let outputArray = [prevSm, prevLg];
  const currTick = (prevLg + prevSm) / 2;

  outputArray.push(currTick);

  const valuesDown = formTickValues({
    finalLevel,
    level: level + 1,
    prevSm: currTick,
    prevLg
  });

  if(!!valuesDown) {
    outputArray = outputArray.concat(valuesDown);
  }

  const valuesUp = formTickValues({
    finalLevel,
    level: level + 1,
    prevSm,
    prevLg: currTick
  });
              
  if(!!valuesUp) {
    outputArray = outputArray.concat(valuesUp);
  }

  return [ ...new Set(outputArray) ]; // Set is used to remove duplicates
}

export function createDateObj(dateStr) {
  const dateArr = dateStr.split("-");
  const year = dateArr[0];
  const month = dateArr[1] - 1;
  const day =  dateArr[2]; // - 1
  return new Date(year, month, day);
}

export function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i+=1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function changeCSSProperties (properties, values, element) {
  properties.forEach((property, index) => {
    element.style[property] = values[index];
  });
}


// DEPRECTED FUNCTIONS

/*
  export function scaleGraphSize(svgSelector, width, dir, callback) {
    const svg = document.querySelector(svgSelector);
    if(!svg) {
        return;
    }

  const svgWidth = +svg.getAttribute("width");
    if(
      (dir === "down" && svgWidth > width) 
      || (dir === "up" && svgWidth < width)
    ) {
        svg.setAttribute("width", width);
        svg.setAttribute("height", Math.round(width * 0.6));
        if(callback) {
          callback();
        }
    }
  }
*/

/*
  function removeDuplicates(array) {
    const a = array.concat();
    for(let i=0; i<a.length; ++i) {
        for(let j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j=-1, 1);
        }
    }
    return a;
  }
*/