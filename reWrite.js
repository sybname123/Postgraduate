const readline = require('readline');
const fs = require('fs');
// 需要写入翻译的写入页面
const urlList = [
    'productLaunchDetails.vue',
    'sales.vue',
    'productRequirement.vue',
    'productManager.vue',
    'demandPlanning.vue',
    'customertSerivce.vue',
    'bundleSelect.vue',
    'branding.vue',
    'brand.vue',
    'baseInfo.vue',
]

const cache = {}

const rl = readline.createInterface({
    input: fs.createReadStream('./output.csv')
});

rl.on('line', (line) => {
    const Temp = line.split(",");
    if (cache[Temp[3]]) {
        cache[Temp[3]].push(Temp)
    } else {
        cache[Temp[3]] = [Temp]
    }
});

rl.on('close', () => {
    main()
});
//写入部分
function main() {
    for (const key in cache) {
        urlList.forEach(element => {
            if (key.includes(element)) {
                writeFile(key, cache[key])
            }
        });
    }
}

function writeFile(src, array) {
    fs.readFile(src, 'utf-8', function (err, data) {
        if (err) {
            console.log("error", err);
        } else {
            // 清除原来的i18n 块
            const newData = data.replace(/<i18n>([\s\S]+?)<\/i18n>/g, "")
            const i18nText = `<i18n>\n${JSON.stringify(array2obj(array),null, 2)}\n</i18n>\n`
            const writeData = i18nText + newData
            fs.writeFile(src, writeData, {
                encoding: "utf8",
            }, (err1) => {
                if (err1) {
                    console.log("error：src", src);
                }
            })

        }
    });
}


function array2obj(array) {
    const objEN = {};
    const objCN = {};
    array.forEach(
        (item) => {
            item[0] = item[0].replaceAll('^*^',',')
            item[1] = item[1].replaceAll('^*^',',')
            item[2] = item[2].replaceAll('^*^',',')

            objEN[item[0]] = item[1] === '缺少翻译' ? item[0] : item[1];
            objCN[item[0]] = item[2] === '缺少翻译' ? item[0] : item[2];

        }
    )
    return {
        EN: {...objEN},
        CN: {...objCN},
    }
}

// const reWriteInit = () => {
//     rl.on('line', (line) => {
//         const Temp = line.split(",");
//         if (cache[Temp[3]]) {
//             cache[Temp[3]].push(Temp)
//         } else {
//             cache[Temp[3]] = [Temp]
//         }
//     });
    
//     rl.on('close', () => {
//         main()
//     });
// }
// // init()
// module.exports = {
//     reWriteInit
//   };