VK.init({apiId: 3059896}); 

var VK_ID_LINK 		= 'http://vk.com/id';
var VK_GROUPNAME 	= 'mechmath2012';
var userId = -1;

function User(vkUserObj, hits, tries) {
	this.sex = vkUserObj.sex;
	this.firstName = vkUserObj.first_name;
	this.lastName = vkUserObj.last_name;
	this.uid = vkUserObj.uid;
	this.smallPhoto = vkUserObj.photo_50;
	this.hits = hits;
	this.tries = tries;
}

User.prototype.isWoman = function() {
	return (this.sex == 1);
};

User.prototype.compare = function(other) {
	if (this.hits < other.hits) {
		return 1;
	} else if (this.hits > other.hits) {
		return -1;
	} else {
		if (this.tries < other.tries) {
			return 1;
		} else if (this.tries > other.tries) {
			return -1;
		} else {
			return 0;
		}
	}
};

// using innerHTML in attributes may seem quite a hack, but whatever.
var createSpecifiedElement = function(tag, attributes, styles) {
	var element = document.createElement(tag);
	for (var key in attributes) {
		element[key] = attributes[key];
	}
	for (key in styles) {
		element.style[key] = styles[key];
	}
	return element;
};

var viewUsers = function(users) {
	var content = createSpecifiedElement('div', {
		id : 'content'
	});
	for (var i = 0; i < 10; i++) {
		var tempDiv			= createSpecifiedElement('div', { className : 'rating-item' });
		var tempImage		= createSpecifiedElement('img', { src : users[i].smallPhoto });
		var tempLink 		= createSpecifiedElement('a', {
			href				: VK_ID_LINK + users[i].uid,
			innerHTML 	: users[i].firstName + ' ' + users[i].lastName
		});
		var tempHeader 	= createSpecifiedElement('h1');
		tempHeader.appendChild(tempLink);
		tempDiv.appendChild(tempImage);
		tempDiv.appendChild(tempHeader);
		content.appendChild(tempDiv);
	}
	var page = createSpecifiedElement('div', { id : 'page' });
	page.appendChild(content);
	var inner = createSpecifiedElement('div', { id : 'inner' });
	inner.appendChild(page);
	document.getElementById('wrapper').insertBefore(inner, document.getElementById('page-bottom'));
};

var showDenialMessage = function(reason) {
	if (typeof reason == 'undefined') {
		reason = "just 'cause";
	}
	console.log('access denied: ' + reason + '.');
};

function getFemaleMembersRated(groupname, callback) {
	VK.Api.call('groups.getMembers', {
		'group_id': groupname,
		'sort'		: 'id_asc',
		'fields': 'sex,photo_50'
	}, function(groupMembers) {
		var women = groupMembers.response.users.map(function(element) {
			return new User(element);
		}).filter(function(element) {
			return element.isWoman();
		});
		VK.Api.call('storage.get', {
				'keys' : women.map(function(x) {
					return x.uid;
				}).join(','),
				'global' : '1'
			}, function(counters) {
				for (var i = 0; i < women.length; i++) {
					women[i].hits 	= parseFloat(counters.response[i].value.split(' ')[0]);
					women[i].tries	= parseFloat(counters.response[i].value.split(' ')[1]);
				}
				for (i = 0; i < counters.response.length; i++) {
					if (counters.response[i].value === '') {
						VK.Api.call('storage.set', {
							'key' 	: women[i].uid,
							'global': '1',
							'value'	: '0 0'
						}, console.log);
					}
				}
				callback(women);
		});
	});
}

function caller() {
	getFemaleMembersRated(VK_GROUPNAME, function(users) {
		viewUsers(users.sort(function(a, b) {
			return a.compare(b);
		}));
	});
}

function authInfo(response) {
	if (response.session) {
		userId = parseInt(response.session.mid);
		caller();
  	} else {
    	showDenialMessage("can't authenticate");
  	}
}

VK.Auth.getLoginStatus(function checkAuth(response) {
	if (response.session) {
		caller();
	}
});

VK.UI.button('login_button');
