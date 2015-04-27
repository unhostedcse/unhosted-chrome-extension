
var socketId;
var count = 0;
var currentResponse;
var command;
var sendResponseBack;
var tcp_sockets = new Array();
var conID;
var server;

var t1, t2;

function TCP_Socket(socket, id) {
    this.socket = socket;
    this.conId = id;
}

chrome.sockets.tcp.onReceive.addListener(onReceive);
chrome.sockets.tcp.onReceiveError.addListener(onReceiveError);

chrome.runtime.onMessageExternal.addListener(
        function(request, sender, sendResponse)
        {
            this.command = request.command;
            sendResponseBack = sendResponse;
            console.log(request.actionEvt);	
	    if (request.actionEvt == "test_connect") {
		sendResponse({message:"test_connect_pass",id:0});
		return;
	    }
	
            this.command = JSON.parse(this.command);

            this.request=request;
            server=request;
            //this.ssl = request.settings	

            console.log(request.actionEvt);
            console.log(request.conID);
            conID = JSON.parse(request.conID);

            if (!tcp_sockets[conID]) {
                chrome.sockets.tcp.create({}, function(createInfo) {
                    socketId = createInfo.socketId;
                    console.log(socketId);
                    tcp_sockets[conID] = new TCP_Socket(socketId, conID);
                    console.log("length: " + tcp_sockets.length);
                    //console.log(tcp_sockets[conID].socket);  		

                    if (request.actionEvt == "connect") {
                        var connectObj = JSON.parse(request.settings);
                        var host = connectObj.host;
                        var port = parseInt(connectObj.port);
                        var ssl = connectObj.sec;
                        console.log(host);
                        console.log(port);

                        console.log("tcp_sockets conID: " + tcp_sockets[conID].socket);
                        chrome.sockets.tcp.setPaused(tcp_sockets[conID].socket, true, function() {
                            chrome.sockets.tcp.connect(tcp_sockets[conID].socket, host, port, function() {
                                var secureOptions = {
                                    tlsVersion: {min: "ssl3", max: "tls1.2"}
                                };
                                if (ssl == "ssl") {
                                    chrome.sockets.tcp.secure(tcp_sockets[conID].socket, secureOptions, function() {
                                        //chrome.sockets.tcp.onReceive.addListener(onReceive);
                                        //chrome.sockets.tcp.onReceiveError.addListener(onReceiveError);
                                        chrome.sockets.tcp.setPaused(tcp_sockets[conID].socket, false);
                                    });
                                } else if (ssl == "tls") {
                                    console.log('tls connection');
                                } else {
                                    //chrome.sockets.tcp.onReceive.addListener(onReceive);
                                    //chrome.sockets.tcp.onReceiveError.addListener(onReceiveError);
                                    chrome.sockets.tcp.setPaused(tcp_sockets[conID].socket, false);
                                }
                            });
                        });

                    }
                });

            }

            else {
                console.log("The request sent : " + JSON.parse(request.command).request);
                var request = JSON.parse(request.command).request + "\r\n";

                if (server.actionEvt == "connect") {
                    
                chrome.sockets.tcp.create({}, function(createInfo) {
                    socketId = createInfo.socketId;
                    console.log(socketId);
                    tcp_sockets[conID] = new TCP_Socket(socketId, conID);
                    console.log("length: " + tcp_sockets.length);
                    //console.log(tcp_sockets[conID].socket);  

                        var connectObj = JSON.parse(server.settings);
                        var host = connectObj.host;
                        var port = parseInt(connectObj.port);
                        var ssl = connectObj.sec;
                        console.log(host);
                        console.log(port);

                        console.log("tcp_sockets conID: " + tcp_sockets[conID].socket);
                        chrome.sockets.tcp.setPaused(tcp_sockets[conID].socket, true, function() {
                            chrome.sockets.tcp.connect(tcp_sockets[conID].socket, host, port, function() {
                                var secureOptions = {
                                    tlsVersion: {min: "ssl3", max: "tls1.2"}
                                };
                                if (ssl == "ssl") {
                                    chrome.sockets.tcp.secure(tcp_sockets[conID].socket, secureOptions, function() {
                                        //chrome.sockets.tcp.onReceive.addListener(onReceive);
                                        //chrome.sockets.tcp.onReceiveError.addListener(onReceiveError);
                                        chrome.sockets.tcp.setPaused(tcp_sockets[conID].socket, false);
                                    });
                                } else if (ssl == "tls") {
                                    console.log('tls connection');
                                } else {
                                    //chrome.sockets.tcp.onReceive.addListener(onReceive);
                                    //chrome.sockets.tcp.onReceiveError.addListener(onReceiveError);
                                    chrome.sockets.tcp.setPaused(tcp_sockets[conID].socket, false);
                                }
                            });
                        });                    
                });
                }else{

                _stringToArrayBuffer(request, function(sentData) {
                    
                    chrome.sockets.tcp.send(tcp_sockets[conID].socket, sentData, function(sendInfo) {
                        console.log("tcp_sockets conID when sending: " + tcp_sockets[conID].socket);
                        console.log("result code for send Info: " + sendInfo.resultCode);
                    });
                    chrome.sockets.tcp.setPaused(tcp_sockets[conID].socket, false);
                });
            }
            }
            return true;
            //}
        });



