var app = angular.module('combinedResistorApp', []);

app.controller('ResistorController', function($scope) {
    // Colors data
    $scope.digits = [
        { color: 'black', value: 0 },
        { color: 'brown', value: 1 },
        { color: 'red', value: 2 },
        { color: 'orange', value: 3 },
        { color: 'yellow', value: 4 },
        { color: 'green', value: 5 },
        { color: 'blue', value: 6 },
        { color: 'violet', value: 7 },
        { color: 'grey', value: 8 },
        { color: 'white', value: 9 }
    ];

    $scope.multipliers = [
        { color: 'black', factor: 1 },
        { color: 'brown', factor: 10 },
        { color: 'red', factor: 100 },
        { color: 'orange', factor: 1000 },
        { color: 'yellow', factor: 10000 },
        { color: 'green', factor: 100000 },
        { color: 'blue', factor: 1000000 },
        { color: 'violet', factor: 10000000 },
        { color: 'grey', factor: 100000000 },
        { color: 'white', factor: 1000000000 },
        { color: 'gold', factor: 0.1 },
        { color: 'silver', factor: 0.01 }
    ];

    $scope.tolerances = [
        { color: 'brown', tol: 1 },
        { color: 'red', tol: 2 },
        { color: 'green', tol: 0.5 },
        { color: 'blue', tol: 0.25 },
        { color: 'violet', tol: 0.1 },
        { color: 'grey', tol: 0.05 },
        { color: 'gold', tol: 5 },
        { color: 'silver', tol: 10 }
    ];

    // Defaults for Mode 1
    $scope.band1 = $scope.digits[1];
    $scope.band2 = $scope.digits[0];
    $scope.band3 = $scope.multipliers[1];
    $scope.band4 = $scope.tolerances[6];

    $scope.$watchGroup(['band1', 'band2', 'band3', 'band4'], function() {
        var firstDigit = $scope.band1.value;
        var secondDigit = $scope.band2.value;
        var multiplier = $scope.band3.factor;
        var resistance = ((firstDigit * 10) + secondDigit) * multiplier;
        $scope.calculatedResistance = formatResistance(resistance);
    });

    function formatResistance(value) {
        if (value >= 1000000) {
            return (value/1000000) + " MΩ";
        } else if (value >= 1000) {
            return (value/1000) + " kΩ";
        } else {
            return value + " Ω";
        }
    }

    // Mode 2 calculation
    const digitColors = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];
    const multiplierColors = {
        1: 'black', 10: 'brown', 100: 'red', 1000: 'orange', 10000: 'yellow',
        100000: 'green', 1000000: 'blue', 10000000: 'violet', 100000000: 'grey',
        1000000000: 'white', 0.1: 'gold', 0.01: 'silver'
    };
    const standardE12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

    $scope.calculateColorCode = function() {
        let input = parseFloat($scope.inputResistance);
        if (!input || input <= 0) {
            alert("Enter a valid positive resistance");
            return;
        }

        // Try to find exact match
        let foundExact = false, firstDigit, secondDigit, bestMultiplier;

        for (let multiplier of [1,10,100,1e3,1e4,1e5,1e6,1e7]) {
            let reduced = input / multiplier;
            if (reduced >= 10 && reduced < 100) {
                let approxBase = reduced / 10;
                let roundedBase = Math.round(approxBase * 10) / 10;
                if (standardE12.includes(roundedBase)) {
                    foundExact = true;
                    bestMultiplier = multiplier;
                    let digits = Math.round(roundedBase * 100);
                    firstDigit = Math.floor(digits / 10);
                    secondDigit = digits % 10;
                    $scope.result = {
                        standardValue: input,
                        band1: digitColors[firstDigit],
                        band2: digitColors[secondDigit],
                        band3: multiplierColors[bestMultiplier],
                        band4: 'gold',
                        approx: false
                    };
                    break;
                }
            }
        }

        if (!foundExact) {
            // Find nearest E12
            let minDiff = Infinity, bestMatch = null, bestValue = null;
            for (let multiplier of [1,10,100,1e3,1e4,1e5,1e6,1e7]) {
                for (let base of standardE12) {
                    let val = base * multiplier;
                    let diff = Math.abs(val - input);
                    if (diff < minDiff) {
                        minDiff = diff;
                        bestMatch = base;
                        bestValue = val;
                        bestMultiplier = multiplier;
                    }
                }
            }
            let digits = Math.round(bestMatch * 100);
            firstDigit = Math.floor(digits / 10);
            secondDigit = digits % 10;
            $scope.result = {
                standardValue: bestValue,
                band1: digitColors[firstDigit],
                band2: digitColors[secondDigit],
                band3: multiplierColors[bestMultiplier],
                band4: 'gold',
                approx: true
            };
        }
    };
});
