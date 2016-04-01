var Wrapper = {

	url : "",
	user : "",
	password : "",
	challenge : "",
	challengeResponse : "",
	token : "",


	getAuthentication : function(){
		var d = Q.defer();
		var w = this;
		getChallenge(w)
		.then(function(resp){
			//console.log(resp);
			return getChallengeResponse(w);
		})
		.then(function(resp){
			//console.log(resp);
			return getToken(w);
		})
		.then(function(resp){
			//console.log("AUTH END: " + resp);
			d.resolve();
		});
		return d.promise;
	},

	getInterface : function(callback) {
		var url = this.url + "/fcgi-bin/IHFTRestAPI/getInterface";
		var data = JSON.stringify( {
			getInterface: {
				user: this.user,
				token: this.token
		} } );
		polling(url, data, callback);
	},

	getAccount: function(callback) {
		var url = this.url + "/fcgi-bin/IHFTRestAPI/getAccount";
		var data = JSON.stringify( {
			getAccount: {
				user: this.user,
				token: this.token
		} } );
		polling(url, data, callback);
	},

	getPriceStreaming : function(seclist, tilist, gran, lev, int, callback) {
		var url = this.url + "/cgi-bin/IHFTRestStreamer/getPrice";
		var data = JSON.stringify( {
			getPrice: {
				user: this.user,
				token: this.token,
				security: seclist,
				tinterface: tilist,
				granularity: gran,
				levels: lev,
				interval: int
		} } );
		streaming(url, data, callback);
	},

	getPricePolling : function(seclist, tilist, gran, lev, callback) {
		var url = this.url + "/fcgi-bin/IHFTRestAPI/getPrice";
		var data = JSON.stringify( {
			getPrice: {
				user: this.user,
				token: this.token,
				security: seclist,
				tinterface: tilist,
				granularity: gran,
				levels: lev
		} } );
		polling(url, data, callback);
	},

	setOrder : function(sec, ti, qua, sid, typ, tif, pri, exp, up, tmp, res, callback) {
		var url = this.url + "/fcgi-bin/IHFTRestAPI/setOrder";
		var data = JSON.stringify( {
			setOrder: {
				user: this.user,
				token: this.token,
				order:[ {
					security: sec,
					tinterface: ti,
					quantity: qua,
					side: sid,
					type: typ,
					timeinforce: tif,
					price: pri,
					expiration: exp,
					userparam: up,
					tempid: tmp,
					result: res
				}]
		} } );
		polling(url, data, callback);
	},

	modifyOrder : function(fid, pri, qua, callback) {
		var url = this.url + "/fcgi-bin/IHFTRestAPI/modifyOrder";
		var data = JSON.stringify( {
			modifyOrder: {
				user: this.user,
				token: this.token,
				order: {
					fixid: fid,
					price: pri,
					quantity: qua
				}
		} } );
		polling(url, data, callback);
	},

	cancelOrder : function(fid, callback) {
		var url = this.url + "/fcgi-bin/IHFTRestAPI/cancelOrder";
		var data = JSON.stringify( {
			cancelOrder: {
				user: this.user,
				token: this.token,
				fixid: fid
		} } );
		polling(url, data, callback);
	},

	getOrderStreaming : function(seclist, tilist, typlist, int, callback) {
		var url = this.url + "/cgi-bin/IHFTRestStreamer/getOrder";
		var data = JSON.stringify( {
			getOrder: {
				user: this.user,
				token: this.token,
				security: seclist,
				tinterface: tilist,
				type: typlist,
				interval: int
		} } );
		streaming(url, data, callback);
	},

	getOrderPolling : function(seclist, tilist, typlist, callback) {
		var url = this.url + "/fcgi-bin/IHFTRestAPI/getOrder";
		var data = JSON.stringify( {
			getOrder: {
				user: this.user,
				token: this.token,
				security: seclist,
				tinterface: tilist,
				type: typlist
		} } );
		polling(url, data, callback);
	},

	getPositionStreaming : function(asslist, seclist, acclist, int, callback) {
		var url = this.url + "/cgi-bin/IHFTRestStreamer/getPosition";
		var data = JSON.stringify( {
			getPosition: {
				user: this.user,
				token: this.token,
				asset: asslist,
				security: seclist,
				account: acclist,
				interval: int
		} } );
		streaming(url, data, callback);
	},

	getPositionPolling : function(asslist, seclist, acclist, callback) {
		var url = this.url + "/fcgi-bin/IHFTRestAPI/getPosition";
		var data = JSON.stringify( {
			getPosition: {
				user: this.user,
				token: this.token,
				asset: asslist,
				security: seclist,
				account: acclist
		} } );
		polling(url, data, callback);
	},

	getIndicatorStreaming : function(sec, tilist, ind, num, per, callback) {
		var url = this.url + "/cgi-bin/IHFTRestStreamer/getIndicator";
		var data = JSON.stringify( {
			getIndicator: {
				user: this.user,
				token: this.token,
				security: sec,
				tinterface: tilist,
				indicator: ind,
				number: num,
				perior: per
		} } );
		streaming(url, data, callback);
	},

	getHistoricalPrices : function(sec, tilist, gran, sid, num, callback) {
		var url = this.url + "/cgi-bin/IHFTRestStreamer/getHistoricalPrice";
		var data = JSON.stringify( {
			getHistoricalPrice: {
				user: this.user,
				token: this.token,
				security: sec,
				tinterface: tilist,
				granularity: gran,
				side: sid,
				number: num
		} } );
		streaming(url, data, callback);
	}
}


