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
    cookie = {
        "code": "QI5FCX",
        "authcode": "6caf9w0ADYsdVdQ4Rpriw8gSYxVBf4XKnxREeXwBzUMI4hv%2B2J246Fv0Qf%2F4KaCiCDlmvx%2FkBUhFxyf8hW0VDR%2Bra9XLEBwxMbgnkiPf8RvBf2jl4axQhQn91MFBqQA0",
        "domain": "7912760454",
        "is_expire": "0",
        "level_id": "3",
        "mobileid": "006600144366138566201499",
        "stat_isNew": "1",
        "stat_ssid": "1443985627912",
        "stat_uuid": "1443661419711818352746",
        "uid": "4191045",
        "uname": "jike_1325794"
    },
    // querystring.stringify(cookie, '; ', '=')
    headers = {
        "Host" : "www.jikexueyuan.com",
        "Origin": "https://www.jikexueyuan.com",
        "Referer" : "https://www.jikexueyuan.com",
        "User-Agent":"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36",
        //"Cookie": querystring.stringify(cookie, '; ', '='),
        "Cookie": "stat_uuid=1448431777546632295352; _ga=GA1.2.661554090.1447228532; undefined=; bannerswitch=close; Hm_lvt_f3c68d41bda15331608595c98e9c3915=1448358204,1448431668,1448435953,1448946003; Hm_lpvt_f3c68d41bda15331608595c98e9c3915=1448946239; stat_fromWebUrl=; stat_ssid=1449366829307; stat_isNew=0; uname=jike_1325794; uid=4191045; code=QI5FCX; authcode=d234pHXl1TQLbgfXVkoJ5WYt1%2B8JYcjPTVoskh4J9xEsnk9cuYSWkQndSj6mmU%2FwTtrTdk5aodywiZnaWM%2BtQyLZI2vfstQsq8IYOaiDi5jjxpVnUXz6QLygqV%2B%2Fc94r; level_id=3; is_expire=0; domain=7912760454; XSRF-TOKEN=eyJpdiI6Ik0rYXBreFFCOWxOMUZocWtnQUJsOUE9PSIsInZhbHVlIjoiRlp2SkpsTEI4VVVzbUpBTnpnbmdHZnIrNWlsY0QxVStPbEVteU5CWjRyd2NhYVAzaWtINUw5ZmY4TldrclcxNEs0WGdLNkVUNUY3OWhMUVFhV1ArVEE9PSIsIm1hYyI6IjY1ZTgyMTI0OTQ1MmUzZGFkYTNmYjdjODU1M2ZmOWU2ODJjOWRmYzJmY2MzMTU0MjljNmExM2RmZWY4OTc4MjcifQ%3D%3D; laravel_session=eyJpdiI6IjNtcmV4RHo2MEdNb3hyMTJUbzE1WXc9PSIsInZhbHVlIjoiQ2h1ZHZjdTRtT0lVT1V1RTR1QWJpbVlqbjJSck92a1Z1bTlXa0lpU1BpWk5kZFkwYmdiV2hmdGFTTnVqT25JcHgwTmlyOEJLb2RcL3F5elphQ1V1UGxBPT0iLCJtYWMiOiJkZmMxODg2ODg1ZDEwMmIxZDMwODQ5YjhiNmFmOTAxMmE0YWYxZDEyZWUwOGZlMTk5NDMyOWU4MDg2MWUwNjg5In0%3D; QINGCLOUDELB=4ea80fe7e2e6bf485a834777ff16d8bad562b81daa2a899c46d3a1e304c7eb2b|Vl0sb|Vl0pj; Hm_lvt_532e28cc3b6b596b381c569d4e6cd0e4=1448431685,1448431760,1448946061,1448946794; Hm_lpvt_532e28cc3b6b596b381c569d4e6cd0e4=1448946794; MECHAT_LVTime=1448946795548; MECHAT_CKID=cookieVal=006600144533895193666809"
    },

    downloadRes = function(course_id, path, cb){
        ng.get("http://www.jikexueyuan.com/course/downloadRes?course_id=" + course_id, function (data) {
            var jsonData = JSON.parse(data), rex = /\/([a-z0-9_-]+\.\w+)\?download/i;
            if(jsonData.code == 200 && jsonData.data.url ){
                var filename = rex.exec(jsonData.data.url)[1];
                downloadPath(filename, jsonData.data.url, path, cb)
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
                title = $('h1').text().replace(/:|\//g, "-"),
                videolist = $('.video-list h2 a'),
                learnPath = path + '/' + title,
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


