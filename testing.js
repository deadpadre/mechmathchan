VK.init({apiId: 3059896});

function maximum(a ,b) {
	if (a > b) {
		return a;
	} else {
		return b;
	}
}

function elo(a, b) {
	return 1.0 / (1 + (Math.pow(10.0, (b - a) * 1.0 / 400.0)));
}

function k(tries, hits) {
	if (tries <= 30) {
		return 30;
	} else {
		if (hits <= 2400) {
			return 15;
		} else {
			return 10;
		}
	}
}

function alertObj(obj) { 
    var str = ""; 
    for(k in obj) { 
        str += k+": "+ obj[k]+"\r\n"; 
    } 
    alert(str); 
} 

function getRandomInt(min, max) {
  return (Math.floor(Math.random() * (max - min + 1)) + min) % max;
}

function getExceptedRandomInt(min, max, excep) {
	var temp = getRandomInt(min, max);
	while (temp == excep) {
		temp = getRandomInt(min, max);
	}
	return temp;
}

function caller() {
	VK.Api.call('groups.isMember', {'group_id': 'mechmath2012'}, function(answer) {
		if (answer.response == '0') {
			alert('access denied');
			
		} else {
			VK.Auth.getLoginStatus(function(temp) {
				VK.Api.call('users.get', {'uids': temp.session.mid, 'fields': 'sex'}, function(val) {
					if (val.response[0].sex == '1') {
						alert('access denied');
					} else {
						VK.Api.call('groups.getMembers', {'gid': 'mechmath2012'}, function(groups) {
							VK.Api.call('users.get', {'uids': groups.response.users.join(','), 'fields': 'sex'}, function(info) {
								VK.Api.call('storage.get', {'key': 'bla', 'keys': groups.response.users.join(','), 'global': '1'}, function(vals) {
									var women = [];
									for (var i = 0; i < vals.response.length; i++) {
										if (info.response[i].sex == '1') {
											women.push(info.response[i].uid);
											if (vals.response[i].value == '') {
												VK.Api.call('storage.set', {'key': groups.response.users[i], 'global': '1', 'value': '0 0'}, function(t) {});
											}
										}
									}
									var ind1 = getRandomInt(0, women.length);
									var ind2 = getExceptedRandomInt(0, women.length, ind1);
									VK.Api.call('users.get', {'uids': (women[ind1]+','+women[ind2]), 'fields': 'photo_big'}, function(back) {
										test(back.response[0], back.response[1]);
									});
								});
							});
						});
					}
				})
			});
		}
	});
}

function incr(users_id, tries, hits, e) {
	VK.Api.call('storage.get', {'key': users_id, 'global': '1'}, function(val) {
		var temp = val.response.split(' ');
		temp[0] = (parseInt(temp[0]) + k(parseInt(temp[1]), parseInt(temp[0])) * (hits - e)).toString();
		temp[1] = (parseInt(temp[1]) + tries).toString();
		VK.Api.call('storage.set', {'key': users_id, 'global': '1', 'value': temp.join(' ')}, function(t) {});
	});
}

function test(left, right) {
	var l_users_img = document.createElement('img');
	l_users_img.src = left.photo_big;
	l_users_img.className = "image aligntop";
	l_users_img.alt = "";
	l_users_img.onclick = function() {
		VK.Api.call('storage.get', {'key': 'bla', 'keys': left.uid + ',' + right.uid, 'global': '1'}, function(val) {
			var temp0 = val.response[0].value.split(' ')[0];
			var temp1 = val.response[1].value.split(' ')[0];
			incr(left.uid, 1, 1, elo(temp0, temp1));
			incr(right.uid, 1, 0, elo(temp1, temp0));
		});
		document.getElementById('wrapper').removeChild(document.getElementById('inner'));
		caller();
	}
	var l_users_name = document.createElement('h3');
	l_users_name.appendChild(document.createTextNode(left.first_name + ' ' + left.last_name));
	var l_users_info = document.createElement('p');
	l_users_info.innerHTML = '';
	var left_column = document.createElement('div');
	left_column.className = "box col1";
	left_column.appendChild(l_users_name);
	left_column.appendChild(l_users_img);
	left_column.appendChild(l_users_info);
	var r_users_img = document.createElement('img');
	r_users_img.src = right.photo_big;
	r_users_img.className = "image aligntop";
	r_users_img.alt = "";
	r_users_img.onclick = function() {
		VK.Api.call('storage.get', {'key': 'bla', 'keys': left.uid + ',' + right.uid, 'global': '1'}, function(val) {
			var temp0 = val.response[0].value.split(' ')[0];
			var temp1 = val.response[1].value.split(' ')[0];
			incr(left.uid, 1, 0, elo(temp0, temp1));
			incr(right.uid, 1, 1, elo(temp1, temp0));
		});
		document.getElementById('wrapper').removeChild(document.getElementById('inner'));
		caller();
	}
	var r_users_name = document.createElement('h3');
	r_users_name.appendChild(document.createTextNode(right.first_name + ' ' + right.last_name));
	var r_users_info = document.createElement('p');
	r_users_info.innerHTML = '';
	var right_column = document.createElement('div');
	right_column.className = "box col2";
	right_column.appendChild(r_users_name);
	right_column.appendChild(r_users_img);
	right_column.appendChild(r_users_info);
	var content = document.createElement('div');
	content.id = 'content';
	content.appendChild(left_column);
	content.appendChild(right_column);
	var page = document.createElement('div');
	page.id = 'page';
	page.appendChild(content);
	var inner = document.createElement('div');
	inner.id = "inner";
	inner.appendChild(page);
	var wrapper = document.getElementById('wrapper');
	var page_bottom = wrapper.getElementsByTagName('div')[9];
	wrapper.insertBefore(inner, page_bottom);
	l_users_img.onload = function() {
		page.style.height = (maximum(l_users_img.height, r_users_img.height) + 200).toString() + 'px';
		r_users_img.onload = function() {
			page.style.height = (maximum(l_users_img.height, r_users_img.height) + 200).toString() + 'px';
		}
	}
}

var t = 0;

function authInfo(response) {
	if (response.session) {
		if (t == 0) {
			t++;
		} else {
			alert('stop clicking this button, you are already logged in');
			return;
		}
		caller();
  	} else {
    	alert('not auth, try again');
  	}
}

VK.Auth.getLoginStatus (function checkAuth(response) {
	if (response.session) {
		t = 1;
		caller();
	}
});

VK.UI.button('login_button');
