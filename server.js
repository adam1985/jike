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
if( arguments.length < 2 ){
    throw new Error('至少需要两个参数，线路与课程ID');
}

var rootPath = process.cwd(),
    learnUrl = 'http://www.jikexueyuan.com/course/',
    ss = arguments[0],
    learn_uuid = arguments.splice(1),
    learn_length = learn_uuid.length,
    learn_index = 0,
    logPath = pathMode.normalize( rootPath + '/download.log' ),
    readyDws = (function(){
        var ret = [];
        if( fs.existsSync(logPath) ){
            try{
                ret = JSON.parse(fs.readFileSync(logPath).toString())
            }catch(e){}
        }
            
        return ret;
    }());

    path = pathMode.normalize( rootPath + '/download' ),
    // querystring.stringify(cookie, '; ', '=')
    headers = {
        "Host" : "www.jikexueyuan.com",
        "Origin": "https://www.jikexueyuan.com",
        "Referer" : "https://www.jikexueyuan.com",
        "User-Agent":"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36",
        "Cookie": "stat_uuid=1448431777546632295352; stat_fromWebUrl=; stat_ssid=1451650049855; _gat=1; uname=jike_1325794; uid=4191045; code=QI5FCX; authcode=95d6Q3NyuxgRTFmcd7B5x%2BM2TOYgZtka1PSAHsMI7krEG2ameV5BSfRXI0hafrSYSHMXS4LCdgt03ccwRkNycKJj2qD%2BhAjA8GPyTiMwPHqVdDSCTeAQ0SjROQmpP5OG; level_id=3; is_expire=0; domain=7912760454; bannerswitch=close; QINGCLOUDELB=1bb571da02dcd2ad08ff904df3dac9a3d562b81daa2a899c46d3a1e304c7eb2b|Vndit|Vndir; XSRF-TOKEN=eyJpdiI6InVDbTNaNlBEanV6VytJY3Y0ZEJiU0E9PSIsInZhbHVlIjoiSW9RWVlvMFdzZHN4TE1oN21aYUJZWHdYWTB4KzBLQzFCXC9vVXFub2FRVzRYeWJmb1BmWEt0M1BJMEFrVVhoeHB1QmlmcDk4bUdMVHFldVg4TUpzalVRPT0iLCJtYWMiOiJmNDI4NjViYWJiODI4ZGI2OWE0Mjc5MGQ4NGQwOTkyM2EyNTM1MzFkMDhjNjljNGRhYTA2MmM2ZDhiN2RiZjRjIn0%3D; laravel_session=eyJpdiI6IkN3TVlqZzZyZlNIdnZFcTlTTGJSXC9BPT0iLCJ2YWx1ZSI6Ikc5ZU5vTGc0V3BoQ0QzRUgwYTREQkcyK0c1OGZHRTJ2azFGenZtWE8xaGxLT3U2MVI0UEtqeVV1RkhZeFE3XC9NVUhjR0k2c0tkYit1aFpmN1wvSUV2dkE9PSIsIm1hYyI6IjBkM2JkMWQ5NjI3ZTFiYTM5ZTYwMGRlMWEwNjRmYTNlNjUyYTczZmEyZTVmNDljNzlmMGE1NzgzNGVkNTljNmYifQ%3D%3D; Hm_lvt_532e28cc3b6b596b381c569d4e6cd0e4=1450166914,1450167116,1450167363,1450664620; Hm_lpvt_532e28cc3b6b596b381c569d4e6cd0e4=1450664627; Hm_lvt_f3c68d41bda15331608595c98e9c3915=1449733790,1449819994,1450166887,1450664535; Hm_lpvt_f3c68d41bda15331608595c98e9c3915=1450664637; _ga=GA1.2.661554090.1447228532; undefined=; stat_isNew=0; MECHAT_LVTime=1450664637320; MECHAT_CKID=cookieVal=006600144533895193666809"
    },

    downloadRes = function(course_id, path, cb){
        ng.get("http://www.jikexueyuan.com/course/downloadRes?course_id=" + course_id, function (data) {
            var jsonData = JSON.parse(data), rex = /file\/([\w\W]+\.\w+)\?download/i;
            if(jsonData.code == 200 && jsonData.data.url ){
                var filename = rex.exec(jsonData.data.url)[1];
                downloadPath(filename, jsonData.data.url, path, cb)
            } else {
                cb(false);
            }
        }, headers, 'utf-8');
    },
    downloadPath = function(filename, url, path, cb){
        var filepath =  path + "/" + filename;
        if( fs.existsSync( filepath ) ){
            cb(1);
            return;
        }
        if(url){
            try{
                http.get(url, function(res){
                    if( res.statusCode == 302){
                        downloadPath(filename, res.headers.location, path, cb);
                    } else {
                        var fileData = "";
                        res.setEncoding("binary"); 

                        console.log("正在下载" + filename + '~~');

                        try{
                            res.on("data", function(chunk){
                                fileData += chunk;
                            });

                            res.on("end", function(){
                                fs.writeFile(filepath, fileData, "binary", function(err){
                                    if(err){
                                        console.log(filename + '下载失败~~');
                                    } else {
                                        console.log(filename + '下载成功~~');
                                    }
                                    cb(1);
                                });
                            });
                        }catch(e){};
                        
                        res.on("error", function(){
                            console.log('download fail!');
                            cb(0);
                        });
                    }

                });
            }catch(e){
                downloadPath(filename, url, path, cb);
            }
        } else {
            console.log("下载地址错误:"+url);
        }


    };

    
    var learn_uuids = [];
    learn_uuid.forEach(function(v, i){
        if(readyDws.indexOf(v) == -1){
        	learn_uuids.push(v);
        }
    });

    learn_length = learn_uuids.length;
    
   if( !fs.existsSync(path) ){
        fs.mkdirSync(path);
   }

   console.log('course start download~~');
    (function(){
        var arg = arguments;
        
        if( learn_index < learn_length){

        	console.log("course id:" +learn_uuids[learn_index]);
            
            ng.get(learnUrl + learn_uuids[learn_index] + ".html?ss=" + ss, function (data) {
                
                var $ = cheerio.load(data),
                title = $('h1').text().replace(/[^\u4e00-\u9fa5\w-\s]/g, "-"),
                videolist = $('.video-list h2 a'),
                learnPath = path + '/' + learn_uuids[learn_index] + '-' + title,
                videoLength = videolist.length,
                videoIndex = 0,
                filename,
                downUrl;

                if( !fs.existsSync(learnPath) ){
                     fs.mkdirSync(learnPath);
                }

                (function(){
                    var arg2 = arguments;
                    if(videoIndex < videoLength){
                        
                        var video = videolist.eq(videoIndex);
                        
                        if(videoIndex > 0){
                            url = video.attr('href');
                            filename = (videoIndex + 1 ) + "." + video.text() + ".mp4";
                            ng.get(url, function (data2) {
                                var $$ = cheerio.load(data2);
                                downUrl = $$('source').attr('src');
                                console.log(filename, downUrl);
                                downloadPath(filename, downUrl, learnPath , function(status){
                                    console.log(filename+"course complete download~~");
                                    videoIndex++;
                                    arg2.callee();
                                });
                            }, headers, 'utf-8');

                        } else {
                                filename = (videoIndex + 1 ) + "." + video.text() + ".mp4";
                                downUrl = $('source').attr('src');
                                console.log(filename, downUrl);
                                downloadPath(filename, downUrl, learnPath, function(status){
                                    console.log(filename+"course complete download~~");
                                    videoIndex++;
                                    arg2.callee();
                                });
                        }
                    } else {
                        console.log(title+"course complete download~~");
                        console.log(title + "，配课资料开始下载~~");
                        downloadRes(learn_uuids[learn_index], learnPath, function(success){
                            if(success){
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


