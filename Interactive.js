let interactChart = document.getElementById('interact').getContext('2d');
let InteractChart = new Chart(interactChart);
function chart(){
  InteractChart.destroy();
  interactChart = document.getElementById('interact').getContext('2d');
  //convert dictionary key and values to arrays
  var dictKeys = [];
  var dictValues = [];


  for (var i = 0; i < sort.length; i++) {
      dictKeys.push(sort[i][0]);
      dictValues.push(sort[i][1]);
  }

  // console.log(vendorQuickStats);
  // console.log(dictKeys);
  // console.log(dictValues);

  var colors = [];
  console.log(dictKeys.length);
  for( i = 0; i < dictKeys.length; ++i ){
    colors.push('#FFFFFF');
  }

  // Global Options
  Chart.defaults.global.defaultFontFamily = 'Ubuntu';
  Chart.defaults.global.defaultFontSize = 18;
  Chart.defaults.global.defaultFontColor = '#FFFFFF';

  InteractChart = new Chart(interactChart, {
    type:'horizontalBar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
    data:{
      labels: dictKeys,
      datasets:[{
        label:'Interactive',
        data: dictValues,
        backgroundColor: colors,
        hoverBorderWidth: 0,
        hoverBorderColor:'#FFFFFF'
      }]
    },
    options:{
      title:{
        display:true,
        text:'Interactive',
        fontSize:16
      },
      legend:{
        display: false,
        position:'right',
        alight: 'center',
        labels:{
          fontColor: "#FFFFFF"
        }
      },
      layout:{
        padding:{
          left:0,
          right:0,
          bottom:0,
          top:0
        }
      },
      tooltips:{
        enabled:true
      },
      animation: {
        duration: 0
    },
    scales: {
      xAxes: [{
        ticks: {
          suggestedMin: -15,
          suggestedMax: 15
      }
      }]
  }
    }
  });
}

var vendorQuickStats = JSON.parse(sessionStorage.getItem("vendorQuickStats"));
// console.log(vendorQuickStats);

var vendorAvg = JSON.parse(sessionStorage.getItem("vendorAvg"));
// console.log(vendorAvg);

var vendorStd = JSON.parse(sessionStorage.getItem("vendorStd"));
// console.log(vendorStd);

var sort = [];
var algorithm = {};
var daysWeight = 5;
var qualityWeight = 5;
var costWeight = 5;
var sortedVendors = [];

// creates dictionary to calculate the values
function calculateVendors(){
  for(var key in vendorQuickStats) {
    if (key.length == 1) {
      temp0 = vendorQuickStats[key][2];
      temp1 = vendorQuickStats[key][3];
      temp2 = vendorQuickStats[key][4];
      
      var tempAlg = (daysWeight * (temp1 - vendorAvg[3])/vendorStd[3]) + (qualityWeight * (temp0 - vendorAvg[2])/vendorStd[2]) + (costWeight * (temp2 - vendorAvg[4])/vendorStd[4]);
      algorithm[key] = tempAlg;
    }
  }
  // console.log(algorithm);
  // console.log(daysWeight);
  // console.log(qualityWeight);
  // console.log(costWeight);
  
}

function printSortedVendors(){
  sort = []
  sortedVendors = [];
  for( key in algorithm){
    sort.push( [key, algorithm[key]] );
  }
  sort.sort(function compare(kv1, kv2) {
    return kv1[1] - kv2[1]
  })
  
  // console.log(sort);

  for (var i = 0; i < sort.length; i++) {
    sortedVendors.push(sort[i][0]);
  }
  
}

calculateVendors();
printSortedVendors();

function accountsRecievableSlider1(AR) {
    document.querySelector('#daysInAR1').value = AR;
    daysWeight = document.querySelector('#daysInAR1').value
    calculateVendors();
    printSortedVendors();
    chart();
    document.getElementById("myText").innerHTML = sortedVendors;
}
function accountsRecievableSlider2(AR) {
  document.querySelector('#daysInAR2').value = AR;
  qualityWeight = document.querySelector('#daysInAR2').value
  calculateVendors();
  printSortedVendors();
  chart();
  document.getElementById("myText").innerHTML = sortedVendors;
}
function accountsRecievableSlider3(AR) {
  document.querySelector('#daysInAR3').value = AR;
  costWeight = document.querySelector('#daysInAR3').value
  calculateVendors();
  printSortedVendors();
  chart();
  document.getElementById("myText").innerHTML = sortedVendors;
}