function streaming(url, data, callback) {
	var lastPtr = 0;
	$.ajaxreadystate({
		type: "POST",
		contentType: "application/json",
		dataType: "json",
		url: url,
		data: data,
		readystate: function (jqXHR, readystate) {
			console.log (jqXHR);
			if (readystate === 3) {
				if (jqXHR.responseText === null)  return;
				var data = jqXHR.responseText.substring(lastPtr);
				lastPtr  = jqXHR.responseText.length;
				if (data.indexOf("heartbeat")>-3){
					var jsonArray2 = '[' + data.replace (/\n?\n/g, ",") + ']';
					var jsonArray = jsonArray2.replace (/,]/g, "]");
					var response = JSON.parse (jsonArray);
					response.forEach (function(entry) {
						callback(entry);
					});
				}
			}
		},
		error: function (jqXHR, ajaxOptions, thrownError) {
			alert(jqXHR.statusText);
			console.log (jqXHR.status);
			console.log (thrownError);
		}
	});
}

function polling(url, data, callback) {
	$.ajax({
		type: "POST",
		contentType: "application/json",
		dataType: "json",
		url: url,
		data: data,
		success: function(response) {
			//console.log("POLLING RESPONSE: " + response);
			callback(response);
		}
	});
}

function getChallenge(wrapper) {
	var d = Q.defer();
	//console.log("USER: " + wrapper.user);
	$.ajax({
		type: "POST",
		contentType: "application/json",
		dataType: "json",
		url: wrapper.url + '/fcgi-bin/IHFTRestAuth/getAuthorizationChallenge',
		data: JSON.stringify({	getAuthorizationChallenge: { user: wrapper.user } }),
		success: function(response) {
			console.log(response);
			wrapper.challenge = response.getAuthorizationChallengeResponse.challenge;
			//console.log("CHALLENGE: " + wrapper.challenge);
		}
	}).done(d.resolve).fail(d.reject);
	return d.promise;
}

function getChallengeResponse(wrapper) {
	var d = Q.defer();
	var bytes = [];
	//console.log("CHALLENGE: " + wrapper.challenge);
	for(var i = 0; i < wrapper.challenge.length-1; i+=2){
		bytes.push(parseInt(wrapper.challenge.substr(i, 2), 16));
	}
	//console.log("PASSWORD: " + wrapper.password);
	for (var i = 0; i < wrapper.password.length; ++i) {
		bytes.push(wrapper.password.charCodeAt(i));
	}
	wrapper.challengeResponse = Crypto.SHA1(bytes);
	//console.log("RESPONSE: " + wrapper.challengeResponse);
	d.resolve();
	return d.promise;
}

function getToken(wrapper) {
	var d = Q.defer();
	$.ajax({
		type: "POST",
		contentType: "application/json",
		dataType: "json",
		url: wrapper.url + '/fcgi-bin/IHFTRestAuth/getAuthorizationToken',
		data: JSON.stringify({	getAuthorizationToken: { user: wrapper.user, challengeresp: wrapper.challengeResponse } }),
		success: function(response) {
			console.log(response);
			wrapper.token = response.getAuthorizationTokenResponse.token;
			//console.log("TOKEN: " + wrapper.token);
		}
	}).done(d.resolve).fail(d.reject);
	return d.promise;
}

