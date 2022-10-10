/**
 * generated secret
 * temporary key, works till 2022-10-01 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"1CB2E8A7-9199-45EE-8499-FA37C60E2907"}
 */
var clientSecret = '';

/**
 * client-id, generated by Azure unpon registration
 * @type {String}
 *
 * @properties={typeid:35,uuid:"FCC332C7-04AD-4F61-99B0-3235A31802E3"}
 */
var clientId = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"DE6EDB03-6936-44AA-90DC-F7E6EC074DD6"}
 */
var tenantId = '';
/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"78DC91AD-4FAE-4157-A287-4EBBAD6EDC71"}
 */
var state = 'SecretSauce22';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"A0CCF6A0-8F9D-4678-9395-4D65CD2D6460"}
 */
var idToken = '';

/**
 * @type {String}
 * @properties={typeid:35,uuid:"E2328962-8ADD-4E43-BCB5-9E8C7A0CEE9B"}
 */
var accessToken = null;

/**
 * @type {String}
 * @properties={typeid:35,uuid:"B9A70E1B-EF19-4067-8945-8E029BC2B7D3"}
 */
var refreshToken = null;

/**
 * @type {Date}
 * @properties={typeid:35,uuid:"51EE3C27-E00E-4502-A4C3-80A2554DB120",variableType:93}
 */
var accessTokenExpiresOn = null;

/**
 * @type {plugins.oauth.OAuthService}
 * @properties={typeid:35,uuid:"40B1D210-38DA-417C-B12C-F3478273D4D9",variableType:-4}
 */
var office365Service = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"DF63416E-DCCF-4F3F-8843-ABE4144DFCFE"}
 */
var scope = 'openid\noffline_access\nhttps://outlook.office365.com/Mail.Read\nhttps://outlook.office365.com/Mail.Read.Shared\nhttps://outlook.office365.com/Mail.ReadBasic\nhttps://outlook.office365.com/Mail.ReadWrite\nhttps://outlook.office365.com/Mail.ReadWrite.Shared\nhttps://outlook.office365.com/Mail.Send\nhttps://outlook.office365.com/Mail.Send.Shared\nhttps://outlook.office365.com/SMTP.Send\nhttps://outlook.office365.com/User.Read';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"C854E2A0-C0FF-4C00-B850-E7E736663A7C"}
 */
var redirectUrl = 'http://localhost:8183/solutions/office365_test/m/onO365Authorize';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"C9E93C3A-0D2B-4288-A63C-CEF40FABE420"}
 */
var email_from = '';

/**
 * @type {String}
 *
 *
 * @properties={typeid:35,uuid:"06D80FCF-94D9-4189-BA0D-0E92A11B3EFC"}
 */
var email_to = '';

/**
 * @type {String}
 *
 *
 * @properties={typeid:35,uuid:"C7B1201A-8C9A-4248-A8B7-45EF324EBC1F"}
 */
var email_subject = 'subject';

/**
 * @type {String}
 *
 *
 * @properties={typeid:35,uuid:"B21379D1-84A8-44FA-88E1-88E2D90E9226"}
 */
var email_body = 'email_body';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"8971A239-158A-4D26-9640-CF53E0949720"}
 */
var email_inbox_info = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"C4F7F475-59F7-492F-A034-9319B1F7EE93"}
 */
var email_folder_info = '';

/**
 * Using the OAuth-Service to get new refresh_token/access_token 
 * @param result
 * @param auth_outcome
 *
 * @properties={typeid:24,uuid:"674ACAE4-920C-4C12-8622-A32DD128F86E"}
 */
function onO365Authorize(result, auth_outcome) {
	if (result) {
		//SUCCESS
		/** @type {plugins.oauth.OAuthService} */
		office365Service = auth_outcome;
		idToken = office365Service.getIdToken();
		accessToken = office365Service.getAccessToken()
		refreshToken = office365Service.getRefreshToken();
		accessTokenExpiresOn = new Date(new Date().getTime() + 1000*office365Service.getAccessTokenLifetime());
		if (!accessToken) {
			application.output('could not get token from service.');
			return;
		}
	} else {
		//ERROR
		application.output("ERROR " + auth_outcome, LOGGINGLEVEL.ERROR);
	}
}

