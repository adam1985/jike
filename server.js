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
        "Cookie": "stat_uuid=1443680969816101767455; code=QI5FCX; level_id=3; is_expire=0; domain=7912760454; Hm_lvt_f3c68d41bda15331608595c98e9c3915=1443621917,1443622606,1443660574,1444092125; _ga=GA1.2.988074457.1443680990; undefined=; connect.sid=s%3AcqQor_DrJ9OyPRPGxsEWMCVWlgBs75Se.GNfjpgpwhuTE%2FU69vlANfGLQ8QfALxrhxKOborfS8%2Fo; QINGCLOUDELB=37e16e60f0cd051b754b0acf9bdfd4b5d562b81daa2a899c46d3a1e304c7eb2b|VhMaE|VhMYv; Hm_lpvt_f3c68d41bda15331608595c98e9c3915=1444092461; _gat=1; MECHAT_LVTime=1444092461576; MECHAT_CKID=cookieVal=006600144368096075457246; stat_fromWebUrl=; stat_ssid=1444334905956; stat_isNew=0; uname=jike_1325794; uid=4191045; authcode=7d36Tc77U2I6%2F9vdZSOZzcrjvs6x%2FpW1CAljwAYpqiHhEeVngzHM8cC4u9XsDfqwcpJ3B0LlbuRQlqyWTSyyfqp%2BPZgs4RP9Wac5ysiLS%2BKLbYnVrdutfWQIwpj65pLf"
    },
    downloadPath = function(filename, url, Path, cb){
        if(url){
            try{
                http.get(url, function(res){
                    if( res.statusCode == 302){
                        downloadPath(filename, res.headers.location, Path, cb);
                    } else {
                        var fileData = "";
                        res.setEncoding("binary"); 

                        console.log("正在下载" + filename + '~~');

                        try{
                            res.on("data", function(chunk){
                                fileData += chunk;
                            });

                            res.on("end", function(){
                                fs.writeFile(Path, fileData, "binary", function(err){
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
                downloadPath(filename, url, Path, cb);
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
                            filename = video.text();
                            ng.get(url, function (data2) {
                                var $$ = cheerio.load(data2);
                                downUrl = $$('source').attr('src');
                                console.log(filename, downUrl);
                                downloadPath(filename, downUrl, learnPath + '/' + filename + ".mp4", function(status){
                                    console.log(filename+"course complete download~~");
                                    videoIndex++;
                                    arg2.callee();
                                });
                            }, headers, 'utf-8');

                        } else {
                                filename = video.text();
                                downUrl = $('source').attr('src');
                                console.log(filename, downUrl);
                                downloadPath(filename, downUrl, learnPath + '/' + filename + ".mp4", function(status){
                                    console.log(filename+"course complete download~~");
                                    videoIndex++;
                                    arg2.callee();
                                });
                        }
                    } else {
                        console.log(title+"course complete download~~");
                        readyDws.push(learn_uuids[learn_index]);
                        fs.writeFileSync(logPath, JSON.stringify(readyDws));
                        learn_index++;
                        arg.callee();
                    }
                }());

            }, headers, 'utf-8');
        } else {
            console.log('course complete download~~');
        }
    }());


