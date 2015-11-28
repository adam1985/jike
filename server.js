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
        "Cookie": "lianbo=yes; stat_uuid=1445845156817839678469; CNZZDATA5889659=cnzz_eid%3D432765354-1448164358-http%253A%252F%252Fbzclk.baidu.com%252F%26ntime%3D1448164358; JXM703471=1; lzstat_uv=33914167892320931350|2994045; bannerswitch=close; stat_fromWebUrl=; uname=jike_1325794; uid=4191045; code=QI5FCX; authcode=a306LU0AsUjlbU6aygeOnM%2F2qj9UIcq4Ijy%2B3uH9EcPaoPxf4Km9fjpg2muc%2BaQttMApg2oJ1%2BwDflLFK1P9i%2FAJq4FxSE7S2DwML50MODcrFhd%2FKEr4gLUCXRxd4Psm; level_id=3; is_expire=0; domain=7912760454; Hm_lvt_f3c68d41bda15331608595c98e9c3915=1447217107,1448676234; Hm_lpvt_f3c68d41bda15331608595c98e9c3915=1448681577; _ga=GA1.2.62326505.1445845445; undefined=; stat_isNew=0; connect.sid=s%3A-S5BHbc5sO7vx5ghfwoW8yJUBjyTINnI.%2FC4YL%2FrWjbFBLVnAu5dZHO%2FGmaiHgCkgoD1HQFpRqBA; QINGCLOUDELB=84b10773c6746376c2c7ad1fac354ddfd562b81daa2a899c46d3a1e304c7eb2b|Vllgy|Vllcu"
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


