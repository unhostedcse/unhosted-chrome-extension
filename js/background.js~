
var socketId;
var count = 0;
var sendResponseBack;

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) 
  {
    sendResponseBack = sendResponse;
     console.log(request.actionEvt);
      if(request.actionEvt == "connect"){
          var connectObj = JSON.parse(request.settings);
          var host = connectObj.host;
          var port = parseInt(connectObj.port);
          console.log(host);
          console.log(port);
          chrome.sockets.tcp.create({}, function(createInfo){
              socketId = createInfo.socketId;
              chrome.sockets.tcp.setPaused(socketId, true, function(){
                  chrome.sockets.tcp.connect(socketId, host, port, function(){
                     var secureOptions = {
                        tlsVersion:{ min:"ssl3", max:"tls1.2"}
                     };                       
                     chrome.sockets.tcp.secure(socketId, secureOptions, function(){                           
                            chrome.sockets.tcp.onReceive.addListener(onReceive);
                            chrome.sockets.tcp.onReceiveError.addListener(onReceiveError);  
                            chrome.sockets.tcp.setPaused(socketId, false);  
                     });
                  });
              });
          });
      }else{
        var request = JSON.parse(request.command).request+"\r\n\r\n";
        _stringToArrayBuffer(request, function(sentData){
           console.log(sentData);
           console.log('login data sending..')
            chrome.sockets.tcp.send(socketId, sentData, function(sendInfo){
                        console.log(socketId);
                        console.log(sendInfo.resultCode);
                        console.log(sendInfo);                        
                    });     
                   chrome.sockets.tcp.setPaused(socketId, false); 
        });
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
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}



function onReceive(info){
  console.log('result received');
  if (info.socketId != socketId)
    return;
  var data = String.fromCharCode.apply(null, new Uint8Array(info.data));
  console.log(data);
  if(data.indexOf('CLIENTBUG') == -1)
        sendResponseBack({message:data});
}


function onReceiveError(info){
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