function _callbackRecv(data) {
    console.log(data);
}


function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}


function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}


function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}



function onReceive(info) {
    console.log('result received');
    if (info.socketId != tcp_sockets[conID].socket)
        return;
    //var data = String.fromCharCode.apply(null, new Uint8Array(info.data));
    //console.log(data);
    //if(data.indexOf('CLIENTBUG') == -1)
    //sendResponseBack({message:data});
    bufferData(info, conID);
}


function onReceiveError(info) {
    console.log("Error: ", info.resultCode);
}


function _stringToArrayBuffer(str, callback) {
    var bb = new Blob([str]);
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result);
    };
    f.readAsArrayBuffer(bb);
}




function bufferData(info, cid) {
    if (String.fromCharCode.apply(null, new Uint8Array(info.data)).indexOf('CLIENTBUG') > 0) {
        console.log("client bug: " + String.fromCharCode.apply(null, new Uint8Array(info.data)));
        // return;
        //this.currentResponse+=this.command.responseEnd;
    } else {
        this.currentResponse += String.fromCharCode.apply(null, new Uint8Array(info.data));
    }

    // this.currentResponse+=String.fromCharCode.apply(null, new Uint8Array(info.data));
    //console.log("Unhosted response: "+this.currentResponse);

    if (this.command) {
        try {
            console.log(this.command);
            var end = this.command.responseEnd;
            var start = this.command.responseStart;

            //if(end && end!=null && end!="" && typeof(end)!="object")
            //end=end.replace("\r\n","\\n");

            //if(start && start!=null && start!="" && typeof(start)!="object")
            //start=start.replace("\r\n","\\n");

            //console.log("Response Start: "+start);
            //console.log("Response End: "+end);

            var responseEnd = new RegExp(end);
            var responseStart = new RegExp(start);
            console.log("a1");
            console.log("Response Start: " + responseStart);
            console.log("Response End: " + responseEnd);
            console.log(this.request.actionEvt);
            console.log(this.command);

        } catch (e) {
            console.log(e);
        }
    }
    //!this.command || 
    if (!this.currentResponse.match(responseEnd)) {
        console.log("a2");
        return;
    } else {

    }

    var response = this.currentResponse;
    if (response.match(responseStart)) {
        try {
            //this.sendResult(this.evt,"value",response);
            console.log("Unhosted response: " + this.currentResponse);
            sendResponseBack({message: response, id: cid,server:server});
            this.currentResponse = "";
            //console.log("a3");
        } catch (e) {
            console.log("error Sending to app");
            //alert(e);
            //Services.prompt.alert(null,"connection Failed",e);
        }
    } else {
        console.log("Error in responseStart");
        return;
        //alert('error');
        //Services.prompt.alert(null,"connection Failed",'error response: '+response);
    }
}