/**
 * the function that starts it all; 
 * @properties={typeid:24,uuid:"1F64392F-2D0D-40BD-BF84-E49473A8EB4E"}
 */
function authO365_getCode() {
	var oauthOffice365 = plugins.oauth.serviceBuilder(clientId);        
	oauthOffice365.clientSecret(clientSecret);        
    oauthOffice365.defaultScope(scope.split('\n').join(' ')); 
	if (tenantId) {
		oauthOffice365.tenant(tenantId);
	}
    oauthOffice365.state(state)                       
    oauthOffice365.deeplink("onO365Authorize")
    oauthOffice365.callback(onO365Authorize, 30)
	oauthOffice365.responseMode('query');
    oauthOffice365.responseType('code');
    oauthOffice365.build(plugins.oauth.OAuthProviders.MICROSOFT_AD);
}

/**
 * When there's an existing (and valid) refresh_token you can get a 
 * fresh set of access_token and refresh_token manually
 * 
 * @properties={typeid:24,uuid:"7E5F39AE-2774-4DCB-9331-7DC6F5CBA6A0"}
 */
function refreshAccessToken() {
	if (!refreshToken) {
		return;
	}
	var httpClient = plugins.http.createNewHttpClient();
	var request = httpClient.createPostRequest('https://login.microsoftonline.com/common/oauth2/v2.0/token');
	request.addHeader('Content-Type', 'application/x-www-form-urlencoded');
	var bodyContent = 'client_id='+clientId;
	bodyContent += '&grant_type=refresh_token';
	bodyContent += '&scope='+scope.split('\n').join(' ');
	bodyContent += '&refresh_token='+refreshToken;
	bodyContent += '&client_secret='+clientSecret;
	request.setBodyContent(bodyContent);

	var start = new Date();
	var response = request.executeRequest();
	var statusCode = response.getStatusCode()
	if (statusCode != 200) {
		application.output('Error processing request, Statuscode ' + statusCode.toString() + '\n' + response.getResponseBody());
		return;
	} else {
		/** @type {{token_type: String, scope: String, expires_in: Number, ext_expires_in: Number, access_token: String, refresh_token: String, id_token: String}} */
		var accessTokenObject = JSON.parse(response.getResponseBody());
		accessToken = accessTokenObject.access_token;
		refreshToken = accessTokenObject.refresh_token;
		accessTokenExpiresOn = new Date(start.getTime()  + accessTokenObject.expires_in*1000);
		idToken = accessTokenObject.id_token;
	}
}

/**
 * uses the access_token to authenticate
 * @properties={typeid:24,uuid:"66279104-70F9-4088-999A-AD0471CA2786"}
 */
function getImapFolders() {
	var imapAccount = plugins.MailPro.ImapAccount('emailaccount', 'outlook.office365.com', email_from, accessToken);
	imapAccount.port = 993
	var props = {
		"mail.imap.fetchsize": java.lang.Integer.parseInt('1048576'),
		"mail.imaps.fetchsize": java.lang.Integer.parseInt('1048576'),
		"mail.imap.connectionpoolsize": "10",
		"mail.imaps.connectionpoolsize": "10",
		'mail.imaps.starttls.enable': true,
		'mail.imap.starttls.enable': true,
		"mail.imap.ssl.enable": true,
		"mail.imaps.ssl.enable": true,
		"mail.imap.auth.mechanisms": "XOAUTH2",
		"mail.imap.auth.plain.disable": true,
		"mail.imaps.auth.mechanisms": "XOAUTH2",
		"mail.imaps.auth.plain.disable": true
	};

	var rootFolder = imapAccount.connect(props);
	if (!rootFolder || !imapAccount.connected) {
		if (imapAccount.getLastError()) {
			throw imapAccount.getLastError();
		} else {
			return;
		}
	}
	var folder = imapAccount.getRootFolder()
	var subFolders = folder.getSubfolders();
	for (var iFolders = 1; iFolders < subFolders.length; iFolders++) {
		try {
			email_folder_info += subFolders[iFolders].fullName + '\n';
		} catch (e) {
			application.output('Error Accessing Folder: ' + e.name + ' -> ' + e.message + '\n' + e.stack,LOGGINGLEVEL.ERROR)
			break;
		}
	}
}

