DEBUG = false;
MAX_MAILS = 5;


function nowSearchTerm(){
	var today_time = new Date();
	var tomorrow_time = new Date();
	var dd = today_time.getDate();
	var mm = today_time.getMonth()+1; //January is 0!
	var yyyy = today_time.getFullYear();

	var today = yyyy +'/' + mm + '/' + dd;	
	tomorrow_time.setDate(today_time.getDate() + 1);
	dd = tomorrow_time.getDate();
	mm = tomorrow_time.getMonth()+1; //January is 0!
	yyyy = tomorrow_time.getFullYear();
	var tommorow = yyyy +'/' + mm + '/' + dd;	
	var q = 'after:'+today+" "+"before:"+ tommorow+" !is:chats in:inbox";
	return q;
}




function labelCompare(a,b) {
  if (a.name < b.name)
     return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

var app = document.querySelector('#app');
app.load_emails_limit = MAX_MAILS;
app.threadsEmailsToggle = {};
app.back_content = "TODAY";
app.labels_opened = true;
app.alldone = false;
app.heading = 'TODAY';
app.loading = false;
app.bottomLoading = false;
app.page = 'login';
app.main_page = 0;
app.threads = [];
app.selectedemail = 0;
app.selectedThread = null;
app.selectedThreadId = null;
app.lastTrashedThread = null;
app.lastTrashedThreadId = null;
app.lastArchivedThread = null;
app.lastArchivedThreadId = null;
app.lastMovedThread = null;
app.lastMovedThreadId = null;
app.lastMovedThreadFolder = null;
app.movetofolder = null;
app.newEmailOpen = false;
// app.list_q = "category:primary || label:important";
app.list_q = nowSearchTerm();
app.labels = [];
app.showMoreButton = false;
app.draftTo = [];
app.draftSubject = "";
app.draftBody = "";


app.replyBody = "";

var gmail = null;
var PROFILE_IMAGE_SIZE = 30;
// var labels_search = {
// 	// 'INBOX':'category:primary || label:important !is:chats',
// 	'INBOX':'label:inbox !is:chats',
// 	'STARRED':'label:starred !is:chats',
// 	'IMPORTANT':'label:important !is:chats',
// 	'DRAFTS':'label:drafts !is:chats',
// 	'SENT':'label:sent !is:chats'
// }
app._parseHeading = function(heading){
	var headings = heading.split('/');
	return headings[headings.length - 1];
}

app._refreshSelectedThread = function(){
	console.log("app._refreshSelectedThreadi !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
	console.log(app.selectedThread);
	var request = gapi.client.gmail.users.threads.get({
    	'userId': 'me',
      	'id': app.selectedThread.id
  	});
  	request.execute(function(resp){
  		console.log("get new thread resp:");
  		var newThread = resp.result;
  		// app.selectedThread = resp.result;
  		newThread.messages = processMessage(resp);
  		app._populateThread(newThread);
  		console.log(newThread);
  		app.selectedThread = newThread;
  		app.threads[app.selectedThreadId] = app.selectedThread;
  		if (!resp.code){
  			var thread = app.selectedThread;
			var length = app.selectedThread.messages.length;
		    var latest_id = thread.messages[length-1].id;
		     // Fetch only the emails in the user's inbox.
		    retrieveAndFillEmailBody(latest_id, length-1, length);
		    app.selectedThread.messages[length - 1].index = -1;
		    for (var i = 0; i < length - 1; i = i + 1){
		      app.selectedThread.messages[i].index = i;
		      retrieveAndFillEmailBody(app.selectedThread.messages[i].id, i, length);
		    } 
  		}
  	});


	// app.selectedThread = 

	
}
app._parseLabel = function(label){
	var maxLength = 16;
	if (label.length > maxLength){
		var labels = label.split("/");
		var opt_label = "";
		for (var i = 0; i < labels.length - 1; i ++){
			if (labels[i].length > 2){
				opt_label +="/" + labels[i].substring(0,2) + "..";
			}
			else{
				opt_label +="/" + labels[i];
			}
		}
		var last = labels[labels.length - 1];
		opt_label +="/" + labels[labels.length - 1];
		opt_label = opt_label.substring(1);
		if (opt_label.length > maxLength){
			return opt_label.substring(0, maxLength) + ".."
		}
		else{
			return opt_label;
		}
	}
	else{
		return label; 
	}
}

app._abstractEmailsFromTo = function(to){
	var tos_list = to.split(',')
	for (var i = 0; i < tos_list.length; i ++){
		tos_list[i] = tos_list[i].replace(/(.*)</g,"").replace(/>(.*)/g,"").trim();
	}
	return tos_list;
}
app._abstractEmailsFromToToString = function(to){
	tos_list = app._abstractEmailsFromTo(to);
	return tos_list.join(", ");
}
app._isUserLable = function(label){
	if (label.type == 'user'){
		return true;
	}
	else{
		return false;
	}
}


// app.bodyClick = function(){
// 	console.log("bodyClick");
// 	if (app.searching == true){
// 		app.searching = false;
// 	}
// }
app.showNewEmail = function(e){
	console.log("showNewEmail");
	var dialog = document.querySelector('#newEmail')
	if (dialog != null){
		dialog.open();

	}
}
function encodeURL(str){
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}
app.closeNewEmail = function(e){
	console.log("closeNewEmail");	
	console.log(app.newEmailOpen);
	app.newEmailOpen = false;
	console.log(app.newEmailOpen);
}
app.deleteDraft = function(e){
	console.log("deleteDraft");
	app.draftTo = [];
	app.draftSubject = "";
	app.draftBody = "";
}


app.sendEmail = function(e){
	console.log("sending email");
	console.log(app.draftTo);
	console.log(app.draftSubject);
	console.log(app.draftBody);
	
	if (typeof(app.draftTo) == 'undefined' || app.draftTo.length == 0){
		document.querySelector('#emailNotSent').show();
		return;
	}
	var mail = {  
	    // "to": "email1@example.com, email2@example.com",
	    "to": app.draftTo.join(","),
	    "subject": app.draftSubject,
	    "fromName": app.user.name,
	    "from": app.user.email,
	    "body": app.draftBody
	    // "cids": [],
    	// "attaches" : []
	}

	var raw_email = createMimeMessage(mail);
	var encoded_raw_email = Base64.encode(raw_email)
	console.log(raw_email);
	console.log(encoded_raw_email);
	var replaced = encodeURL(encoded_raw_email);
  	var request = gapi.client.gmail.users.messages.send({
    	'userId': 'me',
      	'raw': replaced
  	});
  	request.execute(function(resp){
  		console.log("Send email resp:");
  		console.log(resp);
  		if (!resp.code){
  			app.deleteDraft();	
  			app.closeNewEmail();
  			document.querySelector('#emailSent').show();

  		}
  		else{
  			document.querySelector('#emailNotSent').show();
  		}
  	});

}

var FROM_HEADER_REGEX = new RegExp(/"?(.*?)"?\s?<(.*)>/);




app.searchpressed = function(e){
	// console.log("searchpressed");
	// console.log(app.search);
	if (e.which == 13){
		if (typeof(app.search) !="undefined" && app.search != ""){
			searchEmails(app.search);
		}
	}
}



SUBJECT_MAX_LENGTH = 60;



checkAlldone = function(){
	if (typeof(app.threads) == "undefined" || app.threads.length == 0){
		if (typeof(nextPageToken) == "undefined" || nextPageToken == ""){
			app.alldone = true;	
		}
		else{
			loadMoreEmails();
			app.alldone = false;
		}
	}
	else{
		app.alldone = false;
	}
}
var emailsToLoad = 0;
var nextPageToken = "";

loadThreads = function(threads, checkNew){
	emailsToLoad --;
	if (emailsToLoad == 0){
		if (checkNew){
			console.log("checkNew");
			console.log(app.oldthreads);
			console.log(threads);
			if (typeof(app.oldthreads) === "undefined" || app.oldthreads.length == 0){
				if (threads && threads.length != 0){
					console.log(threads.length + " new emails coming empty");	
					if (threads.length == 1){
						cosnole.log(threads);
						desktopNotifyNewEmail(threads[0].messages[0].from.name, threads[0].messages[0].snippet);
					}
					else{
						desktopNotifyNewEmails(threads.length);	
					}
				}
				else{
					console.log("no more emails");
				}
			}
			else{
				//compareTwo threads
				var newemails = 0; 
				var newer = false;
				console.log("Start forEach");
				$.each(threads, function(index, thread){
					console.log(newemails);
					console.log(thread.id);
					console.log(app.oldthreads[0]);
					if(thread.id == app.oldthreads[0].id){
						console.log("find same id");
						return false;
					}
					else{
						newemails = newemails + 1;
					}
				});
				if (newemails != 0){
					if (newemails == 1){
						console.log(threads[0]);
						desktopNotifyNewEmail(threads[0].messages[0].from.name, threads[0].messages[0].snippet);
					}
					else{
						desktopNotifyNewEmails(threads.length);
					}
					console.log( newemails + " new emails coming original not empty");	
				}
				else{
					console.log("No more new emails");
				}
			}
		}
		app.threads = app.threads.concat(threads);
		app.loading = false;
		app.bottomLoading = false;
		// console.log(threads);
	}	
}


// app._computeBodyHeaderId = function(index){
	// return "body_header-" + index;
// }



app.appUntrashEmail = function(event){
	console.log("appUntrashEmail");
	untrashEmail();
}
app.appUnarchiveEmail = function(event){
	console.log("appUnarchiveEmail");
	unarchiveEmail();
}
app._populateThread = function(thread){
	console.log("_populateThread");
	thread.from = {};
	thread.from.name = thread.messages[0].from.name;
	thread.from.email = thread.messages[0].from.email;
	thread.from.initial = thread.messages[0].from.initial;
	thread.from.initial_color = thread.messages[0].from.initial_color;
	thread.time = thread.messages[thread.messages.length -1 ].time;
	thread.snippet = thread.messages[thread.messages.length -1 ].snippet;
	thread.date = thread.messages[thread.messages.length -1 ].date;
	thread.subject = thread.messages[0].subject;
	console.log(thread);
}
app.fetchMail = function(q, checkNew) {
	app.alldone = false;
	console.log("fetchMail");	
	 // Fetch only the emails in the user's inbox.
	gmail.threads.list({userId: 'me', q: q, 'maxResults':app.load_emails_limit, pageToken:nextPageToken}).then(function(resp) {
		console.log(resp);
		if (!resp.result.threads){
			app.loading = false;
			app.alldone = true;
			return;
		}
	nextPageToken = resp.result.nextPageToken;
    var threads = resp.result.threads;
    var batch = gapi.client.newBatch();
    emailsToLoad = threads.length;
    threads.forEach(function(thread, i) {
		var req = gmail.threads.get({userId: 'me', 'id': thread.id});
		console.log(req);
		batch.add(req);
		req.then(function(resp){
			thread.messages = processMessage(resp);
			app._populateThread(thread);
			loadThreads(threads, checkNew);
		});
    });

	batch.then(function(){
		console.log("all threads loades");	
		if (typeof(nextPageToken) != 'undefined' && nextPageToken != ""){
			app.showMoreButton = true;
		}
		else{
			app.showMoreButton = false;
		}
	});
	});
};
function getAllUserProfileImages(users, nextPageToken, callback) {
  gapi.client.plus.people.list({
    userId: 'me', collection: 'visible', pageToken: nextPageToken
  }).then(function(resp) {

    users = resp.result.items.reduce(function(o, v, i) {
      o[v.displayName] = v.image.url.replace(/(.+)\?sz=\d\d/, "$1?sz=" + PROFILE_IMAGE_SIZE);
      return o;
    }, users);

    if (resp.result.nextPageToken) {
      getAllUserProfileImages(users, resp.result.nextPageToken, callback);
    } else {
      callback(users);
    }

  });
}

Notification.requestPermission(function (permission) {
  if (permission !== 'granted') return;
});

autoRefresh = function(){
	console.log("autoRefresh set");
	setTimeout(function(){
		console.log("autoRefreshing");
		var now = new Date();
		console.log(now);
		app.oldthreads = app.threads;
		console.log("old threads");
		console.log(app.oldthreads);
		refreshInbox(true);
		autoRefresh();
	}, 600000);
	// }, 10000);
}
autoRefresh();
//refreshInbox fields
refreshInbox = function(checkNew) {
	app.main_page = 0;
	app.load_emails_limit = MAX_MAILS;
	app.showMoreButton = false;
	console.log("refreshInbox");
	app.loading = true;
  	// var q = 'in:inbox';
  	app.threads = [];
  	nextPageToken = "";
  	var q = app.list_q;
  	app.fetchMail(q, checkNew);
};
searchEmails = function(search){
	app.heading = "SEARCH";
	app.list_q = search + " !is:chats";
	app.back_content = "SEARCH";
	refreshInbox();
}

app.refreshInboxWithLabel = function(e){
	var label = e.model.item.name;
	refreshInboxWithLabel(label);
}
refreshInboxWithLabel = function(label){
	//close drawer if it's open	
	console.log("refreshInboxWithLabel");
	console.log(label);
	drawer = document.querySelector('#drawerPanel');
	drawer.togglePanel();
	app.heading = label;
	if (label == "TODAY"){
		app.list_q = nowSearchTerm();
		console.log(app.list_q);
	}
	else{
		// app.list_q = labels_search[label];
		app.list_q = "label:" + label + " !is:chat";
	}
	app.back_content = label;
	refreshInbox();
}
loadMoreEmails = function(){
	if (typeof(nextPageToken) === 'undefined' || nextPageToken == ""){
		console.log("No more");
		document.querySelector('#nomoreemails').show();
	}
	else{
		app.bottomLoading = true;
	  	var q = app.list_q;
	  	app.fetchMail(q);
		app.load_emails_limit = app.load_emails_limit*2;
	}
}


retrieveAndFillEmailBody = function (id, index, length){
	console.log("retrieveAndFillEmailBody");
	gmail.messages.get({userId: 'me', id:id, format:'full'}).then(function(resp) {
		console.log("messages.get");
		console.log(resp);
		// console.log(resp.result.payload.body);
	    // app.email_subject = getValueForHeaderField(resp.result.payload.headers, 'Subject');
	    // app.email_subject = app.selectedThread.subject;
	    app.email_body = "";
	    // var payload = resp.result.payload;
	    var payloads = [];
	    payloads.push(resp.result.payload);
	    console.log("payloads:");
	    console.log(payloads);
	   	while(payloads.length > 0){
	   		var payload = payloads.shift();
	   		console.log("payload :");
	   		console.log(payload);
	   		if (payload.body.size != 0){
	   			if (payload.mimeType == "text/plain" || payload.mimeType == "text/html"){
			    	body_str = Base64.decode(payload.body.data);
			    	body_holder = document.getElementById('body_holder-' + index);
			    	body_str.replace(/<a href="/g, '<a target="_blank" href="');
					body_holder.innerHTML = body_str;
					console.log("Compare");
					console.log(index);
					console.log(length);
			    	if (index == length - 1){
						body_holder.style.display = "block";		    			
						// body_holder.style.cursor = "none";
			    	}
			    	else{
			    		var body_id = app.selectedThread.id + '-body_holder-' + index;
			    		if (body_id in app.threadsEmailsToggle){
			    			body_holder.style.display = app.threadsEmailsToggle[body_id];
			    		}
			    		else{
			    			body_holder.style.display = "none"; 
			    		}
			    	}
		    	}
		    	// else if (payload.mimeType == "application/octet-stream"){
		    	else{
		    		if (typeof(app.selectedThread.messages[index].attachments) == "undefined"){
		    			app.selectedThread.messages[index].attachments = []	
		    		} 
		    		app.selectedThread.messages[index].attachments.push({'messageId':id,'filename':payload.filename, 'mimeType':payload.mimeType, 'attachmentId':payload.body.attachmentId})
		    		app.selectedThread.messages[index] = $.extend({},app.selectedThread.messages[index]);
		    		app.selectedThread.messages = app.selectedThread.messages.slice();
		    		app.selectedThread = $.extend({},app.selectedThread);
		    		console.log("app.selectedThread.messages");
		    		console.log(app.selectedThread.messages);
		    	}
		    	// else{
		    		// alert("Unsupported mimeType " + payload.mimeType);
		    	// }
		    }
		    else{
			    if (payload.mimeType == "multipart/alternative"){
			    	console.log("multipart/alternative");
			    	// console.log(payload);

			    	// body_str = Base64.decode(payload.parts[1].body.data);
			    	body_str = ""
		    		body_str = Base64.decode(payload.parts[1].body.data)
		    		// body_str = atob(payload.parts[1].body.data)
			    	body_str = body_str.replace(/<a href="/g, '<a target="_blank" href="');
		    		app.email_body = body_str;
		    		body_holder = document.getElementById('body_holder-'+index);
					body_holder.innerHTML = body_str;
					console.log("Compare");
					console.log(index);
					console.log(length);
		    		if (index == length - 1){
						body_holder.style.display = "block";	    			
						// body_holder.style.cursor = "none";
		    		}
		    		else{
		    			var body_id = app.selectedThread.id + '-body_holder-' + index;
		    			if (body_id in app.threadsEmailsToggle){
		    				body_holder.style.display = app.threadsEmailsToggle[body_id];
		    			}
		    			else{
		    				body_holder.style.display = "none"; 
		    			}
		    		}
			    	
			    	// body_str = atob(payload.parts[1].body.data);
			    }
			    else{
			    	console.log("else");
			    	if (payload.mimeType == "multipart/mixed"){
			    		payloads = payloads.concat(payload.parts);
			    	}
			    	else if (payload.mimeType == "multipart/related"){
			    		payloads = payloads.concat(payload.parts);
			    	}
			    	else if (payload.mimeType == "image/png"){
			    	}
			    	else{
			    		console.log("else");
			    		alert("has not supported item " + payload.mimeType);
			    	}

			    }

			}
	   	}//while  
	});
}

app.replyAllTo = [];
app.replyToList = [];
app.replyTo = "";
app.replyToSubject = "";

app.populateReplyTo = function(thread){
	console.log("populateReplyTo");
	console.log(thread);
	var message = thread.messages[0];
	app.replyToSubject = thread.subject;;
	app.replyTo = message.from.email;
	var tos = message.to;
	var tos_list = tos.split(',')
	var tos_email_list = [];
	var index = -1;
	for (var i = 0; i < tos_list.length; i ++){
		tos_list[i] = tos_list[i].replace(/(.*)</g,"").replace(/>(.*)/g,"").trim();
		if (tos_list[i] == app.user.email){
			index = i;
		}
	}
	if (index != -1){
		tos_list.splice(index,1);
	}
	
	tos_list.push(app.replyTo);
	var dict = {};
	var new_tos_list = [];
	for (var i = 0; i < tos_list.length; i ++){
		if (!(tos_list[i] in dict)){
			new_tos_list.push(tos_list[i]);
			dict[tos_list[i]] = 'true';
		}
	}

	app.replyAllTo = new_tos_list.slice();
	app.replyToList = app.replyAllTo.slice();

}
,
app._hasProfileImage = function(val){
	// app.users;
	//todo
	//need to find a way to determine if shows the avatar
	//need to wait getAllUsers finish
	return false;
}





