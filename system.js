VK.init({apiId: 3059896}); 

var user_id = -1;
var women = -1;

function isWoman(user) {
	return (user.sex == 1);
}

function compareFunction(a, b) {
	if (a.hits < b.hits) {
		return 1;
	} else if (a.hits > b.hits) {
		return -1;
	} else {
		if (a.tries < b.tries) {
			return 1;
		} else if (a.tries > b.tries) {
			return -1;
		} else {
			return 0;
		}
	}
}

function buildRating() {
	women.sort(compareFunction);
	var content = document.createElement('div');
	content.id = 'content';
	for (var i = 0; i < women.length; i++) {
		var a_temp = document.createElement('a');
		a_temp.href = 'http://vk.com/id' + women[i].uid;
		var temp = document.createElement('h1');
		a_temp.innerHTML = women[i].first_name + ' ' + women[i].last_name + ' ' + (Math.ceil(parseInt(women[i].hits))).toString();
		temp.innerHTML = (i + 1).toString() + '. '; 
		temp.appendChild(a_temp);
		temp.style.marginLeft = '27%';
		content.appendChild(temp);
	}
	var page = document.createElement('div');
	page.id = 'page';
	page.appendChild(content);
	var inner = document.createElement('div');
	inner.id = 'inner';
	inner.appendChild(page);
	document.getElementById('wrapper').insertBefore(inner, document.getElementById('page-bottom'));
}

function retrieveWomen(callback) {
	console.log(typeof women);
	VK.Api.call('groups.isMember', {'group_id': 'mechmath2012', 'user_id': user_id}, function(answer) {
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
						VK.Api.call('storage.get', {'keys': women.map(function(x) { return x.uid }).join(','), 'global': '1'}, function(counters) {
							console.log(counters);
							console.log(women.length);
							for (var i = 0; i < women.length; i++) {
								women[i] = {
									uid: women[i].uid,
									first_name: women[i].first_name,
									last_name: women[i].last_name,
									hits: parseInt(counters.response[i].value.split(' ')[0]),
									tries: parseInt(counters.response[i].value.split(' ')[1])
								}
								console.log(women[i]);
							}
							for (var i = 0; i < counters.response.length; i++) {
								if (counters.response[i].value == '')
									VK.Api.call('storage.set', {'key': women[i].uid, 'global': '1', 'value': '0 0'}, function(t) { console.log(t)});
							}
							callback();
						});
					});
				}
			});
		}
	});
}

function caller() {
	retrieveWomen(buildRating);
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