/**
 * uses the access_token to authenticate
 * @properties={typeid:24,uuid:"5A1F2AC8-8A94-40F4-8099-2DED882EAFBE"}
 */
function getImapMails() {
	var imapAccount = plugins.MailPro.ImapAccount('emailaccount', 'outlook.office365.com', email_from, accessToken);
	imapAccount.port = 993
	var props = {
		"mail.imap.fetchsize": java.lang.Integer.parseInt('1048576'),
		"mail.imaps.fetchsize": java.lang.Integer.parseInt('1048576'),
		"mail.imap.connectionpoolsize": "10",
		"mail.imaps.connectionpoolsize": "10",
		'mail.imaps.starttls.enable': true,
		'mail.imap.starttls.enable': true,
		"mail.imap.ssl.enable": true,
		"mail.imaps.ssl.enable": true,
		"mail.imap.auth.mechanisms": "XOAUTH2",
		"mail.imap.auth.plain.disable": true,
		"mail.imaps.auth.mechanisms": "XOAUTH2",
		"mail.imaps.auth.plain.disable": true
	};

	var rootFolder = imapAccount.connect(props);
	if (!rootFolder || !imapAccount.connected) {
		if (imapAccount.getLastError()) {
			throw imapAccount.getLastError();
		} else {
			return;
		}
	}
	var folder = imapAccount.getFolder('INBOX');
	if (folder) {
		var messageCount = folder.getMessageCount()
		var messageUIDsFolder = folder.getMessageUids()
		email_inbox_info = 'there are ' + messageCount.toString() + ' messages in the folder:\n' + messageUIDsFolder.join(', ');
	}
}

/**
 * @properties={typeid:24,uuid:"3B96DE36-DA6F-4A40-BDFD-DEA1C67A879A"}
 */
function sendSMTPMailPro() {
	var smtpAccount = plugins.MailPro.SMTPAccount('smtp.office365.com');
	smtpAccount.port = 587;
	smtpAccount.userName = email_from;
	smtpAccount.requiresAuthentication = true;
	smtpAccount.useTLS = true;
	smtpAccount.password =  accessToken;
	smtpAccount.addSmtpProperty('mail.smtp.auth.mechanisms','XOAUTH2');
	smtpAccount.addSmtpProperty('mail.imap.sasl.enable', 'true');
	var connect = smtpAccount.connect();
	if (connect && smtpAccount.connected) {
		var mailMsg = smtpAccount.createMessage(email_to,email_from,email_subject,email_body);
		var success = smtpAccount.sendMessage(mailMsg);
		if (success) {
			application.output('message sent successfully.')
		}
	}
}

/**
 * @properties={typeid:24,uuid:"EDD0F148-059C-4B96-A204-00AE59F4110F"}
 */
function sentSMTPServoyMail() {
	var mailProperties = new Array();
	mailProperties.push('mail.smtp.starttls.enable=true')
	mailProperties.push('mail.transport.protocol=smtp')
	mailProperties.push('security.require-ssl=true')
	mailProperties.push('mail.smtp.auth=true')
	mailProperties.push('mail.smtp.auth.mechanisms=XOAUTH2');
	mailProperties.push('mail.imap.sasl.enable=true');
	mailProperties.push('mail.smtp.auth=true');
	mailProperties.push('mail.smtp.port=587');
	mailProperties.push('mail.smtp.host=smtp.office365.com');
	mailProperties.push('mail.smtp.auth=true');
	mailProperties.push('mail.smtp.username='+email_from);
	mailProperties.push('mail.smtp.password='+accessToken);
	plugins.mail.sendMail(email_to,email_from,email_subject,email_body,null,null,null,mailProperties);
}