/**
 * 使用命令
 *  node server [ss] [learn_uuid,...]
 *
 */

var cheerio = require('cheerio'),
    fs = require('fs'),
    pathMode = require('path'),
    querystring = require('querystring'),
    ng = require('nodegrass'),
    http = require('http');


var arguments = process.argv.splice(2);
if (arguments.length < 2) {
    throw new Error('至少需要两个参数，线路与课程ID');
}

var rootPath = process.cwd(),
    learnUrl = 'http://www.jikexueyuan.com/course/',
    ss = arguments[0],
    learn_uuid = arguments.splice(1),
    learn_length = learn_uuid.length,
    learn_index = 0,
    logPath = pathMode.normalize(rootPath + '/download.log'),
    readyDws = (function() {
        var ret = [];
        if (fs.existsSync(logPath)) {
            try {
                ret = JSON.parse(fs.readFileSync(logPath).toString())
            } catch (e) {}
        }

        return ret;
    }());

path = pathMode.normalize(rootPath + '/download'),
    // querystring.stringify(cookie, '; ', '=')
    headers = {
        "Host": "www.jikexueyuan.com",
        "Origin": "https://www.jikexueyuan.com",
        "Referer": "https://www.jikexueyuan.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36",
        "Cookie": "kbtipclose=1; stat_uuid=1448431777546632295352; gr_user_id=c84b4931-bd56-47bd-9040-891aa49d26c0; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22152aba680d7139-0406f258e-424e002e-232800-152aba680d85fa%22%7D; sso_ohterlogin=weixin; abtest=1; undefined=; connect.sid=s%3AMk_h0DkkoQOSrl83PzgJwmOFZ0upuU04.EJfVRXCDggdyZvR3SN6Ruy2EiN4KQcGgLxqay8CoNEU; _gat=1; looyu_id=17fa5c17c4163bc51af3c9c75e3bec8ee5_20001269%3A9; stat_ssid=1473800812467; stat_isNew=0; uname=%E8%8B%A5%E4%B8%B6%E7%9B%B8%E4%BE%9D; uid=4493501; code=3YOIRX; authcode=ce47RBy7ykkZIvTAbRWsqF%2B7gNkaZf%2BgfdgNdpEhjdvcye0GiFPvhvCunAHaNNaZSwlBwNiNB%2B9hVA4I%2F%2B9ef16rEHBCodv8LT2FSIMX%2B8X8FsBHfY%2B2l6x2Uvg9SdYHsOt2lKf6gJLQkfTCqZ%2BOS8u1ARMDn0wu; avatar=http%3A%2F%2Fassets.jikexueyuan.com%2Fuser%2Favtar%2Fdefault.gif; ca_status=0; vip_status=1; level_id=3; is_expire=0; domain=0xqqXjgak; _99_mon=%5B0%2C0%2C0%5D; gr_session_id_aacd01fff9535e79=5dc637f9-b50d-43fb-be32-0f4010d59b20; gr_cs1_5dc637f9-b50d-43fb-be32-0f4010d59b20=uid%3A4493501; Hm_lvt_f3c68d41bda15331608595c98e9c3915=1473243438,1473304445; Hm_lpvt_f3c68d41bda15331608595c98e9c3915=1473304669; _ga=GA1.2.661554090.1447228532; QINGCLOUDELB=7e36c8b37b8339126ed93010ae808701d562b81daa2a899c46d3a1e304c7eb2b|V9DYY|V9DXf; looyu_20001269=v%3A33d0f431e5eec1e17d0880169a34d2f7f9%2Cref%3A%2Cr%3A%2Cmon%3Ahttp%3A//m9104.talk99.cn/monitor%2Cp0%3Ahttp%253A//www.jikexueyuan.com/"
    },

    downloadRes = function(course_id, path, cb) {
        ng.get("http://www.jikexueyuan.com/course/downloadRes?course_id=" + course_id, function(data) {
            var jsonData = JSON.parse(data),
                rex = /file\/([\w\W]+\.\w+)\?download/i;
            if (jsonData.code == 200 && jsonData.data.url) {
                var filename = rex.exec(jsonData.data.url)[1];
                downloadPath(filename, jsonData.data.url, path, cb)
            } else {
                cb(false);
            }
        }, headers, 'utf-8');
    },
    downloadPath = function(filename, url, path, cb) {
        var filepath = path + "/" + filename;
        if (fs.existsSync(filepath)) {
            cb(1);
            return;
        }
        if (url) {
            try {
                http.get(url, function(res) {
                    if (res.statusCode == 302) {
                        downloadPath(filename, res.headers.location, path, cb);
                    } else {
                        var fileData = "";
                        res.setEncoding("binary");

                        console.log("正在下载" + filename + '~~');

                        try {
                            res.on("data", function(chunk) {
                                fileData += chunk;
                            });

                            res.on("end", function() {
                                fs.writeFile(filepath, fileData, "binary", function(err) {
                                    if (err) {
                                        console.log(filename + '下载失败~~');
                                    } else {
                                        console.log(filename + '下载成功~~');
                                    }
                                    cb(1);
                                });
                            });
                        } catch (e) {};

                        res.on("error", function() {
                            console.log('download fail!');
                            cb(0);
                        });
                    }

                });
            } catch (e) {
                downloadPath(filename, url, path, cb);
            }
        } else {
            console.log("下载地址错误:" + url);
        }


    };


