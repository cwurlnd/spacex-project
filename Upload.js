$("#input").on("change", function (e) {
    var file = e.target.files[0];
    // input canceled, return
    if (!file) return;
    
    var FR = new FileReader();

    FR.onload = function(e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, {type: 'array'});
        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // header: 1 instructs xlsx to create an 'array of arrays'
        var result = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // // data preview
        // var output = document.getElementById('result');
        // output.innerHTML = JSON.stringify(result, null, 2);

        // dictionary of array of arrays
        // Lotsize info: total
        // Quality info: number of nonconforming, number of failure down the road
        // Time: days late, count
        // Cost info: Lotsize * (percentage)
        var vendorQuickInfo = {};
        var excelArray = [];

        for( var key in result ) {
            if( result.hasOwnProperty(key) ) {
                // val is every row in the 
                var val = result[key];
                excelArray.push(val);
                // if vendor hasnt been accounted for, make array
                if( !(val[0] in vendorQuickInfo) ){
                    info = [ parseInt(val[2]) , [ val[3], val[4] ], [ val[1], 1 ], parseInt(val[2]) * (parseFloat(val[5])) ];
                    vendorQuickInfo[ val[0] ] = info;
                }
                else{
                        // lotsize
                        vendorQuickInfo[val[0]][0] += parseInt(val[2]);
                        // quality
                        vendorQuickInfo[val[0]][1][0] += val[3];
                        vendorQuickInfo[val[0]][1][1] += val[4];
                        // time
                        vendorQuickInfo[val[0]][2][0] += val[1];
                        vendorQuickInfo[val[0]][2][1] += 1;
                        // cost
                        vendorQuickInfo[val[0]][3] += parseInt(val[2]) * (parseFloat(val[5]));
                }

                // console.log(val);
            }
        }

        console.log(vendorQuickInfo);
        console.log("excelArray")
        console.log(excelArray);

        // quick stats are 
        vendorQuickStats = {};
        vendorLotsize = 0;
        vendorNon = 0;
        vendorFail = 0;
        vendorTime = 0;
        vendorLen = 0;
        vendorCost = 0;

        for ( key in vendorQuickInfo ){
            stats = [ 0, 0, 0, 0, 0 ];
            // lot total
            stats[0] = vendorQuickInfo[key][0];
            // average quality
            stats[1] = vendorQuickInfo[key][1][0] / stats[0];
            stats[2] = vendorQuickInfo[key][1][1] / stats[0];
            // average time
            stats[3] = vendorQuickInfo[key][2][0] / vendorQuickInfo[key][2][1];
            //average cost
            stats[4] = vendorQuickInfo[key][3] / stats[0];

            // check if it is the weird row
            if ( !isNaN(vendorQuickInfo[key][0]) ){
                vendorLotsize += parseFloat(vendorQuickInfo[key][0]);
                vendorNon += parseFloat(vendorQuickInfo[key][1][0]);
                vendorFail += parseFloat(vendorQuickInfo[key][1][1]);
                vendorTime += parseFloat(vendorQuickInfo[key][2][0]);
                vendorLen += parseFloat(vendorQuickInfo[key][2][1]);
                vendorCost += parseFloat(vendorQuickInfo[key][3]);
            }

            vendorQuickStats[key] = stats;

        }
        
        vendorAvg = [ 0, 0, 0, 0, 0 ];
        vendorAvg[0] = vendorLotsize;
        vendorAvg[1] = vendorNon / vendorLotsize;
        vendorAvg[2] = vendorFail / vendorLotsize;
        vendorAvg[3] = vendorTime / vendorLen;
        vendorAvg[4] = vendorCost / vendorLotsize;
        
        var tablestats = [];
        for( key in vendorQuickStats ){
            var row = {"Vendor": key,
                         "Days Past Po": vendorQuickStats[key][3], 
                         "Lotsize": vendorQuickStats[key][0], 
                         "Nonconforming Units": vendorQuickStats[key][1], 
                         "Units that resulted failure downstream": vendorQuickStats[key][2],
                          "Cost (delta % from target)": vendorQuickStats[key][4]
                        };
            tablestats.push(row);
        }
        tablestats.shift();

        stdNon = 0;
        stdFail = 0;
        stdTime = 0;
        stdCost = 0;
        count = 0;

        first  = 0;
        // get standard deviation
        for( i = 0; i < excelArray.length; ++i ){
            // skip header
            if(first == 0){
                first = 1;
            }
            else{
                stdNon += Math.pow(excelArray[i][3]/excelArray[i][2] - vendorAvg[2], 2);
                stdFail += Math.pow(excelArray[i][4]/excelArray[i][2] - vendorAvg[2], 2);
                stdTime += Math.pow(excelArray[i][1] - vendorAvg[3], 2);
                stdCost += Math.pow(excelArray[i][5] - vendorAvg[4], 2);
                count ++;
            }
        }
        console.log("check");
        console.log(stdNon);
        count --;
        stdNon = Math.sqrt(stdNon/count);
        stdFail = Math.sqrt(stdFail/count);
        stdTime = Math.sqrt(stdTime/count);
        stdCost = Math.sqrt(stdCost/count);
        
        vendorStd = [count, stdNon, stdFail, stdTime, stdCost];

        // Get a reference to the table
        let tableRef = document.getElementById("tabledata");

        var tablehtml = '';
        // create rows
        for( let vendor of tablestats ){
            tablehtml+= '<tr>'; 
            tablehtml+= '<td>';
            tablehtml+= " ";
            tablehtml+= '</td>';
            for( key in vendor ){
                tablehtml+= '<td>';
                if(isNaN(vendor[key])){
                    tablehtml+= vendor[key];
                }
                else{
                    tablehtml+= Math.round(1000*vendor[key])/1000;
                }
                tablehtml+= '</td>';
            }
            tablehtml+= '</tr>';
        }
        // Append a text node to the cell
        tableRef.innerHTML = tablehtml;

        
        console.log(vendorQuickStats);
        console.log(tablestats);
        console.log(vendorAvg)
        sessionStorage.setItem("vendorQuickStats", JSON.stringify(vendorQuickStats));
        sessionStorage.setItem("vendorAvg", JSON.stringify(vendorAvg));
        sessionStorage.setItem("vendorStd", JSON.stringify(vendorStd));
        

    };

    FR.readAsArrayBuffer(file);    

});