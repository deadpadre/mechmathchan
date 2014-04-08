VK.init({apiId: 3059896});

function alertObj(obj) { 
    var str = ""; 
    for(k in obj) { 
        str += k+": "+ obj[k]+"\r\n"; 
    } 
    alert(str); 
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

function buildRating(users) {
	users.sort(compareFunction);
	var content = document.createElement('div');
	content.id = 'content';
	for (var i = 0; i < 5; i++) {
		var a_temp = document.createElement('a');
		a_temp.href = 'http://vk.com/id' + users[i].uid;
		var temp = document.createElement('h1');
		a_temp.innerHTML = users[i].first_name + ' ' + users[i].last_name;
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
	inner.al
	document.getElementById('wrapper').insertBefore(inner, document.getElementById('page-bottom'));
}

function caller() {
	VK.Api.call('groups.getMembers', {'gid': 'mechmath2012'}, function(groups) {
		VK.Api.call('users.get', {'uids': groups.response.users.join(','), 'fields': 'sex'}, function(info) {
			VK.Api.call('storage.get', {'key': 'bla', 'keys': groups.response.users.join(','), 'global': '1'}, function(vals) {
				var women = [];
				for (var i = 0; i < vals.response.length; i++) {
					if (info.response[i].sex == '1') {
						if (vals.response[i].value == '') {
							VK.Api.call('storage.set', {'key': groups.response.users[i], 'global': '1', 'value': '1500 0'}, function(t) {});
							women.push({uid: info.response[i].uid, tries: 0, hits: 1500, first_name: info.response[i].first_name, last_name: info.response[i].last_name});
						} else {
							var temp = vals.response[i].value.split(' ');
							women.push({uid: info.response[i].uid, tries: parseInt(temp[1]), hits: parseInt(temp[0]), first_name: info.response[i].first_name, last_name: info.response[i].last_name});
						}
					}
				}
				buildRating(women);
			});
		});
	});	
}

var t = 0;

function authInfo(response) {
	if (response.session) {
		if (t == 0) {
			t++;
			alert('successful');
		} else {
			alert('stop clicking this button');
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
