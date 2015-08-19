var currentIslandGrid = [];
Array.prototype.clone = function () {
    var arr = this.slice(0);
    for (var i = 0; i < this.length; i++) {
        if (this[i].clone) {
            //recursion
            arr[i] = this[i].clone();
        }
    }
    return arr;
};
function getDistanceFromCenter(number, gridSize) {
    var positiveDistance = Math.abs(number - gridSize / 2);
    var negativeDistance = Math.abs(gridSize - 1 - number - gridSize / 2);
    return Math.max(positiveDistance, negativeDistance);
}
function render() {
    var islandsArray = currentIslandGrid;
    var size = 4;
    var arraySize = islandsArray.length * size;
    var c = document.getElementById("mainScreen");
    c.width = arraySize;
    c.height = arraySize;


    var ctx = c.getContext("2d");

    for (var x = 0; x < islandsArray.length; x++) {
        for (var y = 0; y < islandsArray.length; y++) {
            var type = "rgb(0,0,0)";
            if (islandsArray[y][x] === 0) {
                type = "rgb(0,192,192)"; // water
            } else if (islandsArray[y][x] === 1) {
                type = "rgb(0,255,0)"; // land
            } else if (islandsArray[y][x] === 2) {
                type = "rgb(255,255,0)"; // sand
            } else if (islandsArray[y][x] === 3) {
                type = "rgb(0,128,0)"; // forest
            } else if (islandsArray[y][x] === 4) {
                type = "rgb(0,192,0)"; // small forest
            } else if (islandsArray[y][x] === 5) {
                type = "rgb(128,128,128)"; // stone
            } else if (islandsArray[y][x] === 6) {
                type = "rgb(192,255,255)"; // shallow water
            }
            //ctx.putImageData(type, x * size, y * size);
            ctx.fillStyle = type;
            ctx.fillRect(x * size, y * size, size, size);
        }
    }
}
function printIsland(description, needReset) {
    var select = document.getElementById("descriptionList");
    if (needReset === true) {
        select.innerHTML = "";
    }
    var option = document.createElement("span");

    option.innerHTML = select.childNodes.length + 1 + ": " + description;
    select.appendChild(option);

}



function stage1(islands) {
    ////////////////////////////////////
    // INITIAL STAGE: Basic island
    ////////////////////////////////////
    islands = [];
    var length = 16; // user defined length

    for (var x = 0; x < length; x++) {
        var yarray = [];
        islands.push(yarray);
        for (var y = 0; y < length; y++) {
            var islandNumber =
                    y > 5 && y < 10 &&
                    x > 5 && x < 10 ? 1 : 0;
            yarray.push(islandNumber);
        }
    }

    printIsland("Creating basic island", true);
    return islands;
}




function stage2(islands) {
    var length = islands.length;
    ////////////////////////////////////
    // SECOND STAGE: increasing island size
    ////////////////////////////////////
    for (var counter = 0; counter < 3; counter++) {
        for (var distanceFromCenter = 3; distanceFromCenter < length / 2; distanceFromCenter++) {
            var stage = islands.clone();
            for (var x = 0; x < length; x++) {
                for (var y = 0; y < length; y++) {
                    var yDistance = getDistanceFromCenter(y, length);
                    var xDistance = getDistanceFromCenter(x, length);
                    if ((xDistance === distanceFromCenter && yDistance <= distanceFromCenter)
                            || (yDistance === distanceFromCenter && xDistance <= distanceFromCenter)) {
                        var surroundings = 0;
                        for (var i = -1; i < 2; i++)
                            for (var j = -1; j < 2; j++)
                                //if(i === 0 || j === 0)
                                if (islands[y + i][x + j] !== 0)
                                    surroundings++;
                        var globalDistanceFromCenter = Math.sqrt(yDistance * yDistance + xDistance * xDistance);
                        globalDistanceFromCenter /= 30;
                        surroundings /= 2.6;
                        surroundings -= globalDistanceFromCenter;
                        stage[y][x] = Math.random() + Math.random() < surroundings ? 1 : 0;
                    }
                }
            }
            islands = stage;
        }
    }

    printIsland("Increasing island size");
    return islands;
}

function stage3(islands) {
    ////////////////////////////////////
    // THIRD STAGE: Increasing land size
    ////////////////////////////////////
    var length = islands.length;
    if (length > 128 && confirm("Island size to large, enlarging cancelled. Press ok to do it anyway!"))
        return islands; // Prevent crashing

    var stage = [];
    var sizeIncrease = 8; // Islands size increase
    var newSize = sizeIncrease * length;
    for (var x = 0; x < newSize; x++) {
        var yarray = [];
        stage.push(yarray);
        for (var y = 0; y < newSize; y++) {
            yarray.push(0);
        }
    }
    for (var x = 0; x < length; x++) {
        for (var y = 0; y < length; y++) {
            var selfNumber = islands[y][x];
            for (var i = 0; i < sizeIncrease; i++) {
                for (var j = 0; j < sizeIncrease; j++) {
                    stage[y * sizeIncrease + j][x * sizeIncrease + i] = selfNumber;
                }
            }
        }
    }
    islands = stage;
    length = newSize;

    printIsland("Increasing grid size");
    return islands;
}


