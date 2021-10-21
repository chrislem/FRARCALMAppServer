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
        var wFile = XLSX.readFile(excelfile);
        var sheetsFile = getSheetNames(wFile);
        
        sheetsFile.forEach((sheetname) => {
            var data = XLSX.utils.sheet_to_csv(wFile.Sheets[sheetname], { FS:"\t"})
            fs.writeFileSync(destFolder+"/"+sheetname+".almGenericFile", data);

        });



    }


}




  module.exports = {
    checkFileWithTemplate,
    extractFilesFromExcelWithTemplate
  };