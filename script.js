var fs = require("fs");
var path = require('path');

// var cacheMap = require("./configMap.js")

/**
 * 遍历文件
 * @param currentDirPath
 * @param callback
 */
function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach(function (dirent) {
        var filePath = path.join(currentDirPath, dirent.name);
        if (dirent.isFile()) {
            callback(filePath, dirent);
        } else if (dirent.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

/**
 * 读取文件
 */
function readFileWithUrl(filePath) {
    fs.readFile(filePath, 'utf-8', function (err, data) {
        if (err) {
            console.log("error");
        } else {
            // console.log(filePath);
            if (filePath == 'src\saaf-common\components\Upload\SaafImageUpload.vue') {
                console.log('---------------->',data);
            }
            const config = regText(data)
            diff(config)
            config.filePath = filePath
            outFile("./out.csv", config)
        }
    });
    // console.log("READ FILE ASYNC END");
}

/**
 * 输出CSV
 */
function outFile(fileName, data) {
    fs.access(fileName, fs.constants.F_OK, (err) => {
        // console.log(`${fileName} ${err ? '不存在' : '存在'}`);
        if (err) {
            fs.appendFileSync(fileName, `代码字段,英文,中文,文件路径\n`)
        }
        if (!err) {
            for (const key in data.all) {

                if (!data.EN[key]) {
                    console.log("异常数据", data)
                }

                const line = `${key.replaceAll(',','^*^')},${data.EN[key].replaceAll(',','^*^')},${data.CN[key].replaceAll(',','^*^')},${data.filePath}\n`

                if (line.split(",").length > 4) {
                    console.error("异常数据",line)
                } else {
                    fs.appendFileSync(fileName, line)
                }

            }
        }
    });


}


/**
 * 正则匹配
 * $t('') $t("")
 * $i18n.t('退出')
 * $i18n.t("退出")
 */
function regText(source) {

    let result = {
        EN: {},
        CN: {},
        all: {},
    }

    // 提取 t('')里的内容
    result.all = regSource(source)

    // 提取 <i18n> 块里的内容
    const temp = regI18n(source)
    if (temp) {
        result.EN = temp.EN || {}
        result.CN = temp.CN || {}
    }
    return result
}


function regSource(source) {
    let result = {}
    const reg = /(\$|\.)t\((\'|\")([^\)\'\"]+)(\'|\")(,([^\)\'\"]+))?\)/gm
    let matchKey
    while (matchKey = reg.exec(source)) {
        result[matchKey[3]] = matchKey[3]
    }
    return result
}

function regI18n(source) {
    const reg = /<i18n>([\s\S]+?)<\/i18n>/gm;
    let match = reg.exec(source)
    if (match && match[1]) {
        return JSON.parse(match[1])
    } else {
        return {
            EN: {},
            CN: {}
        }
    }

}

/**
 * 查找缺少的翻译，补上
 */
function diff(config) {
    for (const key in config.all) {
        if (!config.EN) {
            config.EN = {}
        }
        if (!config.CN) {
            config.CN = {}
        }


        if (!(config.EN && config.EN[key])) {
            config.EN[key] = "缺少翻译"
        }
        if (!(config.CN && config.CN[key])) {
            config.CN[key] = "缺少翻译"
        }
    }
}


walkSync("D:/代码库/saafweb/src/page", (filePath, dirent) => {
    // 只需要vue文件
    if (filePath.endsWith("vue")) {
        readFileWithUrl(filePath)
    }
})