function stage4(islands) {
    var length = islands.length;
    ////////////////////////////////////////////
    // FOURTH STAGE: Random noise
    // ////////////////////////////////
    // This skips the 6 outher lines to prevent the land from touching the sides

    var stage = islands.clone();
    for (var x = 6; x < length - 6; x++) {
        for (var y = 6; y < length - 6; y++) {
            var water = 0;
            var land = 0;
            for (var i = -5; i < 6; i++)
                for (var j = -5; j < 6; j++)
                    if (i * i + j * j <= 5 * 5) // in circle of radius 3
                        if (islands[y + i][x + j] === 0)
                            water++;
                        else
                            land++;
            var randomNumber = Math.random() + Math.random() + Math.random() + Math.random();
            randomNumber /= 4; // more change towards the middle of the range
            var rand = randomNumber * (land + water);
            if (rand > water)
                stage[y][x] = 1;
            else
                stage[y][x] = 0;
        }
    }
    islands = stage;

    printIsland("Island based noise overlay");
    return islands;
}

function stage5(islands) {
    var length = islands.length;
    ////////////////////////////////////////////
    // FIFTH STAGE: Larger blur
    ////////////////////////////////////////////
    var changed;
    var changedTimes = 0;
    do {
        changed = false;
        var stage = islands.clone();
        for (var x = 6; x < length - 6; x++) {
            for (var y = 6; y < length - 6; y++) {
                var selfnumber = stage[y][x];
                var water = 0;
                var land = 0;
                for (var i = -5; i < 6; i++)
                    for (var j = -5; j < 6; j++)
                        if (i * i + j * j <= 5 * 5) // in circle of radius 5
                            if (islands[y + i][x + j] === 0)
                                water++;
                            else
                                land++;
                if (selfnumber === 0 && water < 25) {
                    stage[y][x] = 1;
                    changed = true;
                } else if (selfnumber === 1 && land < 25) {
                    stage[y][x] = 0;
                    changed = true;
                }

            }
        }
        islands = stage;
        changedTimes++;
    } while (changed && changedTimes < 100);
    printIsland("Larger blur");
    return islands;
}


function stage6(islands) {
    var length = islands.length;
    ////////////////////////////////////
    // SIXTH STAGE: removing seperate areas
    ////////////////////////////////////

    var changed;
    var changedTimes = 0;
    do {
        changed = false;
        var stage = islands.clone();
        for (var x = 1; x < length - 1; x++) {
            for (var y = 1; y < length - 1; y++) {

                var water = 0;
                var land = 0;
                for (var i = -1; i < 2; i++)
                    for (var j = -1; j < 2; j++)
                        if (i === 0 || j === 0)
                            if (islands[y + i][x + j] === 0)
                                water++;
                            else
                                land++;
                if (islands[y][x] === 0) { // There is water
                    if (water === 1) { // Without surroundings
                        stage[y][x] = 1;
                        changed = true;
                    }
                } else { // There is land
                    if (land === 1) { // Without Surroundings
                        stage[y][x] = 0;
                        changed = true;
                    }
                }
            }
        }
        islands = stage;
        changedTimes++;
    } while (changed && changedTimes < 100);


    printIsland("Removing seperate islands");
    return islands;
}


function stage7(islands) {
    var length = islands.length;
    ////////////////////////////////////////////
    // SEVENTH STAGE: Adding sand
    ////////////////////////////////////////////

    var stage = islands.clone();
    for (var x = 2; x < length - 2; x++) {
        for (var y = 2; y < length - 2; y++) {
            var selfnumber = stage[y][x];
            var water = 0;
            var land = 0;
            for (var i = -2; i < 3; i++)
                for (var j = -2; j < 3; j++)
                    if (i * i + j * j <= 2 * 2) // in the circle of radius 2
                        if (islands[y + i][x + j] === 0)
                            water++;
                        else
                            land++;
            if (water > 0 && selfnumber === 1) {
                stage[y][x] = 2;
            }
        }
    }
    islands = stage;

    printIsland("Adding sand");
    return islands;
}

