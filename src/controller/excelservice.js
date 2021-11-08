const config = require('../../resources/config/config.json');
var XLSX = require('xlsx');
const fs = require("fs");

function getSheetNames(workbook){

    var sheet_name_listTemplate = workbook.SheetNames;

    const index = sheet_name_listTemplate.indexOf("LOV");
    if (index > -1) {
        sheet_name_listTemplate.splice(index, 1);
    }
    return sheet_name_listTemplate;
}

function getRowCount(worksheet){
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    var num_rows = range.e.r - range.s.r + 1;
    return num_rows;
}

function getHeader(worksheet){
    var headers = [];
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    var C, R = range.s.r; /* start in the first row */
    /* walk every column in the range */
    for(C = range.s.c; C <= range.e.c; ++C) {
        var cell = worksheet[XLSX.utils.encode_cell({c:C, r:R})] /* find the cell in the first row */

        var hdr = "UNKNOWN " + C; // <-- replace with your desired default 
        if(cell && cell.t) hdr = XLSX.utils.format_cell(cell);

        headers.push(hdr);
    }
    return headers;    
}



function checkFileWithTemplate(excelfile, templatefile){
    var res = {};

    //Read template 
    var wTemplate = XLSX.readFile(templatefile);
    var wFile = XLSX.readFile(excelfile);

    var sheetsTemplate = getSheetNames(wTemplate);
    var sheetsFile = getSheetNames(wFile);

    var okToExtract = true;

    console.log(sheetsTemplate)
    console.log(sheetsFile)

    sheetsFile.forEach((sheetname) => {
        const index = sheetsTemplate.indexOf(sheetname);
        if (index == -1) {
            okToExtract = false;
            console.log("cannot find sheet:"+sheetname)
        }

      });

      if(okToExtract == true){
        //Compare if the headers are OK
        sheetsFile.forEach((sheetname) => {
            theSheet = wFile.Sheets[sheetname];
            theTemplateSheet = wTemplate.Sheets[sheetname];

            theHeaders = getHeader(theSheet);
            theHeadersTemplate = getHeader(theTemplateSheet);
            theHeaders.forEach((header) => {
                const index = theHeadersTemplate.indexOf(header);
                if (index == -1) {
                    okToExtract = false;
                console.log("cannot find column:"+header)
                }
        
              });
        });
    }

    if(okToExtract)
        console.log("Extract OK")
    else 
        console.log("Extract KO")

    return okToExtract;
  
}

function extractFilesFromExcelWithTemplate(destFolder, excelfile, templatefile){
    var okToExtract = checkFileWithTemplate(excelfile, templatefile );

    if(okToExtract){
        //Retrieve the list of worksheet
        //var wFile = XLSX.read(binary, {type:'binary', cellDates:true, cellNF: false, cellText:false});
        var wFile = XLSX.readFile(excelfile, {type:'binary', cellDates:true, cellNF: false, cellText:false});
        var sheetsFile = getSheetNames(wFile);
        
        sheetsFile.forEach((sheetname) => {

            /* console.log("-------------------");
            var worksheet = wFile.Sheets[sheetname];
            var headers = getHeader(worksheet);
            var rowcount = getRowCount(worksheet);
            var separator = "\t";
            console.log("excelfile:"+excelfile);
            console.log("header:"+headers);
            console.log("rowcount:"+rowcount);

            for(row = 1; row < rowcount; row++){
                var line = "";
                for(col = 0; col < headers.length; col++){
                    var cell_address = { c: col, r: row };
                    var data = XLSX.utils.encode_cell(cell_address);
                    //console.log("data:"+data)
                    var val = worksheet[data];
                    //console.log("header:"+headers[col])
                    if(val && val.v && val.v !== 'undefined' ){
                        console.log("val"+val.v)
                        console.log("val"+val.t)
                        console.log("val"+val.z)
                        console.log("val"+val.w)
                        if((val.t === 'd' || val.t === 'n') && val.t !== 'undefined' ){
                            val.z = 'dd/mm/yyyy';
                            
                        }  
                        
                        line = line + val.w;
                    if(col < headers.length-1)
                    line = line + separator;
                }
                
                }
                console.log("theline:"+line)
            }      */    


            var data = XLSX.utils.sheet_to_csv(wFile.Sheets[sheetname], { FS:"\t",
                                                                        blankrows: false,
                                                                        dateNF:'dd/mm/yyyy',
                                                                        skipHidden:true})
            fs.writeFileSync(destFolder+"/"+sheetname+".almGenericFile", data);

        });



    }


}


function getDistinctValues(filepath, tab, fields, separator)
{
    var res = [];

    var wFile = XLSX.readFile(filepath);

    console.log("Filepath:"+filepath)
    console.log("tab:"+tab)
    theSheet = wFile.Sheets[tab];
    theHeaders = getHeader(theSheet);
    console.log("theHeaders:"+theHeaders)
    var pos = [];
    var distinctvalues = [];

    rowcount = getRowCount(theSheet);

    fields.forEach((field) => {
        const index = theHeaders.indexOf(field)

        console.log("Field: "+ field + " - index: "+index)
        if( index < 0)
            throw "Cannot find index for distinct values"
        
        pos.push(index)
    });


    for(row = 1; row < rowcount; row++){
        var theres = "";
        for(col = 0; col < pos.length; col++){
            var cell_address = { c: pos[col], r: row };
            var data = XLSX.utils.encode_cell(cell_address);
            //console.log("data:"+data)
            var val = theSheet[data];
            if(val && val.v && val.v !== 'undefined' ){
            theres = theres + val.v;
            if(col < pos.length-1)
                theres = theres + separator;}
        }
        //console.log("the res"+theres)
        if(theres != "")
            distinctvalues.push(theres);
    }
    const uniqueString = [...new Set(distinctvalues)];
    //console.log("full list"+ uniqueString);

    return uniqueString;

}


  module.exports = {
    checkFileWithTemplate,
    extractFilesFromExcelWithTemplate,
    getDistinctValues
  };