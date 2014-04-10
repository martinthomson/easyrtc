//
//Copyright (c) 2013, Priologic Software Inc.
//All rights reserved.
//
//Redistribution and use in source and binary forms, with or without
//modification, are permitted provided that the following conditions are met:
//
//    * Redistributions of source code must retain the above copyright notice,
//      this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
//ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
//LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
//CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
//POSSIBILITY OF SUCH DAMAGE.
//
var selfEasyrtcid = '';

function streamConnected(callerEasyrtcid, stream) {
  var video = document.getElementById('callerVideo');
  easyRTC.setVideoObjectSrc(video, stream || '');

  // add close button
  var closeButton = document.createElement('div');
  closeButton.className = 'closeButton';
  closeButton.onclick = function() {
    easyRTC.hangup(callerEasyrtcid);
    easyRTC.setVideoObjectSrc(video, '');
  };
  video.parentNode.appendChild(closeButton);
}

function clearConnectList() {
  otherClientDiv = document.getElementById('otherClients');
  while (otherClientDiv.hasChildNodes()) {
    otherClientDiv.removeChild(otherClientDiv.lastChild);
  }
}

function convertListToButtons (data) {
  clearConnectList();
  otherClientDiv = document.getElementById('otherClients');
  for (var i in data) {
    var button = document.createElement('button');
    button.onclick = performCall.bind(null, i);

    label = document.createTextNode(easyRTC.idToName(i));
    button.appendChild(label);
    otherClientDiv.appendChild(button);
  }
}

function initMedia(cb) {
  easyRTC.initMediaSource(function() {
    var selfVideo = document.getElementById('selfVideo');
    easyRTC.setVideoObjectSrc(selfVideo, easyRTC.getLocalStream());
    cb();
  }, easyRTC.showError.bind(easyRTC, 'GUM', 'Couldn\'t open media.'));
}

function performCall(otherEasyrtcid) {
  easyRTC.hangupAll();
  var acceptedCB = function(accepted, caller) {
    if(!accepted) {
      easyRTC.showError('CALL-REJECTED', 'Sorry, your call to ' + easyRTC.idToName(caller) + ' was rejected');
    }
  };
  var successCB = function() {};
  var failureCB = easyRTC.showError.bind(easyRTC, 'Call', 'Can\'t make call.');
  easyRTC.peerIdentity = otherEasyrtcid + "@" + easyRTC.idp;
  initMedia(function() {
    easyRTC.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
  });
}

function acceptCall(caller, cb) {
  console.log('call from', caller);
  easyRTC.peerIdentity = caller + "@" + easyRTC.idp;
  initMedia(cb.bind(null, true));
}

function loginSuccess(easyRTCId) {
  selfEasyrtcid = easyRTC.myEasyrtcid;
  easyRTC.idpUsername = selfEasyrtcid;
  document.getElementById('iam').innerHTML = 'I am ' + easyRTC.cleanId(easyRTCId);
}

function loginFailure(message) {
  easyRTC.showError('LOGIN-FAILURE', message);
}

function connect() {
  easyRTC.idp = "rtcweb-idp.herokuapp.com";
  easyRTC.idpProtocol = "bogus#delay1000";

  easyRTC.setLoggedInListener(convertListToButtons);
  easyRTC.setStreamAcceptor(streamConnected);
  easyRTC.setOnStreamClosed(streamConnected);

  // Sets calls so they are automatically accepted (this is default behaviour)
  easyRTC.setAcceptChecker(acceptCall);

  easyRTC.connect('audioVideo', loginSuccess, loginFailure);
}
