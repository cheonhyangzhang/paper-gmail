var letterColors = {
  'A':'#00BCD4',
  'B':'#2196F3',
  'C':'#3F51B5',
  'D':'#673AB7',
  'E':'#FFEB3B',
  'F':'#F44336',
  'G':'#FFC107',
  'H':'#795548',
  'I':'#9C27B0',
  'J':'#F44336',
  'K':'#03A9F4',
  'L':'#4CAF50',
  'M':'#E91E63',
  'N':'#FF5722',
  'O':'#673AB7',
  'P':'#CDDC39',
  'Q':'#009688',
  'R':'#009688',
  'S':'#9C27B0',
  'T':'#8BC34A',
  'U':'#00BCD4',
  'V':'#607D8B',
  'W':'#FF9800',
  'X':'#03A9F4',
  'Y':'#E91E63',
  'Z':'#2196F3'
}
//performance could be improved
function getValueForHeaderField(headers, field) {
  for (var i = 0, header; header = headers[i]; ++i) {
    if (header.name == field || header.name == field.toLowerCase()) {
      return header.value;
    }
  }
  return null;
}

function processMessage(resp) {
  var messages = resp.result.messages;
  for (var j = 0, m; m = messages[j]; ++j) {
    var headers = m.payload.headers;
    //Example: Thu Sep 25 2014 14:43:18 GMT-0700 (PDT) -> Sept 25.
    var date = new Date(getValueForHeaderField(headers, 'Date'));
    m.date = date.toDateString().split(' ').slice(1, 3).join(' ');
    m.time = date.toTimeString().split(':').slice(0,2).join(':');
    m.to = getValueForHeaderField(headers, 'To');
    m.subject = getValueForHeaderField(headers, 'Subject');
    // if (typeof(m.subject) != 'undefined' && m.subject.length > SUBJECT_MAX_LENGTH){
    	// console.log("Defined");
    // 	m.subject = m.subject.substring(0, SUBJECT_MAX_LENGTH) + "..."
    // }
    var fromHeaders = getValueForHeaderField(headers, 'From');
    var fromHeaderMatches = fromHeaders.match(FROM_HEADER_REGEX);

    m.from = {};

    // Use name if one was found. Otherwise, use email address.
    if (fromHeaderMatches) {
      // If no a name, use email address for displayName.
      m.from.name = fromHeaderMatches[1].length ? fromHeaderMatches[1] :
                                                  fromHeaderMatches[2];
      m.from.email = fromHeaderMatches[2];
    } else {
      m.from.name = fromHeaders.split('@')[0];
      m.from.email = fromHeaders;
    }
    m.from.name = m.from.name.split('@')[0]; // Ensure email is split.

    m.from.initial = m.from.name[0]
    // m.initial = m.from.name[0]
    m.from.initial_color = letterColors[m.from.name.toUpperCase()[0]]

    // m.unread = m.labelIds.indexOf(Labels.UNREAD) != -1;
    // m.starred = m.labelIds.indexOf(Labels.STARRED) != -1;
  }

  return messages;
}
desktopNotifyNewEmail = function(subject, body){
	Notification.requestPermission(function (permission) {
	  if (permission !== 'granted') return;
	  var notification = new Notification(subject, {
	    icon: 'images/inbox-logo.png',
	    body: body,
	  });
	  notification.onclick = function () {
	    window.focus();
	  };
	});
}
desktopNotifyNewEmails = function(length){
	Notification.requestPermission(function (permission) {
	  if (permission !== 'granted') return;
	  var notification = new Notification(length + " New Emails", {
	    icon: 'images/inbox-logo.png',
	    body: "You have new emails arrived",
	  });
	  notification.onclick = function () {
	    window.focus();
	  };
	});
}