var learn_uuids = [];
learn_uuid.forEach(function(v, i) {
    if (readyDws.indexOf(v) == -1) {
        learn_uuids.push(v);
    }
});

learn_length = learn_uuids.length;

if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
}

console.log('course start download~~');
(function() {
    var arg = arguments;

    if (learn_index < learn_length) {

        console.log("course id:" + learn_uuids[learn_index]);

        ng.get(learnUrl + learn_uuids[learn_index] + ".html?ss=" + ss, function(data) {

            var $ = cheerio.load(data),
                title = $('.lesson-teacher h2').text().replace(/[^\u4e00-\u9fa5\w-\s]/g, "-"),
                videolist = $('.video-list h2 a'),
                learnPath = path + '/' + learn_uuids[learn_index] + '-' + title,
                videoLength = videolist.length,
                videoIndex = 0,
                filename,
                downUrl;

            if (!fs.existsSync(learnPath)) {
                fs.mkdirSync(learnPath);
            }

            (function() {
                var arg2 = arguments;
                if (videoIndex < videoLength) {

                    var video = videolist.eq(videoIndex);

                    if (videoIndex > 0) {
                        url = video.attr('href');
                        filename = (videoIndex + 1) + "." + video.text() + ".mp4";
                        ng.get(url, function(data2) {
                            var $$ = cheerio.load(data2);
                            downUrl = $$('source').attr('src');
                            console.log(filename, downUrl);
                            downloadPath(filename, downUrl, learnPath, function(status) {
                                console.log(filename + "course complete download~~");
                                videoIndex++;
                                arg2.callee();
                            });
                        }, headers, 'utf-8');

                    } else {
                        filename = (videoIndex + 1) + "." + video.text() + ".mp4";
                        downUrl = $('source').attr('src');
                        console.log(filename, downUrl);
                        downloadPath(filename, downUrl, learnPath, function(status) {
                            console.log(filename + "course complete download~~");
                            videoIndex++;
                            arg2.callee();
                        });
                    }
                } else {
                    console.log(title + "course complete download~~");
                    console.log(title + "，配课资料开始下载~~");
                    downloadRes(learn_uuids[learn_index], learnPath, function(success) {
                        if (success) {
                            console.log(title + "，配课资料下载成功~~");
                        } else {
                            console.log(title + "，配课资料下载失败~~");
                        }
                        readyDws.push(learn_uuids[learn_index]);
                        fs.writeFileSync(logPath, JSON.stringify(readyDws));
                        learn_index++;
                        arg.callee();
                    });

                }
            }());

        }, headers, 'utf-8');
    } else {
        console.log('course complete download~~');
    }
}());