function stage8(islands) {
    var length = islands.length;
    ////////////////////////////////////////////
    // EIGHT STAGE: Adding forests
    ////////////////////////////////////////////

    var stage = islands.clone();
    var forestStarting = [];
    for (var x = 2; x < length - 2; x++) {
        for (var y = 2; y < length - 2; y++) {
            var selfnumber = stage[y][x];
            var sand = 0;
            var land = 0;
            var water = 0;
            for (var i = -2; i < 3; i++)
                for (var j = -2; j < 3; j++)
                    if (i * i + j * j <= 2 * 2) // in the circle of radius 2
                        if (islands[y + i][x + j] === 0)
                            water++;
                        else if (islands[y + i][x + j] === 1)
                            land++;
                        else
                            sand++;
            if (water === 0 && sand === 0 && selfnumber === 1) {
                forestStarting.push([parseInt(x + ""), parseInt(y + "")]);
            }
        }
    }
    for (var counter = 0; counter < forestStarting.length / 8; counter++) {
        var rand = forestStarting[Math.floor(Math.random() * forestStarting.length)];
        stage[rand[1]][rand[0]] = 3;
    }

    islands = stage;

    printIsland("Adding forests");
    return islands;
}


function stage9(islands) {
    var length = islands.length;
    ////////////////////////////////////////////
    // NINETH STAGE: Growing forests
    ////////////////////////////////////////////
    for (var counter = 0; counter < 6; counter++) {
        var stage = islands.clone();
        for (var x = 2; x < length - 2; x++) {
            for (var y = 2; y < length - 2; y++) {
                var selfnumber = stage[y][x];
                var forests = 0;
                var other = 0;
                var sand = 0;
                for (var i = -2; i < 3; i++)
                    for (var j = -2; j < 3; j++)
                        if (i * i + j * j <= 2 * 2) // in the circle of radius 2
                            if (islands[y + i][x + j] === 3)
                                forests++;
                            else if (islands[y + i][x + j] === 2)
                                sand++;
                            else
                                other++;
                if (forests > 3 && forests > sand * 3 && selfnumber === 1) {
                    stage[y][x] = 3;
                }
            }
        }
        islands = stage;
    }
    printIsland("Growing forests");
    return islands;
}

function stage10(islands) {
    var length = islands.length;
    ////////////////////////////////////////////
    // TENTH STAGE: Destroying small forests
    ////////////////////////////////////////////
    var stage = islands.clone();
    for (var x = 2; x < length - 2; x++) {
        for (var y = 2; y < length - 2; y++) {
            var selfnumber = islands[y][x];
            var forests = 0;
            var other = 0;
            for (var i = -2; i < 3; i++)
                for (var j = -2; j < 3; j++)
                    if (i * i + j * j <= 2 * 2) // in the circle of radius 2
                        if (islands[y + i][x + j] === 3)
                            forests++;
                        else
                            other++;
            if (forests < 7 && selfnumber === 3) {
                stage[y][x] = 1;
            }
        }
    }
    islands = stage;
    printIsland("Destroying small forests");
    return islands;
}

function stage11(islands) {
    var length = islands.length;
    ////////////////////////////////////////////
    // ELEVENTH STAGE: Planting more small forests
    ////////////////////////////////////////////
    var stage = islands.clone();
    for (var x = 6; x < length - 6; x++) {
        for (var y = 6; y < length - 6; y++) {
            var selfnumber = islands[y][x];
            var other = 0;
            var sand = 0;
            for (var i = -6; i < 7; i++)
                for (var j = -6; j < 7; j++)
                    if (i * i + j * j <= 6 * 6) // in the circle of radius 6
                        if (islands[y + i][x + j] === 2)
                            sand++;
                        else
                            other++;
            if (sand === 0 && selfnumber === 1) {
                stage[y][x] = 4;
            }
        }
    }
    islands = stage;
    printIsland("Adding small forests to island center");
    return islands;
}
function stage12(islands) {
    var length = islands.length;
    ////////////////////////////////////////////
    // TWELFTH STAGE: Adding shallow water
    ////////////////////////////////////////////
    var stage = islands.clone();
    for (var x = 2; x < length - 2; x++) {
        for (var y = 2; y < length - 2; y++) {
            var selfnumber = islands[y][x];
            var water = 0;
            for (var i = -6; i < 7; i++)
                for (var j = -6; j < 7; j++)
                    if (i * i + j * j <= 2 * 2) // in the circle of radius 2
                        if (islands[y + i][x + j] === 0)
                            water++;
            if (water <= 10 && selfnumber === 0) {
                stage[y][x] = 6;
            }
        }
    }
    islands = stage;
    printIsland("Adding small forests to island center");
    return islands;
}
function doStage(stage) {
    currentIslandGrid = stage(currentIslandGrid);
    render();
}
