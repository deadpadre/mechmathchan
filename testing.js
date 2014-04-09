VK.init({apiId: 3059896});

var user_id = -1;
var women = -1;

function isWoman(user) {
	return (user.sex == 1);
}

function alertObject(object) { 
    var str = ""; 
    for (var key in object) { 
        str += key + ": "+ object[key] + "\r\n"; 
    } 
    console.log(str); 	
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

function chooseGirls() {
	VK.Api.call('storage.get', {'keys': women.map(function(x) { return x.uid }).join(','), 'global': '1'}, function(counters) {
		console.log(counters);
		for (var i = 0; i < counters.response.length; i++) {
			if (counters.response[i].value == '')
				VK.Api.call('storage.set', {'key': women[i].uid, 'global': '1', 'value': '0 0'}, function(t) { console.log(t)});
		}
		var ind1 = getRandomInt(0, women.length);
		var ind2 = getExceptedRandomInt(0, women.length, ind1);
		test(women[ind1], women[ind2]);
	});
}

function retrieveWomen(callback) {
	console.log(typeof women);
	VK.Api.call('groups.isMember', {'group_id': 'mechmath2012', 'user_id': user_id}, function(answer) {
		alertObject(answer);
		if (answer.response == 0) {
			alert('access denied');
		} else {
			console.log('initial access granted');
			VK.Api.call('users.get', {'fields': 'sex'}, function(val) {
				if (val.response[0].sex == '1') {
					alert('access denied');
					console.log('access denied due to your sex');
				} else {
					console.log('keep on fixing');
					VK.Api.call('groups.getMembers', {'group_id': 'mechmath2012', 'sort': 'id_asc', 'fields': 'sex,photo_200_orig'}, function(groupMembers) {
						women = (groupMembers.response.users).filter(isWoman); 
						callback();
					});
				}
			});
		}
	});
}

function caller() {
	if (typeof women == "number") {
		retrieveWomen(chooseGirls);
	} else {
		chooseGirls();
	}
}

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
	l_users_img.src = left.photo_200_orig;
	l_users_img.className = "image aligntop";
	l_users_img.alt = "";
	l_users_img.onclick = function() {
		VK.Api.call('storage.get', {'keys': left.uid + ',' + right.uid, 'global': '1'}, function(val) {
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
	r_users_img.src = right.photo_200_orig;
	r_users_img.className = "image aligntop";
	r_users_img.alt = "";
	r_users_img.onclick = function() {
		VK.Api.call('storage.get', {'keys': left.uid + ',' + right.uid, 'global': '1'}, function(val) {
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
		user_id = parseInt(response.session.mid);
		alert(user_id);
		caller();
  	} else {
    	alert('Can\'t auth, try again');
  	}
}

VK.Auth.getLoginStatus(function checkAuth(response) {
	if (response.session) {
		t = 1;
		caller();
	}
});

VK.UI.button('login_button');
