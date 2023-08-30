const fs = require('fs');
const csv = require('csv-parser');
const fastcsv = require('fast-csv');

function csvTempData() {

  const inputFilePath = 'out.csv'; // 输入文件路径
  const outputFilePath = 'output.csv'; // 输出文件路径

  const readStream = fs.createReadStream(inputFilePath); // 创建读取流

  const writeStream = fs.createWriteStream(outputFilePath); // 创建写入流
  const csvStream = fastcsv.format({ headers: true }); // 创建CSV写入器

  const searchData = []; // 存储满足条件的数据

  csvStream.pipe(writeStream); // 将写入流连接到CSV写入器

  fastcsv.parseStream(readStream, { headers: true }) // 创建CSV解析器并解析读取流
    .on('data', (data) => {
      searchData.push(data);
    })
    .on('end', () => {
      // 对筛选到的数据进行处理
      searchData.forEach((fatherVal,i,ary)=>{
        if (fatherVal['英文'] === '缺少翻译' || fatherVal['中文'] === '缺少翻译') {
          searchData.forEach((sonVal,j,ary)=>{
            if (fatherVal['代码字段'] == sonVal['代码字段'] && ((sonVal['中文'] !== '缺少翻译' || sonVal['英文'] !== '缺少翻译') && (sonVal['代码字段'] !== sonVal['中文'] || sonVal['代码字段'] !== sonVal['英文']))) {
              searchData[i]['英文'] = searchData[j]['英文']
              searchData[i]['中文'] = searchData[j]['中文']
            }
          })
        }
        
      })
      // 将处理后的数据写入CSV文件
      searchData.forEach((data) => {
        csvStream.write(data);
      });

      csvStream.end(); // 结束CSV写入器
    });

  // 监听写入流的`finish`事件
  writeStream.on('finish', () => {
    mergeCsv()
    console.log('Data written to file successfully');
  });

  // 监听写入流的`error`事件
  writeStream.on('error', (error) => {
    console.error('Error writing data to file:', error);
  });

}
function mergeCsv() {
  const newResults = []; // 业务提供翻译
  const oldResults = []; // 代码内部翻译
  const readResult = []; // 翻译
  fs.createReadStream('./diffFile.csv')
  .pipe(csv())
  .on('data', (data) => {
    
    // let values = Object.values(data)
    let keys = Object.keys(data)
    if (keys.length > 4) {
      console.log('表格有误请重新检查表格',keys);
    } else {
      newResults.push(data);
    }
  })
  .on('end', () => {
    fs.createReadStream('./out.csv')
      .pipe(csv())
      .on('data', (data) => {
        // console.log(data);
        oldResults.push(data);
      })
      .on('end', () => {
        newResults.forEach((val, i, ary) => {
          let values = Object.values(val)

          oldResults.forEach((oldVal, j, oldAry) => {
            let oldValues = Object.values(oldVal)
            if (values[3] == oldValues[3]) {
              if (values[0] == oldValues[0]) {
                // let readAry = {}
                Object.assign(oldResults[j], newResults[i])
                
              }
              readResult.push(oldResults[j])
            }
            
          })
        })
        generateCsv(oldResults)
      });
  });
}
function generateCsv(results){
  
  const csvData = [];
  // 添加 CSV 文件的标题行
  // csvData.push(['代码字段', '英文', '中文', '文件路径']);
  
  // 添加 CSV 文件的数据行
  results.forEach((item) => {
    csvData.push([item['代码字段'], item['英文'], item['中文'], item['文件路径']]);
  });
  fastcsv
    .write(csvData, { headers: true })
    .pipe(fs.createWriteStream('IBU.csv'))
    .on('finish', () => console.log('IBU.csv written successfully'));
    // reWriteInit()+
}
csvTempData()
