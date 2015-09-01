toggleDrawer = function(){
	drawer = document.querySelector('#drawerPanel');
	drawer.togglePanel();
}

goback = function(backto){
	app.email_subject = "";
	app.email_body = "";
	app.main_page = 0;
}